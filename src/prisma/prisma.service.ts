import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    // Use Prisma's transaction to ensure all deletes succeed or fail together
    return this.$transaction([
      this.feedback.deleteMany(),
      this.sentimentAnalysis.deleteMany(),
      this.trip.deleteMany(),
      this.tourist.deleteMany(),
      this.employee.deleteMany(),
      this.user.deleteMany(),
    ]);
  }
}
