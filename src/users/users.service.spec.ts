import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto as _CreateUserDto } from './dto/create-user.dto';
import { UserRole as _UserRole } from './entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    employee: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return a user if found by email', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if user not found by email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findOneByEmail('nonexistent@example.com');
      
      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a user if found by id', async () => {
      const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('create', () => {
    it('should create an employee user', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'EMPLOYEE', // Note: the service compares with string "EMPLOYEE"
      };
      
      const mockUser = { 
        id: '1', 
        ...createUserDto,
        employee: { id: 'emp1' }
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto as any);
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      // Use expect.objectContaining instead of exact matching since password will be hashed
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          role: createUserDto.role,
          employee: {
            create: {}
          }
        })
      });
      
      // Verify password was NOT stored as plaintext
      const createCall = mockPrismaService.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toEqual('password123');
    });

    it('should create a tourist user', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'TOURIST', // Note: the service compares with string "TOURIST"
      };
      
      const mockUser = { 
        id: '2', 
        ...createUserDto,
        tourist: { id: 'tour1' }
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createUserDto as any);
      
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: createUserDto.email },
      });
      // Use expect.objectContaining instead of exact matching since password will be hashed
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          role: createUserDto.role,
          tourist: {
            create: {}
          }
        })
      });
      
      // Verify password was NOT stored as plaintext
      const createCall = mockPrismaService.user.create.mock.calls[0][0];
      expect(createCall.data.password).not.toEqual('password123');
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'existing@example.com',
        password: 'password123',
        role: 'TOURIST',
      };
      
      mockPrismaService.user.findUnique.mockResolvedValue({ id: '3', email: 'existing@example.com' });

      await expect(service.create(createUserDto as any)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('findAllEmployees', () => {
    it('should return all employees', async () => {
      const mockEmployees = [
        { id: 'emp1', user: { id: '1', name: 'Employee 1' } },
        { id: 'emp2', user: { id: '2', name: 'Employee 2' } },
      ];
      
      mockPrismaService.employee.findMany.mockResolvedValue(mockEmployees);

      const result = await service.findAllEmployees();
      
      expect(result).toEqual(mockEmployees);
      expect(mockPrismaService.employee.findMany).toHaveBeenCalledWith({
        include: {
          user: true,
        },
      });
    });
  });

  describe('findEmployee', () => {
    it('should return an employee if found', async () => {
      const mockEmployee = { id: 'emp1', user: { id: '1', name: 'Employee 1' } };
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.findEmployee('emp1');
      
      expect(result).toEqual(mockEmployee);
      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { id: 'emp1' },
        include: {
          user: true,
        },
      });
    });

    it('should throw NotFoundException if employee not found', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.findEmployee('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findEmployeeByUserId', () => {
    it('should return an employee if found by user ID', async () => {
      const mockEmployee = { id: 'emp1', userId: 'user1', user: { id: 'user1', name: 'Employee 1' } };
      mockPrismaService.employee.findUnique.mockResolvedValue(mockEmployee);

      const result = await service.findEmployeeByUserId('user1');
      
      expect(result).toEqual(mockEmployee);
      expect(mockPrismaService.employee.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        include: {
          user: true,
        },
      });
    });

    it('should throw NotFoundException if employee not found by user ID', async () => {
      mockPrismaService.employee.findUnique.mockResolvedValue(null);

      await expect(service.findEmployeeByUserId('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
