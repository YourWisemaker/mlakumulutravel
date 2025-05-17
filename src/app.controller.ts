import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Get API health status" })
  @ApiResponse({ status: 200, description: "Returns health status of the API" })
  @Get()
  getHealth(): { status: string; version: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
