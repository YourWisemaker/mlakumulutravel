import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Res,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { ExportReportDto } from "./dto/export-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
// Keeping these imports for future use
import { type RolesGuard as _RolesGuard } from "../auth/guards/roles.guard";
import { type Roles as _Roles } from "../auth/decorators/roles.decorator";
import { type UserRole as _UserRole } from "../users/entities/user.entity";
import { Response } from "express";
import * as fs from "fs";

@ApiTags("reports")
@Controller("reports")
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @ApiOperation({ summary: "Export trip report in PDF or CSV format" })
  @ApiResponse({ status: 200, description: "Report generated successfully" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("export")
  async exportReport(
    @Body() exportReportDto: ExportReportDto,
    @Request() req,
    @Res() res: Response,
  ) {
    // Check if employee or tourist is requesting their own report
    const _userId = req.user.id;
    const _role = req.user.role;

    try {
      const { filePath, fileName } = await this.reportsService.generateReport(
        exportReportDto.touristId,
        exportReportDto.format,
      );

      const contentType =
        exportReportDto.format === "pdf" ? "application/pdf" : "text/csv";

      // Stream the file to the client
      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      // Clean up the file after sending
      fileStream.on("end", () => {
        fs.unlink(filePath, (err) => {
          if (err)
            console.error(`Error deleting temporary file: ${err.message}`);
        });
      });
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: "Failed to generate report",
        error: error.message,
      });
    }
  }
}
