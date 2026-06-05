export type UserRole = "OWNER" | "CONSULTANT" | "ACCOUNTS" | "ADMISSION" | "VISA";

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

export type WorkspaceId = "catalog" | "files" | "payments" | "admission" | "visa" | "reports" | "commissions" | "users";

export interface WorkspaceAccess {
  readonly id: WorkspaceId;
  readonly label: string;
  readonly allowed: boolean;
}

export interface CurrentUserProfile {
  readonly id: string;
  readonly email: string;
  readonly role: UserRole;
}

export interface CurrentAccessResponse {
  readonly user: CurrentUserProfile;
  readonly permissions: readonly PermissionDefinition[];
  readonly workspaces: readonly WorkspaceAccess[];
}

export type FileStatus =
  | "FILE_OPENED"
  | "PENDING_PAYMENT_FILE_OPENING"
  | "ADMISSION_IN_PROGRESS"
  | "PENDING_PAYMENT_ADMISSION"
  | "DOCUMENTS_PENDING"
  | "APPLICATION_SUBMITTED"
  | "OFFER_LETTER_RECEIVED"
  | "ADMISSION_APPROVED"
  | "VISA_IN_PROGRESS"
  | "PENDING_PAYMENT_VISA"
  | "VISA_APPLIED"
  | "VISA_APPROVED"
  | "VISA_REJECTED"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;
