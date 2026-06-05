import { Module } from "@nestjs/common";

import { AuditModule } from "../audit/audit.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CurrentUserGuard } from "./guards/current-user.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { PermissionsService } from "./policies/permissions.service";

@Module({
  controllers: [AuthController],
  exports: [AuditModule, AuthService, CurrentUserGuard, PermissionsGuard, PermissionsService],
  imports: [AuditModule],
  providers: [AuthService, CurrentUserGuard, PermissionsGuard, PermissionsService]
})
export class AuthModule {}
