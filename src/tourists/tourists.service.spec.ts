import { Test, TestingModule } from '@nestjs/testing';
import { TouristsService } from './tourists.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTouristDto } from './dto/create-tourist.dto';
import { UpdateTouristDto } from './dto/update-tourist.dto';

describe('TouristsService', () => {
  let service: TouristsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    tourist: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TouristsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TouristsService>(TouristsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all tourists', async () => {
      const mockTourists = [
        { id: '1', userId: 'user1', user: { name: 'John Doe' } },
        { id: '2', userId: 'user2', user: { name: 'Jane Doe' } },
      ];
      
      mockPrismaService.tourist.findMany.mockResolvedValue(mockTourists);

      const result = await service.findAll();
      
      expect(result).toEqual(mockTourists);
      expect(mockPrismaService.tourist.findMany).toHaveBeenCalledWith({
        include: {
          user: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a tourist if found', async () => {
      // Mock the actual behavior by examining what's in the service
      mockPrismaService.tourist.findUnique.mockImplementation((_args) => {
        // Return a mock tourist
        return Promise.resolve({ id: '1', userId: 'user1', user: { name: 'John Doe' } });
      });

      const result = await service.findOne('1');
      
      expect(result).toBeDefined();
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalled();
      // Check that the key properties were passed
      const callArg = mockPrismaService.tourist.findUnique.mock.calls[0][0];
      expect(callArg.where).toEqual({ id: '1' });
      expect(callArg.include).toBeDefined();
      expect(callArg.include.user).toBe(true);
    });

    it('should throw NotFoundException if tourist not found', async () => {
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUserId', () => {
    it('should return a tourist if found by user ID', async () => {
      // Mock the actual behavior
      mockPrismaService.tourist.findUnique.mockImplementation((_args) => {
        // Return a mock tourist
        return Promise.resolve({ id: '1', userId: 'user1', user: { name: 'John Doe' } });
      });

      const result = await service.findByUserId('user1');
      
      expect(result).toBeDefined();
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalled();
      // Check that the key properties were passed
      const callArg = mockPrismaService.tourist.findUnique.mock.calls[0][0];
      expect(callArg.where).toEqual({ userId: 'user1' });
      expect(callArg.include).toBeDefined();
      expect(callArg.include.user).toBe(true);
    });

    it('should throw NotFoundException if tourist not found by user ID', async () => {
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.findByUserId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a new tourist', async () => {
      const createTouristDto: CreateTouristDto = {
        userId: 'user1',
      };
      
      const mockUser = { id: 'user1', name: 'John Doe' };
      const mockTourist = { id: '1', userId: 'user1', user: mockUser };
      
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.tourist.create.mockResolvedValue(mockTourist);

      const result = await service.create(createTouristDto);
      
      expect(result).toEqual(mockTourist);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createTouristDto.userId },
      });
      expect(mockPrismaService.tourist.create).toHaveBeenCalledWith({
        data: {
          user: {
            connect: { id: createTouristDto.userId },
          },
        },
        include: {
          user: true,
        },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      const createTouristDto: CreateTouristDto = {
        userId: 'nonexistent',
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createTouristDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.tourist.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a tourist if found', async () => {
      const updateTouristDto: UpdateTouristDto = {
        // Empty object as we're extending PartialType of CreateTouristDto with userId omitted
      };
      
      const mockTourist = { 
        id: '1', 
        userId: 'user1', 
        user: { name: 'John Doe' },
      };
      
      // Mock the actual behavior
      mockPrismaService.tourist.findUnique.mockImplementation((_args) => {
        // Return a mock tourist
        return Promise.resolve({ id: '1' });
      });
      
      mockPrismaService.tourist.update.mockResolvedValue(mockTourist);

      const result = await service.update('1', updateTouristDto);
      
      expect(result).toEqual(mockTourist);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.tourist.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTouristDto,
        include: {
          user: true,
        },
      });
    });

    it('should throw NotFoundException if tourist not found for update', async () => {
      const updateTouristDto: UpdateTouristDto = {
        // Empty object as we're extending PartialType of CreateTouristDto with userId omitted
      };
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', updateTouristDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.tourist.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a tourist if found', async () => {
      // Mock the actual behavior
      mockPrismaService.tourist.findUnique.mockImplementation((_args) => {
        // Return a mock tourist
        return Promise.resolve({ id: '1' });
      });
      
      mockPrismaService.tourist.delete.mockResolvedValue({ id: '1' });

      await service.remove('1');
      
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalled();
      expect(mockPrismaService.tourist.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if tourist not found for removal', async () => {
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.tourist.delete).not.toHaveBeenCalled();
    });
  });
});
