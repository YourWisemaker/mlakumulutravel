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

  // Health endpoint moved to dedicated HealthModule with Terminus
}
