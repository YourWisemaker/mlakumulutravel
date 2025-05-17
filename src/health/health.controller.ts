import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { DbHealthIndicator } from './db.health';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private dbHealthIndicator: DbHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  @ApiResponse({ status: 503, description: 'API is not healthy' })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Check database connection
      async () => this.dbHealthIndicator.isHealthy('database'),
      
      // Basic application status check
      async () => ({
        application: {
          status: 'up',
          environment: process.env.NODE_ENV || 'development',
          version: '1.0.0',
        }
      }),
    ]);
  }
}
