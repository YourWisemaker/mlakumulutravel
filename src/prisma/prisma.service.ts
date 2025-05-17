import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor() {
    // Create a new PrismaClient with Railway compatibility
    this.prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        },
      },
    });
    
    // Note: Prisma Accelerate is configured at the connection string level in Railway
    // DATABASE_URL would contain the Accelerate URL if provided through Railway
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    // Use Prisma's transaction to ensure all deletes succeed or fail together
    return this.prisma.$transaction([
      this.prisma.feedback.deleteMany(),
      this.prisma.sentimentAnalysis.deleteMany(),
      this.prisma.trip.deleteMany(),
      this.prisma.tourist.deleteMany(),
      this.prisma.employee.deleteMany(),
      this.prisma.user.deleteMany(),
    ]);
  }
  
  // Expose Prisma models through getters
  get user() { return this.prisma.user; }
  get employee() { return this.prisma.employee; }
  get tourist() { return this.prisma.tourist; }
  get trip() { return this.prisma.trip; }
  get feedback() { return this.prisma.feedback; }
  get sentimentAnalysis() { return this.prisma.sentimentAnalysis; }
  get transaction() { return this.prisma.transaction; }
  get transactionDetail() { return this.prisma.transactionDetail; }
  
  // Forward transaction and raw query methods
  $transaction(arg: any): Promise<any> {
    return this.prisma.$transaction(arg);
  }
  
  $queryRaw<T = any>(query: any, ...values: any[]): Promise<T> {
    return this.prisma.$queryRaw(query, ...values);
  }
  
  $queryRawUnsafe<T = any>(query: string, ...values: any[]): Promise<T> {
    return this.prisma.$queryRawUnsafe(query, ...values);
  }
  
  $executeRaw(query: any, ...values: any[]): Promise<number> {
    return this.prisma.$executeRaw(query, ...values);
  }
  
  $executeRawUnsafe(query: string, ...values: any[]): Promise<number> {
    return this.prisma.$executeRawUnsafe(query, ...values);
  }
}
