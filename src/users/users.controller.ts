import { Controller, Get, Param, UseGuards } from "@nestjs/common";
// Keeping these imports for future use
import { type Post as _Post, type Body as _Body } from "@nestjs/common";
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
  findEmployee(@Param("id") id: string) {
    return this.usersService.findEmployee(id);
  }
}
