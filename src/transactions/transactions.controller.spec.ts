import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TouristOwnerGuard } from '../auth/guards/tourist-owner.guard';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let _service: TransactionsService;

  const mockTransactionsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByTouristId: jest.fn(),
    findByTripId: jest.fn(),
    findTransactionDetailsByTransactionId: jest.fn(),
    // Note: No create or update methods as this is a view-only module
    // The actual transaction creation/updating happens in the trips module
  };

  // Mock guards
  const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockRolesGuard = { canActivate: jest.fn().mockReturnValue(true) };
  const mockTouristOwnerGuard = { canActivate: jest.fn().mockReturnValue(true) };

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
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTransactionDetail = {
    id: 'detail-1',
    amount: 1500.50,
    description: 'Payment for Bali Trip',
    transactionId: 'transaction-1',
    tripId: 'trip-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
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

    controller = module.get<TransactionsController>(TransactionsController);
    _service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of transactions', async () => {
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);
      
      const result = await controller.findAll();
      
      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a transaction by ID', async () => {
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);
      
      const result = await controller.findOne('transaction-1');
      
      expect(result).toEqual(mockTransaction);
      expect(mockTransactionsService.findOne).toHaveBeenCalledWith('transaction-1');
    });
  });

  describe('findByTouristId', () => {
    it('should return transactions for a specific tourist', async () => {
      mockTransactionsService.findByTouristId.mockResolvedValue([mockTransaction]);
      
      const result = await controller.findByTouristId('tourist-1');
      
      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionsService.findByTouristId).toHaveBeenCalledWith('tourist-1');
    });
  });

  describe('findByTripId', () => {
    it('should return transactions for a specific trip', async () => {
      mockTransactionsService.findByTripId.mockResolvedValue([mockTransaction]);
      
      const result = await controller.findByTripId('trip-1');
      
      expect(result).toEqual([mockTransaction]);
      expect(mockTransactionsService.findByTripId).toHaveBeenCalledWith('trip-1');
    });
  });

  describe('findTransactionDetails', () => {
    it('should return transaction details for a specific transaction', async () => {
      mockTransactionsService.findTransactionDetailsByTransactionId.mockResolvedValue([mockTransactionDetail]);
      
      const result = await controller.findTransactionDetails('transaction-1');
      
      expect(result).toEqual([mockTransactionDetail]);
      expect(mockTransactionsService.findTransactionDetailsByTransactionId).toHaveBeenCalledWith('transaction-1');
    });
  });
});
