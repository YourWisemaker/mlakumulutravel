import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTouristDto } from "./dto/create-tourist.dto";
import { UpdateTouristDto } from "./dto/update-tourist.dto";

@Injectable()
export class TouristsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tourist.findMany({
      include: {
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!tourist) {
      throw new NotFoundException(`Tourist with ID ${id} not found`);
    }

    return tourist;
  }

  async findByUserId(userId: string) {
    const tourist = await this.prisma.tourist.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!tourist) {
      throw new NotFoundException(`Tourist with user ID ${userId} not found`);
    }

    return tourist;
  }

  async create(createTouristDto: CreateTouristDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: createTouristDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createTouristDto.userId} not found`,
      );
    }

    // Prisma requires the structure to be a specific way based on schema
    return this.prisma.tourist.create({
      data: {
        passportNumber: createTouristDto.passportNumber,
        nationality: createTouristDto.nationality,
        dateOfBirth: createTouristDto.dateOfBirth
          ? new Date(createTouristDto.dateOfBirth)
          : undefined,
        phoneNumber: createTouristDto.phoneNumber,
        address: createTouristDto.address,
        user: {
          connect: { id: createTouristDto.userId },
        },
      },
      include: {
        user: true,
      },
    });
  }

  async update(id: string, updateTouristDto: UpdateTouristDto) {
    // First ensure the tourist exists
    await this.findOne(id);

    // Prepare the data for update
    const data: any = {};

    if (updateTouristDto.passportNumber)
      data.passportNumber = updateTouristDto.passportNumber;
    if (updateTouristDto.nationality)
      data.nationality = updateTouristDto.nationality;
    if (updateTouristDto.dateOfBirth)
      data.dateOfBirth = new Date(updateTouristDto.dateOfBirth);
    if (updateTouristDto.phoneNumber)
      data.phoneNumber = updateTouristDto.phoneNumber;
    if (updateTouristDto.address) data.address = updateTouristDto.address;

    return this.prisma.tourist.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    // First ensure the tourist exists
    await this.findOne(id);

    await this.prisma.tourist.delete({
      where: { id },
    });
  }
}
