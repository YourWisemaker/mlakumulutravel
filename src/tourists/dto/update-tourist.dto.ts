import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateTouristDto } from "./create-tourist.dto";

export class UpdateTouristDto extends PartialType(
  OmitType(CreateTouristDto, ["userId"] as const),
) {}
