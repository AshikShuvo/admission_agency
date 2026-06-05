import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { CurrentUserGuard } from "./guards/current-user.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { PermissionsService } from "./policies/permissions.service";

@Module({
  controllers: [AuthController],
  exports: [AuthService, CurrentUserGuard, PermissionsGuard, PermissionsService],
  providers: [AuthService, CurrentUserGuard, PermissionsGuard, PermissionsService]
})
export class AuthModule {}
