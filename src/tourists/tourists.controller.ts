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
import { TouristsService } from "./tourists.service";
import { CreateTouristDto } from "./dto/create-tourist.dto";
import { UpdateTouristDto } from "./dto/update-tourist.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
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
  @ApiResponse({ status: 200, description: "Returns tourist by ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    // Check if employee or if tourist is requesting their own profile
    if (req.user.role === UserRole.EMPLOYEE || req.user.id === id) {
      return this.touristsService.findOne(id);
    }
    return this.touristsService.findByUserId(id);
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
  @ApiResponse({
    status: 200,
    description: "Tourist profile updated successfully",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(":id")
  update(
    @Param("id") id: string,
    @Body() updateTouristDto: UpdateTouristDto,
    @Request() req,
  ) {
    // Check if employee or if tourist is updating their own profile
    if (req.user.role === UserRole.EMPLOYEE || req.user.id === id) {
      return this.touristsService.update(id, updateTouristDto);
    }
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
