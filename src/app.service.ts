import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth(): { status: string; version: string; timestamp: string } {
    return {
      status: "ok",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };
  }
}
