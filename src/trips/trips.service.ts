import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { v4 as uuidv4 } from 'uuid';
import { excludePassword } from "../common/utils/exclude-password.util";
// Unused import prefixed with underscore to satisfy linting rules
import { Decimal as _Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const trips = await this.prisma.trip.findMany({
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
        feedbacks: true,
        transactionDetails: {
          include: {
            transaction: true
          }
        }
      },
    });
    
    // Remove passwords from all trip tourist users
    return trips.map(trip => ({
      ...trip,
      tourist: trip.tourist ? {
        ...trip.tourist,
        user: excludePassword(trip.tourist.user)
      } : trip.tourist
    }));
  }

  async findOne(id: string) {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
        feedbacks: {
          include: {
            sentimentAnalysis: true,
          },
        },
        transactionDetails: {
          include: {
            transaction: true
          }
        }
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }
    
    // Remove password from the tourist's user data
    return {
      ...trip,
      tourist: trip.tourist ? {
        ...trip.tourist,
        user: excludePassword(trip.tourist.user)
      } : trip.tourist
    };
  }

  async findAllByTourist(touristId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { touristId },
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
        feedbacks: {
          include: {
            sentimentAnalysis: true,
          },
        },
        transactionDetails: {
          include: {
            transaction: true
          }
        }
      },
    });
    
    // Remove passwords from all trip tourist users
    return trips.map(trip => ({
      ...trip,
      tourist: trip.tourist ? {
        ...trip.tourist,
        user: excludePassword(trip.tourist.user)
      } : trip.tourist
    }));
  }

  async findAllByTouristUserId(userId: string) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { userId },
    });

    if (!tourist) {
      throw new NotFoundException(`Tourist with user ID ${userId} not found`);
    }

    return this.findAllByTourist(tourist.id);
  }

  async create(createTripDto: CreateTripDto, employeeId?: string, transactionData?: any) {
    // Get the tourist
    const tourist = await this.prisma.tourist.findUnique({
      where: { id: createTripDto.touristId },
    });

    if (!tourist) {
      throw new NotFoundException(
        `Tourist with ID ${createTripDto.touristId} not found`,
      );
    }
    
    // Create the trip first without transaction
    const trip = await this.prisma.trip.create({
      data: {
        name: createTripDto.name,
        startDateTime: new Date(createTripDto.startDateTime),
        endDateTime: new Date(createTripDto.endDateTime),
        tripDestination: createTripDto.tripDestination,
        description: createTripDto.description,
        price: createTripDto.price,
        tourist: {
          connect: { id: createTripDto.touristId },
        },
      },
    });
    
    // Only create transaction if employeeId is provided (means an employee is adding this trip)
    if (employeeId) {
      // 2. Create a transaction record using SQL
      const refNum = transactionData?.referenceNumber || `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
      const transactionDate = new Date();
      const notes = transactionData?.notes || `Payment for trip: ${trip.name}`;
      const paymentMethod = transactionData?.paymentMethod || 'CREDIT_CARD';
      
      // Insert the transaction
      const transactionResult = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "Transaction" (
          "id", "transactionDate", "amount", "status", "paymentMethod", 
          "referenceNumber", "notes", "touristId", "createdById", "createdAt", "updatedAt"
        ) VALUES (
          ${uuidv4()}, ${transactionDate}, ${trip.price}, 'COMPLETED'::"TransactionStatus", ${paymentMethod}::"PaymentMethod",
          ${refNum}, ${notes}, ${createTripDto.touristId}, ${employeeId}, ${transactionDate}, ${transactionDate}
        ) RETURNING "id"
      `;
      
      if (transactionResult && transactionResult.length > 0) {
        const transactionId = transactionResult[0].id;
        
        // Insert the transaction detail
        await this.prisma.$queryRaw`
          INSERT INTO "TransactionDetail" (
            "id", "amount", "description", "transactionId", "tripId", "createdAt", "updatedAt"
          ) VALUES (
            ${uuidv4()}, ${trip.price}, ${`Payment for ${trip.name} to ${typeof trip.tripDestination === 'object' ? 
              (trip.tripDestination && typeof trip.tripDestination === 'object' && 'location' in trip.tripDestination ? 
                String(trip.tripDestination.location) : JSON.stringify(trip.tripDestination).substring(0, 50)) : 
              String(trip.tripDestination).substring(0, 50)}`},
            ${transactionId}, ${trip.id}, ${transactionDate}, ${transactionDate}
          )
        `;
      }
    }
    
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto, employeeId?: string, transactionData?: any) {
    // First ensure the trip exists and get current trip details
    const currentTrip = await this.findOne(id);

    // Prepare data for update
    const data: any = {};

    if (updateTripDto.name) data.name = updateTripDto.name;
    if (updateTripDto.description) data.description = updateTripDto.description;
    if (updateTripDto.price) data.price = updateTripDto.price;
    if (updateTripDto.tripDestination)
      data.tripDestination = updateTripDto.tripDestination;

    // Convert date strings to Date objects if they exist
    if (updateTripDto.startDateTime) {
      data.startDateTime = new Date(updateTripDto.startDateTime);
    }

    if (updateTripDto.endDateTime) {
      data.endDateTime = new Date(updateTripDto.endDateTime);
    }

    // Update the trip
    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data,
      include: {
        tourist: true,
        transactionDetails: {
          include: {
            transaction: true
          }
        }
      }
    });
    
    // Create transaction records if price changed and employee is updating
    if (employeeId && updateTripDto.price && Number(updateTripDto.price) !== Number(currentTrip.price)) {
      const priceDifference = Number(updateTripDto.price) - Number(currentTrip.price);
      const isRefund = priceDifference < 0;
      const transactionDate = new Date();
      const refNum = transactionData?.referenceNumber || `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
      
      // Create appropriate notes based on price change or use provided notes
      const notes = transactionData?.notes || (isRefund 
        ? `Refund for price adjustment on trip: ${updatedTrip.name}` 
        : `Additional payment for price adjustment on trip: ${updatedTrip.name}`);
      
      // Use provided payment method or default
      const paymentMethod = transactionData?.paymentMethod || 'CREDIT_CARD';
      
      // Set appropriate transaction status
      const status = isRefund ? 'REFUNDED' : 'COMPLETED';
      
      // Insert the transaction with absolute value of price difference
      const transactionResult = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "Transaction" (
          "id", "transactionDate", "amount", "status", "paymentMethod", 
          "referenceNumber", "notes", "touristId", "createdById", "createdAt", "updatedAt"
        ) VALUES (
          ${uuidv4()}, ${transactionDate}, ${Math.abs(priceDifference)}, ${status}::"TransactionStatus", ${paymentMethod}::"PaymentMethod",
          ${refNum}, ${notes}, ${updatedTrip.tourist.id}, ${employeeId}, ${transactionDate}, ${transactionDate}
        ) RETURNING "id"
      `;
      
      if (transactionResult && transactionResult.length > 0) {
        const transactionId = transactionResult[0].id;
        
        // Insert the transaction detail with the price difference information
        await this.prisma.$queryRaw`
          INSERT INTO "TransactionDetail" (
            "id", "amount", "description", "transactionId", "tripId", "createdAt", "updatedAt"
          ) VALUES (
            ${uuidv4()}, ${Math.abs(priceDifference)}, 
            ${`${isRefund ? 'Refund' : 'Additional payment'} due to price adjustment for ${updatedTrip.name} to ${typeof updatedTrip.tripDestination === 'object' ? 
              (updatedTrip.tripDestination && typeof updatedTrip.tripDestination === 'object' && 'location' in updatedTrip.tripDestination ? 
                String(updatedTrip.tripDestination.location) : JSON.stringify(updatedTrip.tripDestination).substring(0, 50)) : 
              String(updatedTrip.tripDestination).substring(0, 50)}`},
            ${transactionId}, ${id}, ${transactionDate}, ${transactionDate}
          )
        `;
      }
    }
    
    return updatedTrip;
  }

  async remove(id: string, employeeId?: string): Promise<any> {
    // First ensure the trip exists and get its details
    const trip = await this.findOne(id);
    
    // Clone trip data to return after deletion
    const tripData = {
      ...trip,
      deletedAt: new Date(),
      deleted: true
    };
    
    // Store refund transaction data if created
    let refundTransaction = null;
    
    // Get the existing transaction details for this trip
    const existingDetails = await this.prisma.$queryRaw<any[]>`
      SELECT td.*, t."paymentMethod"
      FROM "TransactionDetail" td
      JOIN "Transaction" t ON td."transactionId" = t."id"
      WHERE td."tripId" = ${id}
    `;
    
    // If this is an employee-initiated removal and the trip has a price, create a refund
    if (employeeId && Number(trip.price) > 0) {
      const refNum = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
      const transactionDate = new Date();
      const notes = `Refund for cancelled trip: ${trip.name}`;
      const paymentMethod = existingDetails.length > 0 ? 
        existingDetails[0].paymentMethod : 'CREDIT_CARD';
      
      // Insert the refund transaction
      const transactionResult = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "Transaction" (
          "id", "transactionDate", "amount", "status", "paymentMethod", 
          "referenceNumber", "notes", "touristId", "createdById", "createdAt", "updatedAt"
        ) VALUES (
          ${uuidv4()}, ${transactionDate}, ${trip.price}, 'REFUNDED'::"TransactionStatus", ${paymentMethod}::"PaymentMethod",
          ${refNum}, ${notes}, ${trip.touristId}, ${employeeId}, ${transactionDate}, ${transactionDate}
        ) RETURNING *
      `;
      
      if (transactionResult && transactionResult.length > 0) {
        // Store transaction info for response
        refundTransaction = transactionResult[0];
        const transactionId = transactionResult[0].id;
        
        // Insert the transaction detail with the refund amount
        await this.prisma.$queryRaw`
          INSERT INTO "TransactionDetail" (
            "id", "amount", "description", "transactionId", "tripId", "createdAt", "updatedAt"
          ) VALUES (
            ${uuidv4()}, ${trip.price}, ${`Refund for cancelled trip: ${trip.name} to ${typeof trip.tripDestination === 'object' ? 
              (trip.tripDestination && typeof trip.tripDestination === 'object' && 'location' in trip.tripDestination ? 
                String(trip.tripDestination.location) : JSON.stringify(trip.tripDestination).substring(0, 50)) : 
              String(trip.tripDestination).substring(0, 50)}`},
            ${transactionId}, ${id}, ${transactionDate}, ${transactionDate}
          )
        `;
      }
    }
    
    // First delete all transaction details associated with this trip
    try {
      // Get all transaction details for this trip
      const transactionDetails = await this.prisma.transactionDetail.findMany({
        where: { tripId: id },
      });
      
      // Delete all transaction details
      if (transactionDetails.length > 0) {
        await this.prisma.transactionDetail.deleteMany({
          where: { tripId: id },
        });
      }
      
      // Then delete the trip
      await this.prisma.trip.delete({
        where: { id },
      });
    } catch (error) {
      throw new Error(`Failed to delete trip: ${error.message}`);
    }
    
    // Return the deleted trip and refund information
    return {
      message: "Trip deleted successfully",
      deletedTrip: tripData,
      refundTransaction
    };
  }
}
