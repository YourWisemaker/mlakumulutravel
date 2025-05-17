import {
  Controller,
  Get,
  Post,
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
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @ApiOperation({ summary: "Get all feedback" })
  @ApiResponse({ status: 200, description: "Returns all feedback" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get()
  findAll() {
    return this.feedbackService.findAll();
  }

  @ApiOperation({ summary: "Get feedback by ID" })
  @ApiResponse({ status: 200, description: "Returns feedback by ID" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.feedbackService.findOne(id);
  }

  @ApiOperation({ summary: "Get all feedback for a trip" })
  @ApiResponse({ status: 200, description: "Returns all feedback for a trip" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("trip/:tripId")
  findByTrip(@Param("tripId") tripId: string) {
    return this.feedbackService.findByTrip(tripId);
  }

  @ApiOperation({ summary: "Get all feedback from a tourist" })
  @ApiResponse({
    status: 200,
    description: "Returns all feedback from a tourist",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Get("tourist/:touristId")
  findByTourist(@Param("touristId") touristId: string) {
    return this.feedbackService.findByTourist(touristId);
  }

  @ApiOperation({ summary: "Create new feedback" })
  @ApiResponse({ status: 201, description: "Feedback created successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    return this.feedbackService.create(req.user.id, createFeedbackDto);
  }

  @ApiOperation({ summary: "Delete feedback" })
  @ApiResponse({ status: 200, description: "Feedback deleted successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.feedbackService.remove(id);
  }
}
