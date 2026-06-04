import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHealth() {
    return {
      ok: true,
      service: "admission-agency-api"
    };
  }
}
