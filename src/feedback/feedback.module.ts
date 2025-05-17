import { Module } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { FeedbackController } from "./feedback.controller";
import { SentimentModule } from "../sentiment/sentiment.module";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule, SentimentModule],
  providers: [FeedbackService],
  controllers: [FeedbackController],
  exports: [FeedbackService],
})
export class FeedbackModule {}
