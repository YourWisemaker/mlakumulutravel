import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find all transactions with related data
   */
  async findAll(): Promise<any[]> {
    // Using Prisma client to fetch all transactions with related data
    return await this.prisma.$queryRaw<any[]>`
      SELECT t.*, 
             u."firstName" as "createdByFirstName", 
             u."lastName" as "createdByLastName",
             tu."firstName" as "touristFirstName",
             tu."lastName" as "touristLastName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."createdById" = u.id
      LEFT JOIN "Tourist" tr ON t."touristId" = tr.id
      LEFT JOIN "User" tu ON tr."userId" = tu.id
      ORDER BY t."transactionDate" DESC
    `;
  }

  /**
   * Find a single transaction by its ID
   */
  async findOne(id: string): Promise<any> {
    const transactions = await this.prisma.$queryRaw<any[]>`
      SELECT t.*, 
             u."firstName" as "createdByFirstName", 
             u."lastName" as "createdByLastName",
             tu."firstName" as "touristFirstName",
             tu."lastName" as "touristLastName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."createdById" = u.id
      LEFT JOIN "Tourist" tr ON t."touristId" = tr.id
      LEFT JOIN "User" tu ON tr."userId" = tu.id
      WHERE t.id = ${id}
    `;
    
    if (!transactions || transactions.length === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    
    const transaction = transactions[0];
    
    // Get transaction details
    const details = await this.findTransactionDetailsByTransactionId(id);
    transaction.details = details;
    
    return transaction;
  }

  /**
   * Find all transactions for a specific tourist
   */
  async findByTouristId(touristId: string): Promise<any[]> {
    // First check if the tourist exists
    const tourist = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Tourist" WHERE id = ${touristId}
    `;
    
    if (!tourist || tourist.length === 0) {
      return []; // Return empty array if tourist doesn't exist
    }
    
    return await this.prisma.$queryRaw<any[]>`
      SELECT t.*, 
             u."firstName" as "createdByFirstName", 
             u."lastName" as "createdByLastName",
             tu."firstName" as "touristFirstName",
             tu."lastName" as "touristLastName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."createdById" = u.id
      LEFT JOIN "Tourist" tr ON t."touristId" = tr.id
      LEFT JOIN "User" tu ON tr."userId" = tu.id
      WHERE t."touristId" = ${touristId}
      ORDER BY t."transactionDate" DESC
    `;
  }

  /**
   * Find all transactions related to a specific trip
   */
  async findByTripId(tripId: string): Promise<any[]> {
    // First check if the trip exists
    const trip = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Trip" WHERE id = ${tripId}
    `;
    
    if (!trip || trip.length === 0) {
      return []; // Return empty array if trip doesn't exist
    }
    
    // Find transaction IDs related to this trip via transaction details
    const transactionDetails = await this.prisma.$queryRaw<any[]>`
      SELECT DISTINCT "transactionId" 
      FROM "TransactionDetail" 
      WHERE "tripId" = ${tripId}
    `;
    
    if (!transactionDetails || transactionDetails.length === 0) {
      return [];
    }
    
    // Extract transaction IDs
    const transactionIds = transactionDetails.map(detail => detail.transactionId);
    
    // Use a string with commas for the IN clause
    const idsString = transactionIds.map(id => `'${id}'`).join(",");
    
    // Get the transactions
    return await this.prisma.$queryRaw<any[]>`
      SELECT t.*, 
             u."firstName" as "createdByFirstName", 
             u."lastName" as "createdByLastName",
             tu."firstName" as "touristFirstName",
             tu."lastName" as "touristLastName"
      FROM "Transaction" t
      LEFT JOIN "User" u ON t."createdById" = u.id
      LEFT JOIN "Tourist" tr ON t."touristId" = tr.id
      LEFT JOIN "User" tu ON tr."userId" = tu.id
      WHERE t.id IN (${this.prisma.$queryRawUnsafe(idsString)})
      ORDER BY t."transactionDate" DESC
    `;
  }

  /**
   * Find all transaction details for a specific transaction
   */
  async findTransactionDetailsByTransactionId(transactionId: string): Promise<any[]> {
    // First check if the transaction exists
    const transaction = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM "Transaction" WHERE id = ${transactionId}
    `;
    
    if (!transaction || transaction.length === 0) {
      throw new NotFoundException(`Transaction with ID ${transactionId} not found`);
    }
    
    // Get transaction details with trip information
    return await this.prisma.$queryRaw`
      SELECT td.*, t."name" as "tripName", t."destination" as "tripDestination", t."price" as "tripPrice" 
      FROM "TransactionDetail" td
      LEFT JOIN "Trip" t ON td."tripId" = t.id
      WHERE td."transactionId" = ${transactionId}
      ORDER BY td."createdAt" ASC
    `;
  }
}
