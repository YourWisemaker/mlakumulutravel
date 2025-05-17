import { Module } from "@nestjs/common";
import { SentimentService } from "./sentiment.service";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [SentimentService],
  exports: [SentimentService],
})
export class SentimentModule {}
