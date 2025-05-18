import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
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
import { TouristOwnerGuard } from "../auth/guards/tourist-owner.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("trips")
@Controller("trips")
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @ApiOperation({ summary: "Get all trips (employees) or own trips (tourists)" })
  @ApiResponse({ status: 200, description: "Returns all trips for employees or own trips for tourists" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // If user is an employee, return all trips
    if (req.user.role === UserRole.EMPLOYEE) {
      return this.tripsService.findAll();
    }
    
    // If user is a tourist, return only their trips
    return this.tripsService.findAllByTouristUserId(req.user.id);
  }

  @ApiOperation({ summary: "Get trip by ID" })
  @ApiResponse({ status: 200, description: "Returns trip by ID (tourists can only access their own trips)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Request() _req) {
    return this.tripsService.findOne(id);
  }

  @ApiOperation({ summary: "Get all trips for a tourist" })
  @ApiResponse({ status: 200, description: "Returns all trips for a tourist (tourists can only access their own trips)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Get("tourist/:touristId")
  findByTourist(@Param("touristId") touristId: string) {
    return this.tripsService.findAllByTourist(touristId);
  }

  @ApiOperation({ summary: "Create new trip" })
  @ApiResponse({ status: 201, description: "Trip created successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Post()
  create(@Body() createTripDto: CreateTripDto, @Request() req) {
    // Extract transaction data if provided
    const { transaction, ...tripData } = createTripDto as any;
    
    // Pass transaction data to service if it exists
    if (transaction) {
      return this.tripsService.create(tripData, req.user.id, transaction);
    }
    
    return this.tripsService.create(tripData, req.user.id);
  }

  @ApiOperation({ summary: "Update trip" })
  @ApiResponse({ status: 200, description: "Trip updated successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateTripDto: UpdateTripDto, @Request() req) {
    // Extract transaction data if provided
    const { transaction, ...tripData } = updateTripDto as any;
    
    // Pass transaction data to service if it exists
    if (transaction) {
      return this.tripsService.update(id, tripData, req.user.id, transaction);
    }
    
    return this.tripsService.update(id, tripData, req.user.id);
  }

  @ApiOperation({ summary: "Partially update trip" })
  @ApiResponse({ status: 200, description: "Trip partially updated successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Patch(":id")
  patch(@Param("id") id: string, @Body() updateTripDto: UpdateTripDto, @Request() req) {
    // Extract transaction data if provided
    const { transaction, ...tripData } = updateTripDto as any;
    
    // Pass transaction data to service if it exists
    if (transaction) {
      return this.tripsService.update(id, tripData, req.user.id, transaction);
    }
    
    return this.tripsService.update(id, tripData, req.user.id);
  }

  @ApiOperation({ summary: "Delete trip" })
  @ApiResponse({ status: 200, description: "Trip deleted successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.tripsService.remove(id, req.user.id);
  }
}
