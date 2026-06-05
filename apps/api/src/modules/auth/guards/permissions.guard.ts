import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AccessDenialAuditService } from "../../audit/access-denial-audit.service";
import { REQUIRED_PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { PermissionDeniedException } from "../errors/permission-denied.exception";
import { PermissionRequirement } from "../policies/permission.types";
import { PermissionsService } from "../policies/permissions.service";
import { AuthenticatedRequest } from "../types/authenticated-user";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly accessDenialAuditService: AccessDenialAuditService
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

    const deniedRequirements = requirements.filter((requirement) => !this.permissionsService.can(request.user!.role, requirement));

    if (deniedRequirements.length) {
      if (deniedRequirements.some((requirement) => this.isSensitiveRequirement(requirement))) {
        this.recordSensitiveDenial(request, deniedRequirements);
      }

      throw new PermissionDeniedException(deniedRequirements);
    }

    return true;
  }

  private isSensitiveRequirement(requirement: PermissionRequirement): boolean {
    return ["approve", "confirm", "manage", "viewSensitive"].includes(requirement.action);
  }

  private recordSensitiveDenial(
    request: AuthenticatedRequest,
    deniedRequirements: readonly PermissionRequirement[]
  ): void {
    try {
      this.accessDenialAuditService.recordSensitiveDenial({
        method: request.method,
        occurredAt: new Date(),
        path: request.originalUrl,
        requiredPermissions: deniedRequirements,
        user: request.user!
      });
    } catch {
      // Authorization must remain the source of truth even if audit logging fails.
    }
  }
}
