import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
// Keeping for future use
import { type Prisma as _Prisma } from "@prisma/client";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }

    // Use Prisma transaction to create user and role-specific record in a single transaction
    if (createUserDto.role === "EMPLOYEE") {
      return this.prisma.user.create({
        data: {
          ...createUserDto,
          employee: {
            create: {},
          },
        },
      });
    } else {
      return this.prisma.user.create({
        data: {
          ...createUserDto,
          tourist: {
            create: {},
          },
        },
      });
    }
  }

  async findAllEmployees() {
    return this.prisma.employee.findMany({
      include: {
        user: true,
      },
    });
  }

  async findEmployee(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }

    return employee;
  }

  async findEmployeeByUserId(userId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with user ID ${userId} not found`);
    }

    return employee;
  }
}
