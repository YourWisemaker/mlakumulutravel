import { Module } from "@nestjs/common";
import { TouristsService } from "./tourists.service";
import { TouristsController } from "./tourists.controller";

@Module({
  imports: [],
  providers: [TouristsService],
  controllers: [TouristsController],
  exports: [TouristsService],
})
export class TouristsModule {}
