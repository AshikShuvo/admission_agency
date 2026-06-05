import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RequirePermissions } from "./decorators/require-permissions.decorator";
import { CurrentUserResponseDto } from "./dto/current-user-response.dto";
import { CurrentUserGuard } from "./guards/current-user.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { AuthenticatedUser } from "./types/authenticated-user";

interface ProtectedActionResponse {
  readonly ok: true;
}

@ApiTags("auth")
@ApiBearerAuth()
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @UseGuards(CurrentUserGuard)
  @ApiOperation({ summary: "Return the current user and role permission contract" })
  @ApiHeader({ name: "x-user-id", required: true })
  @ApiHeader({ name: "x-user-email", required: true })
  @ApiHeader({ name: "x-user-role", required: true })
  @ApiOkResponse({ type: CurrentUserResponseDto })
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): CurrentUserResponseDto {
    return this.authService.getCurrentUser(user);
  }

  @Post("checks/users/manage")
  @UseGuards(CurrentUserGuard, PermissionsGuard)
  @RequirePermissions({ action: "manage", resource: "users" })
  checkUserManagement(): ProtectedActionResponse {
    return { ok: true };
  }

  @Post("checks/catalog/manage")
  @UseGuards(CurrentUserGuard, PermissionsGuard)
  @RequirePermissions({ action: "manage", resource: "catalog" })
  checkCatalogManagement(): ProtectedActionResponse {
    return { ok: true };
  }

  @Post("checks/commissions/manage")
  @UseGuards(CurrentUserGuard, PermissionsGuard)
  @RequirePermissions({ action: "manage", resource: "commissions" })
  checkCommissionManagement(): ProtectedActionResponse {
    return { ok: true };
  }

  @Post("checks/admission/approve")
  @UseGuards(CurrentUserGuard, PermissionsGuard)
  @RequirePermissions({ action: "approve", resource: "admission" })
  checkAdmissionApproval(): ProtectedActionResponse {
    return { ok: true };
  }

  @Post("checks/visa/approve")
  @UseGuards(CurrentUserGuard, PermissionsGuard)
  @RequirePermissions({ action: "approve", resource: "visa" })
  checkVisaApproval(): ProtectedActionResponse {
    return { ok: true };
  }
}
