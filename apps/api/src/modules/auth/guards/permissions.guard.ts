import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { REQUIRED_PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { PermissionRequirement } from "../policies/permission.types";
import { PermissionsService } from "../policies/permissions.service";
import { AuthenticatedRequest } from "../types/authenticated-user";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requirements = this.reflector.getAllAndOverride<readonly PermissionRequirement[] | undefined>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requirements?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException("Authenticated user context is required");
    }

    if (!this.permissionsService.canEvery(request.user.role, requirements)) {
      throw new ForbiddenException("Insufficient role permission");
    }

    return true;
  }
}
