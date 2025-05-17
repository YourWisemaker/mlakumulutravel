import { Injectable, NotFoundException } from "@nestjs/common";
import {
  SentimentService,
  type SentimentResult as _SentimentResult,
} from "../sentiment/sentiment.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FeedbackService {
  constructor(
    private prisma: PrismaService,
    private sentimentService: SentimentService,
  ) {}

  async findAll() {
    return this.prisma.feedback.findMany({
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

    return feedback;
  }

  async findByTrip(tripId: string) {
    return this.prisma.feedback.findMany({
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
  }

  async findByTourist(touristId: string) {
    return this.prisma.feedback.findMany({
      where: { touristId },
      include: {
        trip: true,
        sentimentAnalysis: true,
      },
    });
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
    const tourist = await this.prisma.tourist.findUnique({
      where: { userId },
    });

    if (!tourist) {
      throw new NotFoundException(
        `Tourist profile not found for user ID ${userId}`,
      );
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

  async remove(id: string): Promise<void> {
    // First ensure the feedback exists
    await this.findOne(id);

    // Delete the associated sentiment analysis record first
    // We need to get the sentimentAnalysisId from the feedback first
    const feedback = await this.prisma.feedback.findUnique({
      where: { id },
      select: { sentimentAnalysisId: true },
    });

    if (feedback?.sentimentAnalysisId) {
      await this.prisma.sentimentAnalysis.delete({
        where: { id: feedback.sentimentAnalysisId },
      });
    }

    // Then delete the feedback
    await this.prisma.feedback.delete({
      where: { id },
    });
  }
}
