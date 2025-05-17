import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUUID, IsEnum } from "class-validator";

export enum ReportFormat {
  PDF = "pdf",
  CSV = "csv",
}

export class ExportReportDto {
  @ApiProperty({
    description: "ID of the tourist to generate report for",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  touristId: string;

  @ApiProperty({
    description: "Format of the report",
    example: "pdf",
    enum: ReportFormat,
  })
  @IsEnum(ReportFormat)
  @IsNotEmpty()
  format: ReportFormat;
}
