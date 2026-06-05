import { SetMetadata } from "@nestjs/common";

import { PermissionRequirement } from "../policies/permission.types";

export const REQUIRED_PERMISSIONS_KEY = "requiredPermissions";

export function RequirePermissions(...requirements: readonly PermissionRequirement[]): MethodDecorator & ClassDecorator {
  return SetMetadata(REQUIRED_PERMISSIONS_KEY, requirements);
}
