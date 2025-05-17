import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let _service: FeedbackService;

  const mockFeedbackService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTrip: jest.fn(),
    findByTourist: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
    _service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all feedback', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, comment: 'Great trip!' },
        { id: '2', rating: 4, comment: 'Good experience' },
      ];
      mockFeedbackService.findAll.mockResolvedValue(mockFeedback);

      const result = await controller.findAll();
      
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific feedback', async () => {
      const mockFeedback = { id: '1', rating: 5, comment: 'Great trip!' };
      mockFeedbackService.findOne.mockResolvedValue(mockFeedback);

      const result = await controller.findOne('1');
      
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByTrip', () => {
    it('should return feedback for a specific trip', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, comment: 'Great trip!', tripId: 'trip1' },
        { id: '2', rating: 4, comment: 'Good experience', tripId: 'trip1' },
      ];
      mockFeedbackService.findByTrip.mockResolvedValue(mockFeedback);

      const result = await controller.findByTrip('trip1');
      
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackService.findByTrip).toHaveBeenCalledWith('trip1');
    });
  });

  describe('findByTourist', () => {
    it('should return feedback for a specific tourist', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, comment: 'Great trip!', touristId: 'tourist1' },
        { id: '2', rating: 4, comment: 'Good experience', touristId: 'tourist1' },
      ];
      mockFeedbackService.findByTourist.mockResolvedValue(mockFeedback);

      const result = await controller.findByTourist('tourist1');
      
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackService.findByTourist).toHaveBeenCalledWith('tourist1');
    });
  });

  describe('create', () => {
    it('should create new feedback with the current user ID', async () => {
      const createFeedbackDto: CreateFeedbackDto = {
        rating: 5,
        comment: 'The trip was amazing! Great experience.',
        tripId: 'trip1',
      };
      
      const userId = 'user1';
      const req = { user: { id: userId } };
      
      const mockFeedback = { 
        id: 'feedback1', 
        ...createFeedbackDto,
        userId: userId,
      };
      
      mockFeedbackService.create.mockResolvedValue(mockFeedback);

      const result = await controller.create(createFeedbackDto, req);
      
      expect(result).toEqual(mockFeedback);
      expect(mockFeedbackService.create).toHaveBeenCalledWith(userId, createFeedbackDto);
    });
  });

  describe('remove', () => {
    it('should remove feedback', async () => {
      mockFeedbackService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      
      expect(mockFeedbackService.remove).toHaveBeenCalledWith('1');
    });
  });
});
