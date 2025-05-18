import { Test, TestingModule } from '@nestjs/testing';
import { TouristsController } from './tourists.controller';
import { TouristsService } from './tourists.service';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';
import { UserRole as _UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TouristOwnerGuard } from '../auth/guards/tourist-owner.guard';

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

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockTouristOwnerGuard = { canActivate: jest.fn().mockReturnValue(true) };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TouristsController],
      providers: [
        {
          provide: TouristsService,
          useValue: mockTouristsService,
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
    it('should return a tourist by ID', async () => {
      const mockTourist = { id: '1', userId: 'user1', user: { name: 'John Doe' } };
      mockTouristsService.findOne.mockResolvedValue(mockTourist);
      
      const result = await controller.findOne('1');
      
      expect(result).toEqual(mockTourist);
      expect(mockTouristsService.findOne).toHaveBeenCalledWith('1');
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
    it('should update a tourist profile', async () => {
      const updateTouristDto: UpdateTouristDto = {
        // Empty object as we're extending PartialType of CreateTouristDto with userId omitted
      };
      
      const mockUpdatedTourist = { id: '1', userId: 'user1', user: { name: 'John Doe' } };
      mockTouristsService.update.mockResolvedValue(mockUpdatedTourist);

      const result = await controller.update('1', updateTouristDto);
      
      expect(result).toEqual(mockUpdatedTourist);
      expect(mockTouristsService.update).toHaveBeenCalledWith('1', updateTouristDto);
    });



    it('should update a tourist profile with specific fields', async () => {
      const updateTouristDto: UpdateTouristDto = {
        phoneNumber: '+6281234567890',
        nationality: 'Indonesia'
      };
      
      const mockTourist = { 
        id: '1', 
        userId: 'user1', 
        user: { name: 'John Doe' },
        phoneNumber: '+6281234567890',
        nationality: 'Indonesia'
      };
      
      mockTouristsService.update.mockResolvedValue(mockTourist);
      
      const result = await controller.update('1', updateTouristDto);
      
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
