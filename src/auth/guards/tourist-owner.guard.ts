import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TouristOwnerGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // If user is an employee, they have access to all resources
    if (user.role && user.role.toUpperCase() === 'EMPLOYEE') {
      return true;
    }
    
    // If user is not a tourist, deny access
    if (!user || !user.role || user.role.toUpperCase() !== 'TOURIST') {
      throw new ForbiddenException('Access denied');
    }
    
    // Get the touristId parameter
    let touristId = request.params.touristId || request.params.id;
    
    // For routes like /trips/:id, we need to check if the trip belongs to the user's tourist
    if (request.params.id && request.route.path.includes('/trips/:id')) {
      const trip = await this.prisma.trip.findUnique({
        where: { id: request.params.id },
        select: { touristId: true },
      });
      
      if (!trip) {
        return false;
      }
      
      touristId = trip.touristId;
    }
    
    // For feedback endpoints
    if (request.params.id && request.route.path.includes('/feedback/:id')) {
      const feedback = await this.prisma.feedback.findUnique({
        where: { id: request.params.id },
        include: { trip: true },
      });
      
      if (!feedback) {
        return false;
      }
      
      touristId = feedback.trip.touristId;
    }
    
    // If no touristId was found in the request, deny access
    if (!touristId) {
      return false;
    }
    
    // Find the tourist associated with the authenticated user
    const tourist = await this.prisma.tourist.findUnique({
      where: { userId: user.id },
    });
    
    if (!tourist) {
      return false;
    }
    
    // Allow access only if the requested touristId matches the user's touristId
    return tourist.id === touristId;
  }
}
