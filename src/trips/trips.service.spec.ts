import { Test, TestingModule } from '@nestjs/testing';
import { TripsService } from './trips.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException} from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

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
      findFirst: jest.fn(),
    },
    transactionDetail: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all trips', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1' },
        { id: '2', name: 'Trip 2' },
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
          transactionDetails: {
            include: {
              transaction: true,
            },
          },
          feedbacks: true,
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a trip if found', async () => {
      const mockTrip = { id: '1', name: 'Beach Retreat', price: 1000 };
      
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
          transactionDetails: {
            include: {
              transaction: true,
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

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByTourist', () => {
    it('should return all trips for a specific tourist', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
        { id: '2', name: 'Trip 2', touristId: 'tourist1' },
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
          tourist: {
            include: {
              user: true,
            },
          },
          transactionDetails: {
            include: {
              transaction: true,
            },
          },
        },
      });
    });
  });

  describe('create', () => {
    it('should create a trip', async () => {
      const createTripDto: CreateTripDto = {
        name: 'New Beach Trip',
        description: 'Relaxing beach vacation',
        tripDestination: { name: 'Bali', country: 'Indonesia' },
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-07T00:00:00Z',
        price: 1000,
        touristId: 'tourist1',
      };
      
      const mockTourist = {
        id: 'tourist1',
        userId: 'user1'
      };
      
      const mockTrip = {
        id: '1',
        name: createTripDto.name,
        description: createTripDto.description,
        tripDestination: createTripDto.tripDestination,
        startDateTime: new Date(createTripDto.startDateTime),
        endDateTime: new Date(createTripDto.endDateTime),
        price: createTripDto.price,
        touristId: createTripDto.touristId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(mockTourist);
      mockPrismaService.trip.create.mockResolvedValue(mockTrip);

      const result = await service.create(createTripDto);
      
      expect(result).toEqual(mockTrip);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalledWith({
        where: { id: 'tourist1' },
      });
      expect(mockPrismaService.trip.create).toHaveBeenCalled();
    });

    it('should create a trip with transaction when employeeId is provided', async () => {
      const createTripDto: CreateTripDto = {
        name: 'New Beach Trip',
        description: 'Relaxing beach vacation',
        tripDestination: { name: 'Bali', country: 'Indonesia' },
        startDateTime: '2023-01-01T00:00:00Z',
        endDateTime: '2023-01-07T00:00:00Z',
        price: 1000,
        touristId: 'tourist1',
      };
      
      const mockTourist = {
        id: 'tourist1',
        userId: 'user1'
      };
      
      const mockTrip = {
        id: '1',
        name: createTripDto.name,
        description: createTripDto.description,
        tripDestination: createTripDto.tripDestination,
        startDateTime: new Date(createTripDto.startDateTime),
        endDateTime: new Date(createTripDto.endDateTime),
        price: createTripDto.price,
        touristId: createTripDto.touristId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      mockPrismaService.tourist.findUnique.mockResolvedValue(mockTourist);
      mockPrismaService.trip.create.mockResolvedValue(mockTrip);
      mockPrismaService.$queryRaw.mockResolvedValue([{ id: 'transaction-id-1' }]);

      const employeeId = 'employee1';
      const result = await service.create(createTripDto, employeeId);
      
      expect(result).toEqual(mockTrip);
      expect(mockPrismaService.tourist.findUnique).toHaveBeenCalledWith({
        where: { id: 'tourist1' },
      });
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a trip', async () => {
      const updateTripDto: UpdateTripDto = { name: 'Updated Beach Retreat' };
      const mockTrip = { 
        id: '1', 
        name: 'Beach Retreat',
        touristId: 'tourist1',
        tourist: {
          id: 'tourist1',
          user: { id: 'user1', email: 'user@example.com', password: 'hash' }
        }
      };
      
      const mockUpdatedTrip = { 
        id: '1', 
        name: 'Updated Beach Retreat',
        touristId: 'tourist1',
        tourist: {
          id: 'tourist1',
          user: { id: 'user1', email: 'user@example.com' }
        }
      };
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.trip.update.mockResolvedValue(mockUpdatedTrip);

      const result = await service.update('1', updateTripDto);
      
      expect(result).toEqual(mockUpdatedTrip);
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object)
      });
      expect(mockPrismaService.trip.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: updateTripDto,
        include: expect.any(Object)
      });
    });

    it('should throw NotFoundException if trip doesnt exist', async () => {
      // Mock findUnique to return null (trip not found)
      mockPrismaService.trip.findUnique.mockResolvedValue(null);
      
      await expect(service.update('999', {} as UpdateTripDto))
        .rejects.toThrow(NotFoundException);
      
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
        include: expect.any(Object)
      });
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('should remove associated transaction details when deleting trip', async () => {
      const mockTrip = { 
        id: '1', 
        name: 'Beach Retreat', 
        touristId: 'tourist1',
        price: 1500
      };
      const mockTransactionDetails = [{
        id: 'td1',
        tripId: '1',
        transactionId: 'tx1'
      }];

      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.transactionDetail.findMany.mockResolvedValue(mockTransactionDetails);

      await service.remove('1');

      expect(mockPrismaService.transactionDetail.deleteMany).toHaveBeenCalledWith({
        where: { tripId: '1' }
      });
    });

    it('should remove a trip without creating a refund when no employeeId is provided', async () => {
      // Arrange
      const mockTrip = { 
        id: '1', 
        name: 'Beach Retreat', 
        touristId: 'tourist1',
        price: 1500
      };
      const mockTransactionDetails = [];
      
      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.trip.delete.mockResolvedValue(mockTrip);
      mockPrismaService.transactionDetail.findMany.mockResolvedValue(mockTransactionDetails);
      mockPrismaService.$queryRaw.mockResolvedValue(mockTransactionDetails);

      // Act
      const result = await service.remove('1');

      // Assert
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' }
        })
      );
      expect(mockPrismaService.trip.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toHaveProperty('message', 'Trip deleted successfully');
      expect(result).toHaveProperty('deletedTrip');
      // Verify no refund transaction was created when no employeeId is provided
      expect(mockPrismaService.$queryRaw).not.toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "Transaction"')
      );
    });
    
    it('should remove a trip and create a refund transaction when employeeId is provided', async () => {
      // Arrange
      const mockTrip = { 
        id: '1', 
        name: 'Beach Retreat', 
        touristId: 'tourist1',
        price: 1500,
        tripDestination: 'Bali'
      };
      const mockTransactionDetails = [{
        id: 'td1',
        tripId: '1',
        transactionId: 'tx1',
        paymentMethod: 'CREDIT_CARD'
      }];

      mockPrismaService.trip.findUnique.mockResolvedValue(mockTrip);
      mockPrismaService.trip.delete.mockResolvedValue(mockTrip);
      mockPrismaService.transactionDetail.findMany.mockResolvedValue(mockTransactionDetails);
      mockPrismaService.$queryRaw
        .mockResolvedValueOnce(mockTransactionDetails)
        .mockResolvedValueOnce([{ id: 'refund-tx-123' }]);

      // Act
      const employeeId = 'employee1';
      const result = await service.remove('1', employeeId);

      // Assert
      expect(mockPrismaService.trip.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' }
        })
      );
      expect(mockPrismaService.trip.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      // Check if any call to $queryRaw contains the INSERT INTO Transaction statement
      const anyCallContainsInsert = mockPrismaService.$queryRaw.mock.calls.some(
        call => typeof call[0] === 'string' && call[0].includes('INSERT INTO "Transaction"') ||
               (Array.isArray(call[0]) && call[0].join('').includes('INSERT INTO "Transaction"'))
      );
      expect(anyCallContainsInsert).toBeTruthy();
      expect(result).toHaveProperty('message', 'Trip deleted successfully');
      expect(result).toHaveProperty('deletedTrip');
      expect(result).toHaveProperty('refundTransaction');
    });
  });
});
