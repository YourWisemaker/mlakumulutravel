import {
  Controller,
  Get,
  Post,
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
import { FeedbackService } from "./feedback.service";
import { CreateFeedbackDto } from "./dto/create-feedback.dto";
import { UpdateFeedbackDto } from "./dto/update-feedback.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TouristOwnerGuard } from "../auth/guards/tourist-owner.guard";
import { UserRole } from "../users/entities/user.entity";

@ApiTags("feedback")
@Controller("feedback")
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  @ApiOperation({ summary: "Get all feedback (employees) or own feedback (tourists)" })
  @ApiResponse({ status: 200, description: "Returns all feedback for employees or own feedback for tourists" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req) {
    // If user is an employee, return all feedback
    if (req.user.role === UserRole.EMPLOYEE) {
      return this.feedbackService.findAll();
    }

    // For tourists, find their ID and return only their feedback
    return this.feedbackService.findByTourist(req.user.id);
  }

  @ApiOperation({ summary: "Get feedback by ID" })
  @ApiResponse({ status: 200, description: "Returns feedback by ID (tourists can only access their own feedback)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
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
    description: "Returns all feedback from a tourist (tourists can only access their own feedback)",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
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

  @ApiOperation({ summary: "Update feedback" })
  @ApiResponse({ status: 200, description: "Feedback updated successfully (tourists can only update their own feedback)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Request() req
  ) {
    return this.feedbackService.update(id, req.user.id, updateFeedbackDto);
  }

  @ApiOperation({ summary: "Delete feedback" })
  @ApiResponse({ status: 200, description: "Feedback deleted successfully (tourists can only delete their own feedback)" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, TouristOwnerGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    return this.feedbackService.remove(id, req.user.id);
  }
}
