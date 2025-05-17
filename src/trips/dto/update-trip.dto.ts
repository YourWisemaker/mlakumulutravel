import { PartialType } from "@nestjs/swagger";
import { CreateTripDto } from "./create-trip.dto";
import { OmitType } from "@nestjs/swagger";

export class UpdateTripDto extends PartialType(
  OmitType(CreateTripDto, ["touristId"] as const),
) {}
