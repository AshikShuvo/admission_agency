import { Injectable } from "@nestjs/common";

interface HealthResponse {
  readonly ok: true;
  readonly service: "admission-agency-api";
}

@Injectable()
export class AppService {
  getHealth(): HealthResponse {
    return {
      ok: true,
      service: "admission-agency-api"
    };
  }
}
