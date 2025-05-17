import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto as _UpdateTripDto } from './dto/update-trip.dto';

describe('TripsService', () => {
  let service: TripsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    trip: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    tourist: {
      findUnique: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ id: 'transaction-id-1' }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TripsService>(TripsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all trips', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', tourist: { user: { name: 'User 1' } }, feedbacks: [] },
        { id: '2', name: 'Trip 2', tourist: { user: { name: 'User 2' } }, feedbacks: [] },
      ];
      
      mockPrismaService.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.findAll();
      
      expect(result).toEqual(mockTrips);
      expect(mockPrismaService.trip.findMany).toHaveBeenCalledWith({
        include: {
          tourist: {
            include: {
              user: true,
            },
          },
          feedbacks: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a trip if found', async () => {
      const mockTrip = { 
        id: '1', 
        name: 'Trip 1', 
        tourist: { user: { name: 'User 1' } },
        feedbacks: []
      };
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);

      const result = await service.findOne('1');
      
      expect(result).toEqual(mockTrip);
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          tourist: {
            include: {
              user: true,
            },
          },
          feedbacks: {
            include: {
              sentimentAnalysis: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if trip not found', async () => {
      mockPrismaService.trip.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByTourist', () => {
    it('should return all trips for a specific tourist', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1', feedbacks: [] },
        { id: '2', name: 'Trip 2', touristId: 'tourist1', feedbacks: [] },
      ];
      
      mockPrismaService.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.findAllByTourist('tourist1');
      
      expect(result).toEqual(mockTrips);
      expect(mockPrismaService.trip.findMany).toHaveBeenCalledWith({
        where: { touristId: 'tourist1' },
        include: {
          feedbacks: {
            include: {
              sentimentAnalysis: true,
            },
          },
        },
      });
    });
  });

  describe('findAllByTouristUserId', () => {
    it('should return all trips for a tourist by user ID', async () => {
      const mockTourist = { id: 'tourist1', userId: 'user1' };
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
        { id: '2', name: 'Trip 2', touristId: 'tourist1' },
      ];
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(mockTourist);
      mockPrismaService.trip.findMany.mockResolvedValue(mockTrips);

      const result = await service.findAllByTouristUserId('user1');
      
      expect(result).toEqual(mockTrips);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user1' },
      });
    });

    it('should throw NotFoundException if tourist not found by user ID', async () => {
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.findAllByTouristUserId('nonexistent')).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.trip.findMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a new trip without transaction when no employeeId is provided', async () => {
      const createTripDto = {
        name: 'New Trip',
        startDateTime: '2025-06-01T10:00:00Z',
        endDateTime: '2025-06-07T18:00:00Z',
        tripDestination: {
          city: 'Bali',
          country: 'Indonesia',
          coordinates: {
            latitude: -8.409518,
            longitude: 115.188919,
          }
        },
        description: 'Relaxing beach vacation',
        price: 1500,
        touristId: 'tourist1',
      } as CreateTripDto;
      
      const mockTourist = { id: 'tourist1', userId: 'user1' };
      const mockTrip = { 
        id: '1', 
        ...createTripDto,
        startDateTime: new Date(createTripDto.startDateTime),
        endDateTime: new Date(createTripDto.endDateTime),
      };
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(mockTourist);
      mockPrismaService.trip.create.mockResolvedValue(mockTrip);

      const result = await service.create(createTripDto);
      
      expect(result).toEqual(mockTrip);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalledWith({
        where: { id: createTripDto.touristId },
      });
      expect(mockPrismaService.trip.create).toHaveBeenCalledWith({
        data: {
          name: createTripDto.name,
          startDateTime: new Date(createTripDto.startDateTime),
          endDateTime: new Date(createTripDto.endDateTime),
          tripDestination: createTripDto.tripDestination,
          description: createTripDto.description,
          price: createTripDto.price,
          tourist: {
            connect: { id: createTripDto.touristId },
          },
        },
      });
    });

    it('should throw NotFoundException if tourist not found', async () => {
      const createTripDto = {
        name: 'New Trip',
        startDateTime: '2025-06-01T10:00:00Z',
        endDateTime: '2025-06-07T18:00:00Z',
        tripDestination: {
          city: 'Bali',
          country: 'Indonesia'
        },
        description: 'Relaxing beach vacation',
        price: 1500,
        touristId: 'nonexistent',
      } as CreateTripDto;
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(null);

      await expect(service.create(createTripDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.trip.create).not.toHaveBeenCalled();
    });
    
    it('should create a new trip and transaction when employeeId is provided', async () => {
      const createTripDto = {
        name: 'New Trip',
        startDateTime: '2025-06-01T10:00:00Z',
        endDateTime: '2025-06-07T18:00:00Z',
        tripDestination: {
          city: 'Bali',
          country: 'Indonesia',
          coordinates: {
            latitude: -8.409518,
            longitude: 115.188919,
          }
        },
        description: 'Relaxing beach vacation',
        price: 1500,
        touristId: 'tourist1',
      } as CreateTripDto;
      
      const employeeId = 'employee1';
      const mockTourist = { id: 'tourist1', userId: 'user1' };
      const mockTrip = { 
        id: '1', 
        ...createTripDto,
        startDateTime: new Date(createTripDto.startDateTime),
        endDateTime: new Date(createTripDto.endDateTime),
      };
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(mockTourist);
      mockPrismaService.trip.create.mockResolvedValue(mockTrip);
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'transaction-id-1' }]);

      const result = await service.create(createTripDto, employeeId);
      
      expect(result).toEqual(mockTrip);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2); // Once for transaction, once for details
    });
  });
  
  describe('remove', () => {
    it('should remove a trip without creating a refund when no employeeId is provided', async () => {
      const mockTrip = { 
        id: '1', 
        name: 'Trip to be removed',
        touristId: 'tourist1',
        tripDestination: 'Bali',
        price: 1500
      };
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.trip.delete.mockResolvedValue(undefined);
      mockPrismaService.$queryRaw.mockResolvedValue([]);

      await service.remove('1');
      
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object)
      });
      expect(mockPrismaService.trip.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
      // Should only call queryRaw for checking existing details and deleting them
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
    });
    
    it('should remove a trip and create a refund transaction when employeeId is provided', async () => {
      const mockTrip = { 
        id: '1', 
        name: 'Trip to be removed',
        touristId: 'tourist1',
        tripDestination: 'Bali',
        price: 1500
      };
      const employeeId = 'employee1';
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.trip.delete.mockResolvedValue(undefined);
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'transaction-id-1', paymentMethod: 'CREDIT_CARD' }]);

      await service.remove('1', employeeId);
      
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object)
      });
      // Should call queryRaw for checking existing details, creating refund transaction, 
      // creating refund detail, and deleting existing details
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(4);
      expect(mockPrismaService.trip.delete).toHaveBeenCalledWith({
        where: { id: '1' }
      });
    });
  });
});
