import { Injectable, Logger } from "@nestjs/common";

import { PermissionRequirement } from "../auth/policies/permission.types";
import { AuthenticatedUser } from "../auth/types/authenticated-user";

export interface AccessDenialAuditEvent {
  readonly method: string;
  readonly occurredAt: Date;
  readonly path: string;
  readonly requiredPermissions: readonly PermissionRequirement[];
  readonly user: AuthenticatedUser;
}

@Injectable()
export class AccessDenialAuditService {
  private readonly logger = new Logger(AccessDenialAuditService.name);

  recordSensitiveDenial(event: AccessDenialAuditEvent): void {
    this.logger.warn({
      method: event.method,
      occurredAt: event.occurredAt.toISOString(),
      path: event.path,
      requiredPermissions: event.requiredPermissions,
      user: {
        email: event.user.email,
        id: event.user.id,
        role: event.user.role
      }
    });
  }
}
