import { Test, TestingModule } from '@nestjs/testing';
import { TouristsController } from './tourists.controller';
import { TouristsService } from './tourists.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { UserRole } from '../users/entities/user.entity';

describe('TouristsController', () => {
  let controller: TouristsController;
  let _service: TouristsService;

  const mockTouristsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TouristsController],
      providers: [
        {
          provide: TouristsService,
          useValue: mockTouristsService,
        },
      ],
    }).compile();

    controller = module.get<TouristsController>(TouristsController);
    _service = module.get<TouristsService>(TouristsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tourists', async () => {
      const mockTourists = [
        { id: '1', userId: 'user1', user: { name: 'John Doe' } },
        { id: '2', userId: 'user2', user: { name: 'Jane Doe' } },
      ];
      mockTouristsService.findAll.mockResolvedValue(mockTourists);

      const result = await controller.findAll();
      
      expect(result).toEqual(mockTourists);
      expect(mockTouristsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a tourist if requesting user is an employee', async () => {
      const mockTourist = { id: '1', userId: 'user1', user: { name: 'John Doe' } };
      mockTouristsService.findOne.mockResolvedValue(mockTourist);
      
      // Mock request with employee role
      const req = { user: { id: 'employee1', role: UserRole.EMPLOYEE } };
      
      const result = await controller.findOne('1', req);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.findOne).toHaveBeenCalledWith('1');
      expect(mockTouristsService.findByUserId).not.toHaveBeenCalled();
    });

    it('should return a tourist if tourist is requesting their own profile', async () => {
      const mockTourist = { id: '1', userId: 'user1', user: { name: 'John Doe' } };
      mockTouristsService.findOne.mockResolvedValue(mockTourist);
      
      // Mock request with tourist viewing their own profile
      const req = { user: { id: '1', role: UserRole.TOURIST } };
      
      const result = await controller.findOne('1', req);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.findOne).toHaveBeenCalledWith('1');
      expect(mockTouristsService.findByUserId).not.toHaveBeenCalled();
    });

    it('should find tourist by user ID if tourist is requesting another profile', async () => {
      const mockTourist = { id: '2', userId: 'user2', user: { name: 'Jane Doe' } };
      mockTouristsService.findByUserId.mockResolvedValue(mockTourist);
      
      // Mock request with tourist trying to view another profile
      const req = { user: { id: '1', role: UserRole.TOURIST } };
      
      const result = await controller.findOne('2', req);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.findOne).not.toHaveBeenCalled();
      expect(mockTouristsService.findByUserId).toHaveBeenCalledWith('2');
    });
  });

  describe('create', () => {
    it('should create a new tourist profile', async () => {
      const createTouristDto: CreateTouristDto = {
        userId: 'user1',
      };
      
      const mockTourist = { id: '1', userId: 'user1', user: { name: 'John Doe' } };
      mockTouristsService.create.mockResolvedValue(mockTourist);

      const result = await controller.create(createTouristDto);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.create).toHaveBeenCalledWith(createTouristDto);
    });
  });

  describe('update', () => {
    it('should update a tourist profile when employee is requesting', async () => {
      const updateTouristDto: UpdateTouristDto = {
        // Empty object as we're extending PartialType of CreateTouristDto with userId omitted
      };
      
      const mockTourist = { 
        id: '1', 
        userId: 'user1', 
        user: { name: 'John Doe' },
      };
      
      mockTouristsService.update.mockResolvedValue(mockTourist);
      
      // Mock request with employee role
      const req = { user: { id: 'employee1', role: UserRole.EMPLOYEE } };
      
      const result = await controller.update('1', updateTouristDto, req);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.update).toHaveBeenCalledWith('1', updateTouristDto);
    });

    it('should update a tourist profile when tourist is updating their own profile', async () => {
      const updateTouristDto: UpdateTouristDto = {
        // Empty object as we're extending PartialType of CreateTouristDto with userId omitted
      };
      
      const mockTourist = { 
        id: '1', 
        userId: 'user1', 
        user: { name: 'John Doe' },
      };
      
      mockTouristsService.findByUserId.mockResolvedValue({ id: '1' });
      mockTouristsService.update.mockResolvedValue(mockTourist);
      
      // Mock request with tourist updating their own profile
      const req = { user: { id: 'user1', role: UserRole.TOURIST } };
      
      const result = await controller.update('1', updateTouristDto, req);
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.update).toHaveBeenCalledWith('1', updateTouristDto);
    });
  });

  describe('remove', () => {
    it('should remove a tourist profile', async () => {
      mockTouristsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      
      expect(mockTouristsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
