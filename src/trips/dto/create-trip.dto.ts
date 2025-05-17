import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  IsObject,
  IsUUID,
} from "class-validator";

export class CreateTripDto {
  @ApiProperty({
    description: "Name of the trip",
    example: "Bali Adventure",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Start date and time of the trip (UTC)",
    example: "2025-06-01T08:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  startDateTime: string;

  @ApiProperty({
    description: "End date and time of the trip (UTC)",
    example: "2025-06-07T16:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  endDateTime: string;

  @ApiProperty({
    description: "Destination details of the trip",
    example: {
      city: "Bali",
      country: "Indonesia",
      coordinates: {
        latitude: -8.409518,
        longitude: 115.188919,
      },
      attractions: ["Beach", "Temple"],
    },
    type: "object",
    additionalProperties: true,
  })
  @IsObject()
  @IsNotEmpty()
  tripDestination: Record<string, any>;

  @ApiProperty({
    description: "Description of the trip",
    example: "A week-long adventure exploring the beautiful island of Bali",
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Price of the trip",
    example: 1200.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: "Tourist ID associated with this trip",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  touristId: string;
}
