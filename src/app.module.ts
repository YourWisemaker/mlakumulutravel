import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { TouristsModule } from "./tourists/tourists.module";
import { TripsModule } from "./trips/trips.module";
import { FeedbackModule } from "./feedback/feedback.module";
import { ReportsModule } from "./reports/reports.module";
import { SentimentModule } from "./sentiment/sentiment.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Import PrismaModule for database access
    PrismaModule,
    UsersModule,
    AuthModule,
    TouristsModule,
    TripsModule,
    FeedbackModule,
    ReportsModule,
    SentimentModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
