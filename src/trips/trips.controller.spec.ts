import { Test, TestingModule } from '@nestjs/testing';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { UserRole } from '../users/entities/user.entity';

describe('TripsController', () => {
  let controller: TripsController;
  let _service: TripsService;

  const mockTripsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findAllByTourist: jest.fn(),
    findAllByTouristUserId: jest.fn(), 
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TripsController],
      providers: [
        {
          provide: TripsService,
          useValue: mockTripsService,
        },
      ],
    }).compile();

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
    it('should return all trips', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1' },
        { id: '2', name: 'Trip 2' },
      ];
      mockTripsService.findAll.mockResolvedValue(mockTrips);

      const result = await controller.findAll();
      
      expect(result).toEqual(mockTrips);
      expect(mockTripsService.findAll).toHaveBeenCalled();
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
    it('should return trips for employee viewing any tourist', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
        { id: '2', name: 'Trip 2', touristId: 'tourist1' },
      ];
      mockTripsService.findAllByTouristUserId.mockResolvedValue(mockTrips);
      
      // Mock request with employee role
      const req = { user: { id: 'employee1', role: UserRole.EMPLOYEE } };
      
      const result = await controller.findByTourist('tourist1', req);
      
      expect(result).toEqual(mockTrips);
      expect(mockTripsService.findAllByTouristUserId).toHaveBeenCalledWith('tourist1');
    });

    it('should return trips for tourist viewing their own trips', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
        { id: '2', name: 'Trip 2', touristId: 'tourist1' },
      ];
      mockTripsService.findAllByTouristUserId.mockResolvedValue(mockTrips);
      
      // Mock request with tourist viewing their own trips
      const req = { user: { id: 'tourist1', role: UserRole.TOURIST } };
      
      const result = await controller.findByTourist('tourist1', req);
      
      expect(result).toEqual(mockTrips);
      expect(mockTripsService.findAllByTouristUserId).toHaveBeenCalledWith('tourist1');
    });

    it('should return only own trips for tourist trying to view others', async () => {
      const mockTrips = [
        { id: '1', name: 'Trip 1', touristId: 'tourist1' },
      ];
      mockTripsService.findAllByTouristUserId.mockResolvedValue(mockTrips);
      
      // Mock request with tourist trying to view another tourist's trips
      const req = { user: { id: 'tourist1', role: UserRole.TOURIST } };
      
      const result = await controller.findByTourist('tourist2', req);
      
      expect(result).toEqual(mockTrips);
      // Should call with the requester's ID, not the requested tourist ID
      expect(mockTripsService.findAllByTouristUserId).toHaveBeenCalledWith('tourist1');
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

      const result = await controller.create(createTripDto);
      
      expect(result).toEqual(mockTrip);
      expect(mockTripsService.create).toHaveBeenCalledWith(createTripDto);
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

      const result = await controller.update('1', updateTripDto);
      
      expect(result).toEqual(mockUpdatedTrip);
      expect(mockTripsService.update).toHaveBeenCalledWith('1', updateTripDto);
    });
  });

  describe('remove', () => {
    it('should remove a trip', async () => {
      mockTripsService.remove.mockResolvedValue(undefined);

      await controller.remove('1');
      
      expect(mockTripsService.remove).toHaveBeenCalledWith('1');
    });
  });
});
