import { PartialType } from "@nestjs/swagger";
import { CreateTouristDto } from "./create-tourist.dto";
import { OmitType } from "@nestjs/swagger";

export class UpdateTouristDto extends PartialType(
  OmitType(CreateTouristDto, ["userId"] as const),
) {}
