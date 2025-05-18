import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TouristOwnerGuard } from '../auth/guards/tourist-owner.guard';

describe('FeedbackController', () => {
  let controller: FeedbackController;
  let _service: FeedbackService;

  const mockFeedbackService = {
    findAll: jest.fn().mockImplementation(() => {
      return [{ id: '1', rating: 5, comment: 'Great trip!' }, { id: '2', rating: 4, comment: 'Good experience' }];
    }),
    findOne: jest.fn(),
    findByTrip: jest.fn(),
    findByTourist: jest.fn().mockImplementation(() => {
      return [{ id: '1', rating: 5, comment: 'Great trip!', touristId: 'tourist1' }];
    }),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockTouristOwnerGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: mockFeedbackService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .overrideGuard(TouristOwnerGuard)
      .useValue(mockTouristOwnerGuard)
      .compile();

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
    it('should return all feedback for employee users', () => {
      // Set up the mock to return data
      const mockEmployeeFeedback = [{ id: '1', rating: 5, comment: 'Great trip!' }, { id: '2', rating: 4, comment: 'Good experience' }];
      mockFeedbackService.findAll.mockReturnValue(mockEmployeeFeedback);
      
      // Create the request object with employee role
      const req = { user: { id: 'employee1', role: 'employee' } };
      
      // Call the controller method
      const result = controller.findAll(req);
      
      // Verify the result and that the correct service method was called
      expect(result).toBe(mockEmployeeFeedback);
      expect(mockFeedbackService.findAll).toHaveBeenCalled();
      expect(mockFeedbackService.findByTourist).not.toHaveBeenCalled();
    });

    it('should return only tourist\'s own feedback for tourist users', () => {
      // Set up the mock to return data
      const mockTouristFeedback = [{ id: '1', rating: 5, comment: 'Great trip!', touristId: 'tourist1' }];
      mockFeedbackService.findByTourist.mockReturnValue(mockTouristFeedback);
      
      // Create the request object with tourist role
      const req = { user: { id: 'tourist1', role: 'tourist' } };
      
      // Call the controller method
      const result = controller.findAll(req);
      
      // Verify the result and that the correct service method was called
      expect(result).toBe(mockTouristFeedback);
      expect(mockFeedbackService.findByTourist).toHaveBeenCalledWith('tourist1');
      expect(mockFeedbackService.findAll).not.toHaveBeenCalled();
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
      const userId = 'user1';
      const req = { user: { id: userId } };
      mockFeedbackService.remove.mockResolvedValue({ message: 'Feedback deleted successfully' });

      await controller.remove('1', req);
      
      expect(mockFeedbackService.remove).toHaveBeenCalledWith('1', userId);
    });
  });
});
