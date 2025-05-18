import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UserRole as _UserRole } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TouristOwnerGuard } from '../auth/guards/tourist-owner.guard';

describe('TripsController', () => {
  let controller: TripsController;
  let _service: TripsService;

  const mockTripsService = {
    findAll: jest.fn().mockImplementation(() => {
      return [{ id: '1', name: 'Trip 1' }, { id: '2', name: 'Trip 2' }];
    }),
    findOne: jest.fn(),
    findAllByTourist: jest.fn(),
    findAllByTouristUserId: jest.fn().mockImplementation(() => {
      return [{ id: '1', name: 'Trip 1', touristId: 'tourist1' }];
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
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: mockTripsService,
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

    controller = module.get<TripsController>(TripsController);
    _service = module.get<TripsService>(TripsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all trips for employee users', () => {
      // Set up the mock to return data
      const mockEmployeeTrips = [{ id: '1', name: 'Trip 1' }, { id: '2', name: 'Trip 2' }];
      mockTripsService.findAll.mockReturnValue(mockEmployeeTrips);
      
      // Create the request object with employee role
      const req = { user: { id: 'employee1', role: 'employee' } };
      
      // Call the controller method
      const result = controller.findAll(req);
      
      // Verify the result and that the correct service method was called
      expect(result).toBe(mockEmployeeTrips);
      expect(mockTripsService.findAll).toHaveBeenCalled();
      expect(mockTripsService.findAllByTouristUserId).not.toHaveBeenCalled();
    });

    it('should return only tourist\'s own trips for tourist users', () => {
      // Set up the mock to return data
      const mockTouristTrips = [{ id: '1', name: 'Trip 1', touristId: 'tourist1' }];
      mockTripsService.findAllByTouristUserId.mockReturnValue(mockTouristTrips);
      
      // Create the request object with tourist role
      const req = { user: { id: 'tourist1', role: 'tourist' } };
      
      // Call the controller method
      const result = controller.findAll(req);
      
      // Verify the result and that the correct service method was called
      expect(result).toBe(mockTouristTrips);
      expect(mockTripsService.findAllByTouristUserId).toHaveBeenCalledWith('tourist1');
      expect(mockTripsService.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a specific trip', async () => {
      const mockTrip = { id: '1', name: 'Trip 1' };
      mockTripsService.findOne.mockResolvedValue(mockTrip);

      const req = {}; // Mock request object
      const result = await controller.findOne('1', req);
      
      expect(result).toEqual(mockTrip);
      expect(mockTripsService.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('findByTourist', () => {
    it('should return trips for a tourist', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
        { id: '2', name: 'Trip 2', touristId: 'tourist1' },
      ];
      mockTripsService.findAllByTourist.mockResolvedValue(mockTrips);
      
      const result = await controller.findByTourist('tourist1');
      
      expect(result).toEqual(mockTrips);
      expect(mockTripsService.findAllByTourist).toHaveBeenCalledWith('tourist1');
    });




  });

  describe('create', () => {
    it('should create a new trip', async () => {
      const createTripDto: CreateTripDto = {
        name: 'New Trip',
        startDateTime: '2025-06-01T10:00:00Z',
        endDateTime: '2025-06-07T18:00:00Z',
        tripDestination: {
          city: 'Bali',
          country: 'Indonesia'
        },
        description: 'A relaxing beach vacation',
        price: 1500,
        touristId: 'tourist1'
      } as CreateTripDto;
      
      const mockTrip = { id: '1', ...createTripDto };
      mockTripsService.create.mockResolvedValue(mockTrip);

      const req = { user: { id: 'employee1' } };
      const result = await controller.create(createTripDto, req);
      
      expect(result).toEqual(mockTrip);
      expect(mockTripsService.create).toHaveBeenCalledWith(createTripDto, 'employee1');
    });
  });

  describe('update', () => {
    it('should update an existing trip', async () => {
      const updateTripDto: UpdateTripDto = {
        name: 'Updated Trip Name',
        description: 'Updated description'
      } as UpdateTripDto;
      
      const mockUpdatedTrip = { id: '1', name: 'Updated Trip Name', description: 'Updated description' };
      mockTripsService.update.mockResolvedValue(mockUpdatedTrip);

      const req = { user: { id: 'employee1' } };
      const result = await controller.update('1', updateTripDto, req);
      
      expect(result).toEqual(mockUpdatedTrip);
      expect(mockTripsService.update).toHaveBeenCalledWith('1', updateTripDto, 'employee1');
    });
  });

  describe('remove', () => {
    it('should remove a trip', async () => {
      mockTripsService.remove.mockResolvedValue(undefined);

      const req = { user: { id: 'employee1' } };
      await controller.remove('1', req);
      
      expect(mockTripsService.remove).toHaveBeenCalledWith('1', 'employee1');
    });
  });
});
