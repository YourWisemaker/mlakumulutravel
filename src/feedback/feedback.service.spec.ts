import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { SentimentService } from '../sentiment/sentiment.service';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let _prismaService: PrismaService;
  let _sentimentService: SentimentService;

  const mockPrismaService = {
    feedback: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    trip: {
      findUnique: jest.fn(),
    },
    tourist: {
      findUnique: jest.fn(),
    },
    sentimentAnalysis: {
      create: jest.fn(),
    },
  };

  const mockSentimentService = {
    analyzeSentiment: jest.fn().mockReturnValue({ 
      score: 0.8,
      sentiment: 'NEUTRAL',
      confidence: 0
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SentimentService,
          useValue: mockSentimentService,
        },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    _prismaService = module.get<PrismaService>(PrismaService);
    _sentimentService = module.get<SentimentService>(SentimentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all feedback', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, comment: 'Great trip!', tripId: 'trip1' },
        { id: '2', rating: 4, comment: 'Good experience', tripId: 'trip2' },
      ];
      
      mockPrismaService.feedback.findMany.mockImplementation((_args) => {
        return Promise.resolve(mockFeedback);
      });

      const result = await service.findAll();
      
      expect(result).toEqual(mockFeedback);
      expect(mockPrismaService.feedback.findMany).toHaveBeenCalled();
      
      // Check that key properties were included
      const callArg = mockPrismaService.feedback.findMany.mock.calls[0][0];
      expect(callArg.include).toBeDefined();
      expect(callArg.include.trip).toBeDefined();
      expect(callArg.include.sentimentAnalysis).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a feedback if found', async () => {
      const mockFeedback = { 
        id: '1', 
        rating: 5, 
        comment: 'Great trip!', 
        tripId: 'trip1',
        trip: {
          tourist: {
            user: { name: 'User 1' },
          },
        },
        sentimentAnalysis: { score: 0.8 },
      };
      
      mockPrismaService.feedback.findUnique.mockImplementation((_args) => {
        return Promise.resolve(mockFeedback);
      });

      const result = await service.findOne('1');
      
      expect(result).toEqual(mockFeedback);
      expect(mockPrismaService.feedback.findUnique).toHaveBeenCalled();
      
      // Check that key properties were included
      const callArg = mockPrismaService.feedback.findUnique.mock.calls[0][0];
      expect(callArg.where).toEqual({ id: '1' });
      expect(callArg.include).toBeDefined();
      expect(callArg.include.trip).toBeDefined();
      expect(callArg.include.sentimentAnalysis).toBe(true);
    });

    it('should throw NotFoundException if feedback not found', async () => {
      mockPrismaService.feedback.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTrip', () => {
    it('should return all feedback for a specific trip', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, comment: 'Great trip!', tripId: 'trip1' },
        { id: '2', rating: 4, comment: 'Good experience', tripId: 'trip1' },
      ];
      
      mockPrismaService.feedback.findMany.mockImplementation((_args) => {
        return Promise.resolve(mockFeedback);
      });

      const result = await service.findByTrip('trip1');
      
      expect(result).toEqual(mockFeedback);
      expect(mockPrismaService.feedback.findMany).toHaveBeenCalled();
      
      // Check that key properties were included
      const callArg = mockPrismaService.feedback.findMany.mock.calls[0][0];
      expect(callArg.where).toEqual({ tripId: 'trip1' });
      expect(callArg.include).toBeDefined();
      expect(callArg.include.sentimentAnalysis).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a new feedback with sentiment analysis', async () => {
      const userId = 'user1';
      const createFeedbackDto: CreateFeedbackDto = {
        rating: 5,
        comment: 'The trip was amazing! The tour guide was very knowledgeable and friendly.',
        tripId: 'trip1',
      };
      
      // Mock finding the tourist by userId
      mockPrismaService.tourist.findUnique.mockResolvedValue({
        id: 'tourist1',
        userId: 'user1'
      });
      
      const mockTrip = { 
        id: 'trip1', 
        name: 'Bali Trip',
        tourist: {
          id: 'tourist1',
          userId: 'user1',
          user: { id: 'user1', name: 'John Doe' },
        },
      };
      
      const mockFeedback = { 
        id: 'feedback1', 
        ...createFeedbackDto,
        sentimentAnalysis: { 
          id: 'sa1', 
          score: 0.8, 
          feedbackId: 'feedback1' 
        },
      };
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      
      mockPrismaService.feedback.create.mockImplementation((_args) => {
        return Promise.resolve(mockFeedback);
      });
      
      mockSentimentService.analyzeSentiment.mockReturnValue({ 
        score: 0.8,
        sentiment: 'NEUTRAL',
        confidence: 0
      });

      const result = await service.create(userId, createFeedbackDto);
      
      expect(result).toEqual(mockFeedback);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalledWith({
        where: { userId },
      });
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: createFeedbackDto.tripId },
        include: {
          tourist: {
            include: {
              user: true,
            },
          },
        },
      });
      expect(mockSentimentService.analyzeSentiment).toHaveBeenCalledWith(createFeedbackDto.comment);
      expect(mockPrismaService.feedback.create).toHaveBeenCalled();
      
      // Check key properties of the create call
      const createCallArg = mockPrismaService.feedback.create.mock.calls[0][0];
      expect(createCallArg.data.rating).toBe(createFeedbackDto.rating);
      expect(createCallArg.data.comment).toBe(createFeedbackDto.comment);
      expect(createCallArg.data.trip).toBeDefined();
      expect(createCallArg.data.trip.connect.id).toBe(createFeedbackDto.tripId);
      expect(createCallArg.data.sentimentAnalysis).toBeDefined();
      expect(createCallArg.include.sentimentAnalysis).toBe(true);
    });

    it('should throw NotFoundException if trip not found', async () => {
      const userId = 'user1';
      const createFeedbackDto: CreateFeedbackDto = {
        rating: 5,
        comment: 'Great trip!',
        tripId: 'nonexistent',
      };
      
      // Mock finding the tourist by userId
      mockPrismaService.tourist.findUnique.mockResolvedValue({
        id: 'tourist1',
        userId: 'user1'
      });
      
      mockPrismaService.trip.findUnique.mockResolvedValue(null);

      await expect(service.create(userId, createFeedbackDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.feedback.create).not.toHaveBeenCalled();
    });

    it('should not throw exception if tourist ID matches trip owner', async () => {
      const userId = 'user1';
      const createFeedbackDto: CreateFeedbackDto = {
        rating: 5,
        comment: 'Great trip!',
        tripId: 'trip1',
      };
      
      // Mock finding the tourist by userId
      mockPrismaService.tourist.findUnique.mockResolvedValue({
        id: 'tourist1',
        userId: 'user1'
      });
      
      // Trip has the same tourist ID
      const mockTrip = { 
        id: 'trip1', 
        name: 'Bali Trip',
        tourist: {
          id: 'tourist1',  // Same as the tourist ID we found
          userId: 'user1',
          user: { id: 'user1', name: 'John Doe' },
        },
      };
      
      const mockFeedback = { 
        id: 'feedback1', 
        ...createFeedbackDto
      };
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.feedback.create.mockResolvedValue(mockFeedback);

      // This should NOT throw an exception
      const result = await service.create(userId, createFeedbackDto);
      expect(result).toBeDefined();
      expect(mockPrismaService.feedback.create).toHaveBeenCalled();
    });
  });
});
