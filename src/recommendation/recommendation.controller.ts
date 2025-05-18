import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { RecommendationService, TripRecommendation } from './recommendation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TouristOwnerGuard } from '../auth/guards/tourist-owner.guard';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('trip-recommendations')
@Controller('trips/recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Get(':touristId')
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get AI-powered trip recommendations for a tourist (tourists can only access their own)' })
  @ApiResponse({
    status: 200,
    description: 'Returns recommended destination based on tourist history',
    schema: {
      type: 'object',
      properties: {
        destination: { type: 'string', example: 'Bangkok, Thailand' },
        activities: { type: 'string', example: '1. Explore the historic Grand Palace in Bangkok\n2. Visit the famous temples of Wat Arun and Wat Pho\n3. Relax on the beautiful beaches of Phuket\n4. Discover the bustling street markets in Chiang Mai\n5. Experience the vibrant nightlife in Pattaya' },
        reason: { type: 'string', example: 'Based on your past trips to cultural and beach destinations, Thailand offers a perfect mix of historical sites, beautiful beaches, and vibrant city experiences.' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Tourist not found' })
  @ApiResponse({ status: 400, description: 'Tourist has no trip history' })
  async getRecommendation(
    @Param('touristId') touristId: string,
    @Req() _req: any, // Using _ prefix to indicate unused parameter
  ): Promise<TripRecommendation> {
    return this.recommendationService.getTripRecommendation(touristId);
  }
}
