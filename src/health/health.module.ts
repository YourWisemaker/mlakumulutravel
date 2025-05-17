import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { DbHealthIndicator } from './db.health';

@Module({
  imports: [
    TerminusModule,
    PrismaModule,
  ],
  controllers: [HealthController],
  providers: [DbHealthIndicator],
})
export class HealthModule {}
