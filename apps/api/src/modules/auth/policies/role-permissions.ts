import { PermissionAction, PermissionDefinition, PermissionResource, UserRole } from "./permission.types";

const ownerResources: readonly PermissionResource[] = [
  "admission",
  "catalog",
  "commissions",
  "documents",
  "files",
  "payments",
  "reports",
  "users",
  "visa"
];

const ownerActions: readonly PermissionAction[] = [
  "approve",
  "confirm",
  "create",
  "delete",
  "manage",
  "read",
  "update",
  "viewSensitive"
];

function buildOwnerPermissions(): readonly PermissionDefinition[] {
  return ownerResources.flatMap((resource) =>
    ownerActions.map((action) => ({
      action,
      resource,
      scope: "all"
    }))
  );
}

export const rolePermissions = {
  [UserRole.OWNER]: buildOwnerPermissions(),
  [UserRole.CONSULTANT]: [
    { action: "read", resource: "catalog", scope: "all" },
    { action: "read", resource: "files", scope: "assigned" },
    { action: "create", resource: "files", scope: "assigned" },
    { action: "update", resource: "files", scope: "assigned" },
    { action: "read", resource: "documents", scope: "assigned" },
    { action: "create", resource: "documents", scope: "assigned" },
    { action: "read", resource: "payments", scope: "assigned" },
    { action: "read", resource: "reports", scope: "assigned" }
  ],
  [UserRole.ACCOUNTS]: [
    { action: "read", resource: "files", scope: "financial" },
    { action: "read", resource: "payments", scope: "financial" },
    { action: "create", resource: "payments", scope: "financial" },
    { action: "update", resource: "payments", scope: "financial" },
    { action: "confirm", resource: "payments", scope: "financial" },
    { action: "read", resource: "reports", scope: "financial" }
  ],
  [UserRole.ADMISSION]: [
    { action: "read", resource: "admission", scope: "department" },
    { action: "update", resource: "admission", scope: "department" },
    { action: "approve", resource: "admission", scope: "department" },
    { action: "read", resource: "documents", scope: "department" },
    { action: "update", resource: "documents", scope: "department" },
    { action: "read", resource: "files", scope: "department" },
    { action: "read", resource: "reports", scope: "department" }
  ],
  [UserRole.VISA]: [
    { action: "read", resource: "visa", scope: "department" },
    { action: "update", resource: "visa", scope: "department" },
    { action: "approve", resource: "visa", scope: "department" },
    { action: "read", resource: "documents", scope: "department" },
    { action: "update", resource: "documents", scope: "department" },
    { action: "read", resource: "files", scope: "department" },
    { action: "read", resource: "reports", scope: "department" }
  ]
} as const satisfies Record<UserRole, readonly PermissionDefinition[]>;
