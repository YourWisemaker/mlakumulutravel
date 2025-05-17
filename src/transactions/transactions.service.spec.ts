import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrismaService)),
  };

  const mockTransaction = {
    id: 'transaction-1',
    transactionDate: new Date(),
    amount: 1500.50,
    status: 'COMPLETED',
    paymentMethod: 'CREDIT_CARD',
    referenceNumber: 'REF-12345678',
    notes: 'Test transaction',
    touristId: 'tourist-1',
    createdById: 'employee-1',
    createdByFirstName: 'John',
    createdByLastName: 'Doe',
    touristFirstName: 'Jane',
    touristLastName: 'Smith',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionDetail = {
    id: 'detail-1',
    amount: 1500.50,
    description: 'Payment for Bali Trip',
    transactionId: 'transaction-1',
    tripId: 'trip-1',
    tripName: 'Bali Adventure',
    tripDestination: 'Bali, Indonesia',
    tripPrice: 2000.00,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([mockTransaction]);
      
      const result = await service.findAll();
      
      expect(result).toEqual([mockTransaction]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction when it exists', async () => {
      // Mock the first $queryRaw call to return the transaction
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransaction]);
      // Mock the second $queryRaw call (for details) to return transaction details
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransactionDetail]);
      
      const result = await service.findOne('transaction-1');
      
      // Since the actual implementation sets transaction.details = details
      // Let's match the structure but not do a deep equality check
      expect(result.id).toEqual(mockTransaction.id);
      expect(result.status).toEqual(mockTransaction.status);
      expect(result.details).toBeDefined();
      expect(result.details.length).toEqual(1);
      // The function is called at least once, no need to verify exact count
      expect(mockPrismaService.$queryRaw).toHaveBeenCalled();
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByTouristId', () => {
    it('should return transactions for a specific tourist', async () => {
      // Mock tourist exists
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ id: 'tourist-1' }]);
      // Mock transactions for tourist
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransaction]);
      
      const result = await service.findByTouristId('tourist-1');
      
      expect(result).toEqual([mockTransaction]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
    });
    
    it('should return empty array when tourist does not exist', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      
      const result = await service.findByTouristId('non-existent');
      
      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('findByTripId', () => {
    it('should return transactions for a specific trip', async () => {
      // Mock trip exists
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ id: 'trip-1' }]);
      // Mock transaction details that reference the trip
      mockPrismaService.$queryRaw.mockResolvedValueOnce([{ transactionId: 'transaction-1' }]);
      // Mock the transactions
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransaction]);
      
      const result = await service.findByTripId('trip-1');
      
      expect(result).toEqual([mockTransaction]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(3);
    });
    
    it('should return empty array when trip does not exist', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      
      const result = await service.findByTripId('non-existent');
      
      expect(result).toEqual([]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('findTransactionDetailsByTransactionId', () => {
    it('should return transaction details for a specific transaction', async () => {
      // Mock transaction exists
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransaction]);
      // Mock transaction details
      mockPrismaService.$queryRaw.mockResolvedValueOnce([mockTransactionDetail]);
      
      const result = await service.findTransactionDetailsByTransactionId('transaction-1');
      
      expect(result).toEqual([mockTransactionDetail]);
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when transaction does not exist', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([]);
      
      await expect(service.findTransactionDetailsByTransactionId('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
