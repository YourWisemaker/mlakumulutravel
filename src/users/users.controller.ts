import { Controller, Get, Param, UseGuards, type Post as _Post, type Body as _Body } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "./entities/user.entity";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: "Get all employees" })
  @ApiResponse({ status: 200, description: "Returns all employees" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get("employees")
  findAllEmployees() {
    return this.usersService.findAllEmployees();
  }

  @ApiOperation({ summary: "Get employee by ID" })
  @ApiResponse({ status: 200, description: "Returns employee by ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get("employees/:id")
  async findEmployee(@Param("id") id: string) {
    console.log(`Attempting to find employee with ID: ${id}`);
    try {
      const employee = await this.usersService.findEmployee(id);
      return employee;
    } catch (error) {
      console.error(`Error finding employee with ID ${id}:`, error.message);
      throw error;
    }
  }
  
  @ApiOperation({ summary: "Get employee by User ID" })
  @ApiResponse({ status: 200, description: "Returns employee by User ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get("employee/user/:userId")
  async findEmployeeByUserId(@Param("userId") userId: string) {
    console.log(`Attempting to find employee with User ID: ${userId}`);
    try {
      const employee = await this.usersService.findEmployeeByUserId(userId);
      return employee;
    } catch (error) {
      console.error(`Error finding employee with User ID ${userId}:`, error.message);
      throw error;
    }
  }

  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({ status: 200, description: "Returns all users" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({ status: 200, description: "Returns user by ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }
}
