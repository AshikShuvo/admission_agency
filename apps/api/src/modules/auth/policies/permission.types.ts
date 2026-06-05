export enum UserRole {
  OWNER = "OWNER",
  CONSULTANT = "CONSULTANT",
  ACCOUNTS = "ACCOUNTS",
  ADMISSION = "ADMISSION",
  VISA = "VISA"
}

export const userRoles = [
  UserRole.OWNER,
  UserRole.CONSULTANT,
  UserRole.ACCOUNTS,
  UserRole.ADMISSION,
  UserRole.VISA
] as const;

export type PermissionResource =
  | "admission"
  | "catalog"
  | "commissions"
  | "documents"
  | "files"
  | "payments"
  | "reports"
  | "users"
  | "visa";

export type PermissionAction =
  | "approve"
  | "confirm"
  | "create"
  | "delete"
  | "manage"
  | "read"
  | "update"
  | "viewSensitive";

export type DataScope = "all" | "assigned" | "department" | "financial" | "owner";

export interface PermissionDefinition {
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
  readonly scope: DataScope;
}

export interface PermissionRequirement {
  readonly resource: PermissionResource;
  readonly action: PermissionAction;
}
