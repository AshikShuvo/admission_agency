import { ForbiddenException } from "@nestjs/common";

import { PermissionRequirement } from "../policies/permission.types";

export const PERMISSION_DENIED_CODE = "PERMISSION_DENIED";

export interface PermissionDeniedDetails {
  readonly requiredPermissions: readonly PermissionRequirement[];
}

export interface PermissionDeniedResponse {
  readonly code: typeof PERMISSION_DENIED_CODE;
  readonly message: string;
  readonly details?: PermissionDeniedDetails;
}

export class PermissionDeniedException extends ForbiddenException {
  constructor(requiredPermissions: readonly PermissionRequirement[]) {
    super(buildPermissionDeniedResponse(requiredPermissions));
  }
}

function buildPermissionDeniedResponse(requiredPermissions: readonly PermissionRequirement[]): PermissionDeniedResponse {
  return {
    code: PERMISSION_DENIED_CODE,
    details: requiredPermissions.length ? { requiredPermissions } : undefined,
    message: "Authenticated user does not have the required permission."
  };
}
