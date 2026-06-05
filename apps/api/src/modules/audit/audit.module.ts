import { Module } from "@nestjs/common";

import { AccessDenialAuditService } from "./access-denial-audit.service";

@Module({
  exports: [AccessDenialAuditService],
  providers: [AccessDenialAuditService]
})
export class AuditModule {}
