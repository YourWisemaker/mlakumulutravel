import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { TripsService } from "./trips.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { UpdateTripDto } from "./dto/update-trip.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("trips")
@Controller("trips")
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @ApiOperation({ summary: "Get all trips" })
  @ApiResponse({ status: 200, description: "Returns all trips" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @ApiOperation({ summary: "Get trip by ID" })
  @ApiResponse({ status: 200, description: "Returns trip by ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Request() _req) {
    return this.tripsService.findOne(id);
  }

  @ApiOperation({ summary: "Get all trips for a tourist" })
  @ApiResponse({ status: 200, description: "Returns all trips for a tourist" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("tourist/:touristId")
  findByTourist(@Param("touristId") touristId: string, @Request() req) {
    // Allow employee access or tourist viewing their own trips
    if (req.user.role === UserRole.EMPLOYEE || req.user.id === touristId) {
      return this.tripsService.findAllByTouristUserId(touristId);
    }

    // For tourists, only return their own trips
    return this.tripsService.findAllByTouristUserId(req.user.id);
  }

  @ApiOperation({ summary: "Create new trip" })
  @ApiResponse({ status: 201, description: "Trip created successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripsService.create(createTripDto);
  }

  @ApiOperation({ summary: "Update trip" })
  @ApiResponse({ status: 200, description: "Trip updated successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripsService.update(id, updateTripDto);
  }

  @ApiOperation({ summary: "Delete trip" })
  @ApiResponse({ status: 200, description: "Trip deleted successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.tripsService.remove(id);
  }
}
