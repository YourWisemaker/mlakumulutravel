import { Injectable, NotFoundException } from "@nestjs/common";
import {
  SentimentService,
  type SentimentResult as _SentimentResult,
} from "../sentiment/sentiment.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { UpdateFeedbackDto } from "./dto/update-feedback.dto";
import { PrismaService } from "../prisma/prisma.service";
import { excludePassword } from "../common/utils/exclude-password.util";

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private sentimentService: SentimentService,
  ) {}

  async findAll() {
    const feedbacks = await this.prisma.feedback.findMany({
      include: {
        trip: true,
        tourist: {
          include: {
            user: true,
          },
        },
        sentimentAnalysis: true,
      },
    });
    
    // Remove passwords from the user data
    return feedbacks.map(feedback => ({
      ...feedback,
      tourist: feedback.tourist ? {
        ...feedback.tourist,
        user: excludePassword(feedback.tourist.user)
      } : feedback.tourist
    }));
  }

  async findOne(id: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      include: {
        trip: true,
        tourist: {
          include: {
            user: true,
          },
        },
        sentimentAnalysis: true,
      },
    });

    if (!feedback) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    
    // Remove password from the user data
    return {
      ...feedback,
      tourist: feedback.tourist ? {
        ...feedback.tourist,
        user: excludePassword(feedback.tourist.user)
      } : feedback.tourist
    };
  }

  async findByTrip(tripId: string) {
    const feedbacks = await this.prisma.feedback.findMany({
      where: { tripId },
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
        sentimentAnalysis: true,
      },
    });
    
    // Remove passwords from the user data
    return feedbacks.map(feedback => ({
      ...feedback,
      tourist: feedback.tourist ? {
        ...feedback.tourist,
        user: excludePassword(feedback.tourist.user)
      } : feedback.tourist
    }));
  }

  async findByTourist(userId: string) {
    // First, find the tourist ID associated with this user ID
    const tourist = await this.prisma.tourist.findFirst({
      where: { userId },
    });
    
    if (!tourist) {
      return []; // If no tourist found for this user ID, return empty array
    }
    
    // Now use the tourist ID to find feedbacks
    const feedbacks = await this.prisma.feedback.findMany({
      where: { touristId: tourist.id },
      include: {
        trip: true,
        sentimentAnalysis: true,
        tourist: {
          include: {
            user: true,
          },
        },
      },
    });
    
    // Remove passwords from the user data
    return feedbacks.map(feedback => ({
      ...feedback,
      tourist: feedback.tourist ? {
        ...feedback.tourist,
        user: excludePassword(feedback.tourist.user)
      } : feedback.tourist
    }));
  }

  async create(userId: string, createFeedbackDto: CreateFeedbackDto) {
    // Find the trip
    const trip = await this.prisma.trip.findUnique({
      where: { id: createFeedbackDto.tripId },
      include: {
        tourist: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException(
        `Trip with ID ${createFeedbackDto.tripId} not found`,
      );
    }

    // Find the tourist by user ID
    let tourist = await this.prisma.tourist.findUnique({
      where: { userId },
    });

    // If no tourist profile exists, create a basic one
    if (!tourist) {
      // First verify the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }
      
      // Create a basic tourist profile
      tourist = await this.prisma.tourist.create({
        data: {
          // Set basic placeholder values that can be updated later
          passportNumber: 'PENDING',
          nationality: 'PENDING',
          phoneNumber: user.email || 'PENDING', // Use email as contact if available
          address: 'PENDING',
          user: {
            connect: { id: userId },
          },
        },
      });
    }

    // Analyze sentiment
    const sentimentAnalysis = await this.sentimentService.analyzeSentiment(
      createFeedbackDto.comment,
    );

    // Create the feedback with sentiment analysis
    return this.prisma.feedback.create({
      data: {
        rating: createFeedbackDto.rating,
        comment: createFeedbackDto.comment,
        trip: {
          connect: { id: trip.id },
        },
        tourist: {
          connect: { id: tourist.id },
        },
        sentimentAnalysis: {
          create: {
            sentiment: sentimentAnalysis.type || "NEUTRAL",
            confidence: sentimentAnalysis.confidence || 0,
            rawAnalysis: JSON.stringify(sentimentAnalysis), // Store the full analysis as JSON string
          },
        },
      },
      include: {
        trip: true,
        tourist: {
          include: {
            user: true,
          },
        },
        sentimentAnalysis: true,
      },
    });
  }

  async update(id: string, userId: string, updateFeedbackDto: UpdateFeedbackDto) {
    // First ensure the feedback exists
    const existingFeedback = await this.findOne(id);
    
    // Verify the user owns this feedback or is an employee
    const userTourist = await this.prisma.tourist.findUnique({
      where: { userId },
      include: { user: true }
    });
    
    // If not found or not the owner (and not an employee), throw error
    if (!userTourist) {
      throw new NotFoundException(`Tourist profile not found for user ID ${userId}`);
    }
    
    const isOwner = existingFeedback.tourist.id === userTourist.id;
    const isEmployee = userTourist.user.role === 'EMPLOYEE';
    
    if (!isOwner && !isEmployee) {
      throw new NotFoundException(`Feedback with ID ${id} not found`);
    }
    
    // Prepare data for update
    const data: any = {};
    
    if (updateFeedbackDto.rating !== undefined) {
      data.rating = updateFeedbackDto.rating;
    }
    
    if (updateFeedbackDto.comment !== undefined) {
      data.comment = updateFeedbackDto.comment;
      
      // If comment is updated, reanalyze sentiment
      const sentimentAnalysis = await this.sentimentService.analyzeSentiment(
        updateFeedbackDto.comment
      );
      
      // If there's an existing sentiment analysis, update it
      if (existingFeedback.sentimentAnalysisId) {
        await this.prisma.sentimentAnalysis.update({
          where: { id: existingFeedback.sentimentAnalysisId },
          data: {
            sentiment: sentimentAnalysis.type,
            confidence: sentimentAnalysis.confidence,
            rawAnalysis: sentimentAnalysis.raw || {}
          }
        });
      } else {
        // If no existing sentiment analysis, create a new one
        const newSentimentAnalysis = await this.prisma.sentimentAnalysis.create({
          data: {
            sentiment: sentimentAnalysis.type,
            confidence: sentimentAnalysis.confidence,
            rawAnalysis: sentimentAnalysis.raw || {}
          },
        });
        
        data.sentimentAnalysisId = newSentimentAnalysis.id;
      }
    }
    
    // Update the feedback
    const updatedFeedback = await this.prisma.feedback.update({
      where: { id },
      data,
      include: {
        trip: true,
        tourist: {
          include: {
            user: true,
          },
        },
        sentimentAnalysis: true,
      },
    });
    
    // Remove password from response
    return {
      ...updatedFeedback,
      tourist: updatedFeedback.tourist ? {
        ...updatedFeedback.tourist,
        user: excludePassword(updatedFeedback.tourist.user)
      } : updatedFeedback.tourist
    };
  }

  async remove(id: string, userId?: string): Promise<any> {
    // First ensure the feedback exists and save the data for response
    const existingFeedback = await this.findOne(id);
    
    // If userId is provided, check if user is the owner or an employee
    if (userId) {
      // Find the tourist associated with the user
      const userTourist = await this.prisma.tourist.findUnique({
        where: { userId },
        include: { user: true },
      });
      
      // If not found, throw error
      if (!userTourist) {
        throw new NotFoundException(`Tourist profile not found for user ID ${userId}`);
      }
      
      const isOwner = existingFeedback.tourist.id === userTourist.id;
      const isEmployee = userTourist.user.role === 'EMPLOYEE';
      
      // If not the owner and not an employee, deny access
      if (!isOwner && !isEmployee) {
        throw new NotFoundException(`Feedback with ID ${id} not found`);
      }
    }

    // Get the feedback with its sentiment analysis ID
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      select: { sentimentAnalysisId: true },
    });
    
    // Store the sentiment analysis ID if it exists
    const sentimentAnalysisId = feedback?.sentimentAnalysisId;

    // First, delete the feedback to remove the reference
    await this.prisma.feedback.delete({
      where: { id },
    });

    // Then, if sentiment analysis exists, delete it as well
    if (sentimentAnalysisId) {
      try {
        await this.prisma.sentimentAnalysis.delete({
          where: { id: sentimentAnalysisId },
        });
      } catch (error) {
        console.log(`Error deleting sentiment analysis ${sentimentAnalysisId}: ${error.message}`);
        // We can ignore this error since the feedback was already deleted
      }
    }
    
    // Return a success message along with the deleted feedback data
    return {
      message: "Feedback deleted successfully",
      feedback: {
        ...existingFeedback,
        deletedAt: new Date()
      }
    };
  }
}
