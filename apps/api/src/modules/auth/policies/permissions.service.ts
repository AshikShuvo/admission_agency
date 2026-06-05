import { Injectable } from "@nestjs/common";

import { PermissionDefinition, PermissionRequirement, UserRole } from "./permission.types";
import { rolePermissions } from "./role-permissions";

export type WorkspaceId = "catalog" | "files" | "payments" | "admission" | "visa" | "reports" | "commissions" | "users";

export interface WorkspaceAccess {
  readonly id: WorkspaceId;
  readonly label: string;
  readonly allowed: boolean;
}

interface WorkspaceRule {
  readonly id: WorkspaceId;
  readonly label: string;
  readonly requirement: PermissionRequirement;
}

const workspaceRules: readonly WorkspaceRule[] = [
  { id: "catalog", label: "Catalog", requirement: { action: "manage", resource: "catalog" } },
  { id: "files", label: "Files", requirement: { action: "read", resource: "files" } },
  { id: "payments", label: "Payments", requirement: { action: "read", resource: "payments" } },
  { id: "admission", label: "Admission", requirement: { action: "read", resource: "admission" } },
  { id: "visa", label: "Visa", requirement: { action: "read", resource: "visa" } },
  { id: "reports", label: "Reports", requirement: { action: "read", resource: "reports" } },
  { id: "commissions", label: "Commissions", requirement: { action: "manage", resource: "commissions" } },
  { id: "users", label: "Users", requirement: { action: "manage", resource: "users" } }
];

@Injectable()
export class PermissionsService {
  getPermissionsForRole(role: UserRole): readonly PermissionDefinition[] {
    return rolePermissions[role];
  }

  can(role: UserRole, requirement: PermissionRequirement): boolean {
    return this.getPermissionsForRole(role).some(
      (permission) => permission.resource === requirement.resource && permission.action === requirement.action
    );
  }

  canEvery(role: UserRole, requirements: readonly PermissionRequirement[]): boolean {
    return requirements.every((requirement) => this.can(role, requirement));
  }

  getWorkspacesForRole(role: UserRole): readonly WorkspaceAccess[] {
    return workspaceRules.map((workspace) => ({
      allowed: this.can(role, workspace.requirement),
      id: workspace.id,
      label: workspace.label
    }));
  }
}
