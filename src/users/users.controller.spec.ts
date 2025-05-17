import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let _usersService: UsersService;

  const mockUsersService = {
    findAllEmployees: jest.fn(),
    findEmployee: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    _usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllEmployees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [
        { id: 'emp1', user: { id: '1', name: 'Employee 1' } },
        { id: 'emp2', user: { id: '2', name: 'Employee 2' } },
      ];
      
      mockUsersService.findAllEmployees.mockResolvedValue(mockEmployees);

      const result = await controller.findAllEmployees();
      
      expect(result).toEqual(mockEmployees);
      expect(mockUsersService.findAllEmployees).toHaveBeenCalled();
    });
  });

  describe('findEmployee', () => {
    it('should return an employee by ID', async () => {
      const mockEmployee = { id: 'emp1', user: { id: '1', name: 'Employee 1' } };
      mockUsersService.findEmployee.mockResolvedValue(mockEmployee);

      const result = await controller.findEmployee('emp1');
      
      expect(result).toEqual(mockEmployee);
      expect(mockUsersService.findEmployee).toHaveBeenCalledWith('emp1');
    });
  });
});
