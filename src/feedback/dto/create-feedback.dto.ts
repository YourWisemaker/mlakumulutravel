import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsInt, IsString, IsUUID, Min, Max } from "class-validator";

export class CreateFeedbackDto {
  @ApiProperty({
    description: "Rating of the trip (1-5)",
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @ApiProperty({
    description: "Comment or feedback about the trip",
    example:
      "The trip was amazing! The tour guide was very knowledgeable and friendly.",
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiProperty({
    description: "ID of the trip",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  @IsNotEmpty()
  tripId: string;
}
