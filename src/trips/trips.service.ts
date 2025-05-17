import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { v4 as uuidv4 } from 'uuid';
// Unused import prefixed with underscore to satisfy linting rules
import { Decimal as _Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.trip.findMany({
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
        feedbacks: true,
      },
    });
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
      },
    });

    if (!trip) {
      throw new NotFoundException(`Trip with ID ${id} not found`);
    }

    return trip;
  }

  async findAllByTourist(touristId: string) {
    return this.prisma.trip.findMany({
      where: { touristId },
      include: {
        feedbacks: {
          include: {
            sentimentAnalysis: true,
          },
        },
      },
    });
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

  async create(createTripDto: CreateTripDto, employeeId?: string) {
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
      const refNum = `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
      const transactionDate = new Date();
      const notes = `Payment for trip: ${trip.name}`;
      
      // Insert the transaction
      const transactionResult = await this.prisma.$queryRaw<any[]>`
        INSERT INTO "Transaction" (
          "id", "transactionDate", "amount", "status", "paymentMethod", 
          "referenceNumber", "notes", "touristId", "createdById", "createdAt", "updatedAt"
        ) VALUES (
          ${uuidv4()}, ${transactionDate}, ${trip.price}, 'PENDING', 'CREDIT_CARD',
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
            ${uuidv4()}, ${trip.price}, ${`Payment for ${trip.name} to ${trip.tripDestination}`},
            ${transactionId}, ${trip.id}, ${transactionDate}, ${transactionDate}
          )
        `;
      }
    }
    
    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto) {
    // First ensure the trip exists
    await this.findOne(id);

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

    return this.prisma.trip.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, employeeId?: string): Promise<void> {
    // First ensure the trip exists and get its details
    const trip = await this.findOne(id);
    
    // First get the existing transaction details for this trip
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
          ${uuidv4()}, ${transactionDate}, ${trip.price}, 'REFUNDED', ${paymentMethod},
          ${refNum}, ${notes}, ${trip.touristId}, ${employeeId}, ${transactionDate}, ${transactionDate}
        ) RETURNING "id"
      `;
      
      if (transactionResult && transactionResult.length > 0) {
        const transactionId = transactionResult[0].id;
        
        // Insert the transaction detail with negative amount for refund
        await this.prisma.$queryRaw`
          INSERT INTO "TransactionDetail" (
            "id", "amount", "description", "transactionId", "tripId", "createdAt", "updatedAt"
          ) VALUES (
            ${uuidv4()}, ${-Number(trip.price)}, ${`Refund for cancelled trip: ${trip.name} to ${trip.tripDestination}`},
            ${transactionId}, ${trip.id}, ${transactionDate}, ${transactionDate}
          )
        `;
      }
    }
    
    // Delete any existing transaction details for this trip
    await this.prisma.$queryRaw`
      DELETE FROM "TransactionDetail" WHERE "tripId" = ${id}
    `;
    
    // Finally delete the trip
    await this.prisma.trip.delete({
      where: { id },
    });
  }
}
