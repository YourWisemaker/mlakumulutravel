import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
} from "class-validator";

export class CreateTouristDto {
  @ApiProperty({
    description: "User ID associated with this tourist",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Passport number of the tourist",
    example: "AB1234567",
    required: false,
  })
  @IsString()
  @IsOptional()
  passportNumber?: string;

  @ApiProperty({
    description: "Nationality of the tourist",
    example: "Indonesian",
    required: false,
  })
  @IsString()
  @IsOptional()
  nationality?: string;

  @ApiProperty({
    description: "Date of birth of the tourist",
    example: "1990-01-01",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({
    description: "Phone number of the tourist",
    example: "+1234567890",
    required: false,
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({
    description: "Address of the tourist",
    example: "123 Main St, Anytown, USA",
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}
