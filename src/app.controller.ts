import { Controller, Get, Redirect } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";

@ApiTags("app")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: "Redirect to API documentation" })
  @ApiResponse({ status: 302, description: "Redirects to API documentation" })
  @Get()
  @Redirect('api/docs')
  redirectToDocs() {
    // This will automatically redirect to /api/docs
    return { url: 'api/docs' };
  }

  @ApiOperation({ summary: "Get API health status" })
  @ApiResponse({ status: 200, description: "Returns health status of the API" })
  @Get('health')
  getHealth(): { status: string; version: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
