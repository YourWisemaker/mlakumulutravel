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
  type Request as _Request,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { TouristsService } from "./tourists.service";
import { CreateTouristDto } from "./dto/create-tourist.dto";
import { UpdateTouristDto } from "./dto/update-tourist.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { TouristOwnerGuard } from "../auth/guards/tourist-owner.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("tourists")
@Controller("tourists")
export class TouristsController {
  constructor(private touristsService: TouristsService) {}

  @ApiOperation({ summary: "Get all tourists" })
  @ApiResponse({ status: 200, description: "Returns all tourists" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get()
  findAll() {
    return this.touristsService.findAll();
  }

  @ApiOperation({ summary: "Get tourist by ID" })
  @ApiResponse({ status: 200, description: "Returns tourist by ID (tourists can only access their own profile)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    // Always use tourist ID for this endpoint
    return this.touristsService.findOne(id);
  }

  @ApiOperation({ summary: "Create new tourist profile" })
  @ApiResponse({
    status: 201,
    description: "Tourist profile created successfully",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Post()
  create(@Body() createTouristDto: CreateTouristDto) {
    return this.touristsService.create(createTouristDto);
  }

  @ApiOperation({ summary: "Update tourist profile" })
  @ApiResponse({ status: 200, description: "Tourist profile updated successfully (tourists can only update their own profile)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Put(":id")
  update(@Param("id") id: string, @Body() updateTouristDto: UpdateTouristDto) {
    return this.touristsService.update(id, updateTouristDto);
  }

  @ApiOperation({ summary: "Update partial tourist profile" })
  @ApiResponse({
    status: 200,
    description: "Tourist profile partially updated successfully (tourists can only update their own profile)",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Patch(":id")
  patch(@Param("id") id: string, @Body() updateTouristDto: UpdateTouristDto) {
    return this.touristsService.update(id, updateTouristDto);
  }

  @ApiOperation({ summary: "Delete tourist profile" })
  @ApiResponse({
    status: 200,
    description: "Tourist profile deleted successfully",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.touristsService.remove(id);
  }
}
