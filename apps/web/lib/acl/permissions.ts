export const STAFF_ROLES = ["OWNER", "CONSULTANT", "ACCOUNTS", "ADMISSION", "VISA"] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export type WorkspaceId =
  | "catalog"
  | "files"
  | "payments"
  | "admission"
  | "visa"
  | "reports"
  | "users"
  | "commissions";

export type PermissionKey =
  | "catalog.view"
  | "catalog.manage"
  | "files.view_all"
  | "files.view_assigned"
  | "files.create"
  | "payments.view"
  | "payments.confirm"
  | "admission.view"
  | "admission.approve"
  | "visa.view"
  | "visa.approve"
  | "reports.view_full"
  | "reports.view_limited"
  | "reports.view_own"
  | "users.manage"
  | "commissions.view"
  | "commissions.manage";

export type ActionId =
  | "manage-catalog"
  | "create-student-file"
  | "confirm-payment"
  | "approve-admission"
  | "record-visa-outcome"
  | "manage-users"
  | "enter-commission"
  | "view-reports";

export type WorkspaceBadgeTone = "commission" | "hold" | "info" | "success" | "warning";

export type ApiPermissionResource =
  | "admission"
  | "catalog"
  | "commissions"
  | "documents"
  | "files"
  | "payments"
  | "reports"
  | "users"
  | "visa";

export type ApiPermissionAction =
  | "approve"
  | "confirm"
  | "create"
  | "delete"
  | "manage"
  | "read"
  | "update"
  | "viewSensitive";

export type ApiDataScope = "all" | "assigned" | "department" | "financial" | "owner";

export interface ApiPermissionDefinition {
  readonly resource: ApiPermissionResource;
  readonly action: ApiPermissionAction;
  readonly scope: ApiDataScope;
}

export interface CurrentAccessResponse {
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly name?: string;
    readonly role: string;
  };
  readonly permissions: readonly ApiPermissionDefinition[];
  readonly workspaces: readonly {
    readonly id: WorkspaceId;
    readonly label: string;
    readonly allowed: boolean;
  }[];
}

export interface CurrentUserWorkspace {
  readonly id: WorkspaceId;
  readonly label: string;
}

export interface CurrentUserAccess {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: StaffRole;
  readonly permissions: readonly PermissionKey[];
  readonly workspaces: readonly CurrentUserWorkspace[];
}

export interface WorkspaceConfig {
  readonly id: WorkspaceId;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly requiredPermissions: readonly PermissionKey[];
  readonly statusLabel: string;
  readonly tone: WorkspaceBadgeTone;
}

export interface ActionConfig {
  readonly id: ActionId;
  readonly label: string;
  readonly description: string;
  readonly requiredPermissions: readonly PermissionKey[];
  readonly workspaceId: WorkspaceId;
  readonly unavailableReason: string;
  readonly unauthorizedMode: "disabled" | "hidden";
}

export interface ActionState extends ActionConfig {
  readonly disabled: boolean;
  readonly hidden: boolean;
  readonly reason: string | null;
}

export type WorkspaceRouteAccess =
  | {
      readonly reason: null;
      readonly status: "allowed";
      readonly workspace: WorkspaceConfig;
    }
  | {
      readonly reason: string;
      readonly status: "blocked";
      readonly workspace: WorkspaceConfig;
    }
  | {
      readonly reason: string;
      readonly status: "unknown";
      readonly workspaceId: string;
    };

export const WORKSPACE_CONFIG = [
  {
    id: "catalog",
    label: "Catalog",
    description: "Countries, universities, programs, and packages.",
    href: "/workspaces/catalog",
    requiredPermissions: ["catalog.view"],
    statusLabel: "Programs",
    tone: "commission"
  },
  {
    id: "files",
    label: "Files",
    description: "Assigned student files, student profile, and processing status.",
    href: "/workspaces/files",
    requiredPermissions: ["files.view_all", "files.view_assigned"],
    statusLabel: "Cases",
    tone: "info"
  },
  {
    id: "payments",
    label: "Payments",
    description: "Dues, deposits, receipts, and stage financial clearance.",
    href: "/workspaces/payments",
    requiredPermissions: ["payments.view"],
    statusLabel: "Clearance",
    tone: "warning"
  },
  {
    id: "admission",
    label: "Admission",
    description: "Admission documents, submissions, and offer status.",
    href: "/workspaces/admission",
    requiredPermissions: ["admission.view"],
    statusLabel: "Documents",
    tone: "hold"
  },
  {
    id: "visa",
    label: "Visa",
    description: "Visa documents, submission details, and outcomes.",
    href: "/workspaces/visa",
    requiredPermissions: ["visa.view"],
    statusLabel: "Outcome",
    tone: "success"
  },
  {
    id: "reports",
    label: "Reports",
    description: "Role-scoped performance, revenue, and file status views.",
    href: "/workspaces/reports",
    requiredPermissions: ["reports.view_full", "reports.view_limited", "reports.view_own"],
    statusLabel: "Scoped",
    tone: "info"
  },
  {
    id: "users",
    label: "Users",
    description: "Staff accounts, access status, and role assignment.",
    href: "/workspaces/users",
    requiredPermissions: ["users.manage"],
    statusLabel: "Owner",
    tone: "commission"
  },
  {
    id: "commissions",
    label: "Commissions",
    description: "University commission entries and confidential revenue records.",
    href: "/workspaces/commissions",
    requiredPermissions: ["commissions.view"],
    statusLabel: "Owner",
    tone: "commission"
  }
] as const satisfies readonly WorkspaceConfig[];

export const ACTION_CONFIG = [
  {
    id: "manage-catalog",
    label: "Manage catalog",
    description: "Create, update, or deactivate catalog records.",
    requiredPermissions: ["catalog.manage"],
    workspaceId: "catalog",
    unavailableReason: "Only Owner can manage catalog records.",
    unauthorizedMode: "hidden"
  },
  {
    id: "create-student-file",
    label: "Create student file",
    description: "Start a new student case from counselling.",
    requiredPermissions: ["files.create"],
    workspaceId: "files",
    unavailableReason: "This role cannot create student files.",
    unauthorizedMode: "disabled"
  },
  {
    id: "confirm-payment",
    label: "Confirm payment",
    description: "Record deposit confirmation and clear the stage gate.",
    requiredPermissions: ["payments.confirm"],
    workspaceId: "payments",
    unavailableReason: "Only Owner or Accounts can confirm payments.",
    unauthorizedMode: "disabled"
  },
  {
    id: "approve-admission",
    label: "Approve admission",
    description: "Move an eligible file from admission to visa processing.",
    requiredPermissions: ["admission.approve"],
    workspaceId: "admission",
    unavailableReason: "Accounts and non-admission roles cannot approve admission stages.",
    unauthorizedMode: "disabled"
  },
  {
    id: "record-visa-outcome",
    label: "Record visa outcome",
    description: "Approve, reject, or complete the visa stage.",
    requiredPermissions: ["visa.approve"],
    workspaceId: "visa",
    unavailableReason: "Accounts and non-visa roles cannot approve visa stages.",
    unauthorizedMode: "disabled"
  },
  {
    id: "manage-users",
    label: "Manage users",
    description: "Create staff accounts and change role assignments.",
    requiredPermissions: ["users.manage"],
    workspaceId: "users",
    unavailableReason: "Only Owner can manage users.",
    unauthorizedMode: "hidden"
  },
  {
    id: "enter-commission",
    label: "Enter commission",
    description: "Create or update university commission records.",
    requiredPermissions: ["commissions.manage"],
    workspaceId: "commissions",
    unavailableReason: "Only Owner can view or enter commission records.",
    unauthorizedMode: "hidden"
  },
  {
    id: "view-reports",
    label: "Open reports",
    description: "View the reports available to this role.",
    requiredPermissions: ["reports.view_full", "reports.view_limited", "reports.view_own"],
    workspaceId: "reports",
    unavailableReason: "No report scope is available for this role.",
    unauthorizedMode: "disabled"
  }
] as const satisfies readonly ActionConfig[];

const ROLE_PERMISSIONS = {
  OWNER: [
    "catalog.view",
    "catalog.manage",
    "files.view_all",
    "files.view_assigned",
    "files.create",
    "payments.view",
    "payments.confirm",
    "admission.view",
    "admission.approve",
    "visa.view",
    "visa.approve",
    "reports.view_full",
    "reports.view_limited",
    "reports.view_own",
    "users.manage",
    "commissions.view",
    "commissions.manage"
  ],
  CONSULTANT: ["catalog.view", "files.view_assigned", "files.create", "reports.view_own"],
  ACCOUNTS: ["files.view_all", "payments.view", "payments.confirm", "reports.view_limited"],
  ADMISSION: ["catalog.view", "admission.view", "admission.approve", "reports.view_limited"],
  VISA: ["visa.view", "visa.approve", "reports.view_limited"]
} as const satisfies Record<StaffRole, readonly PermissionKey[]>;

const ROLE_WORKSPACES = {
  OWNER: ["catalog", "files", "payments", "admission", "visa", "reports", "users", "commissions"],
  CONSULTANT: ["catalog", "files", "reports"],
  ACCOUNTS: ["files", "payments", "reports"],
  ADMISSION: ["catalog", "admission", "reports"],
  VISA: ["visa", "reports"]
} as const satisfies Record<StaffRole, readonly WorkspaceId[]>;

const ROLE_LABELS = {
  OWNER: "Owner / Admin",
  CONSULTANT: "Consultant / Counsellor",
  ACCOUNTS: "Accounts Department",
  ADMISSION: "Admission Department",
  VISA: "Visa Department"
} as const satisfies Record<StaffRole, string>;

export function createRoleAccess(
  role: StaffRole,
  overrides: Partial<Omit<CurrentUserAccess, "permissions" | "role" | "workspaces">> & {
    readonly permissions?: readonly PermissionKey[];
    readonly workspaces?: readonly WorkspaceId[];
  } = {}
): CurrentUserAccess {
  const permissions = overrides.permissions ?? ROLE_PERMISSIONS[role];
  const workspaceIds = overrides.workspaces ?? ROLE_WORKSPACES[role];

  return {
    id: overrides.id ?? `preview-${role.toLowerCase()}`,
    name: overrides.name ?? ROLE_LABELS[role],
    email: overrides.email ?? `${role.toLowerCase()}@example.com`,
    role,
    permissions,
    workspaces: workspaceIds.map(toCurrentUserWorkspace)
  };
}

export function createAccessFromContract(contract: CurrentAccessResponse): CurrentUserAccess {
  const role = contract.user.role;

  if (!isStaffRole(role)) {
    throw new Error(`Unknown staff role from ACL contract: ${role}`);
  }

  return createRoleAccess(role, {
    email: contract.user.email,
    id: contract.user.id,
    name: contract.user.name,
    permissions: contract.permissions.map(toPermissionKey).filter(isPermissionKey),
    workspaces: contract.workspaces.filter((workspace) => workspace.allowed).map((workspace) => workspace.id)
  });
}

export function hasPermission(user: CurrentUserAccess, permission: PermissionKey): boolean {
  return user.permissions.includes(permission);
}

export function hasAnyPermission(user: CurrentUserAccess, permissions: readonly PermissionKey[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

export function hasWorkspace(user: CurrentUserAccess, workspaceId: WorkspaceId): boolean {
  return user.workspaces.some((workspace) => workspace.id === workspaceId);
}

export function getVisibleNavigation(user: CurrentUserAccess): readonly WorkspaceConfig[] {
  return WORKSPACE_CONFIG.filter(
    (workspace) => hasWorkspace(user, workspace.id) && hasAnyPermission(user, workspace.requiredPermissions)
  );
}

export function getWorkspaceConfig(workspaceId: string): WorkspaceConfig | null {
  return WORKSPACE_CONFIG.find((workspace) => workspace.id === workspaceId) ?? null;
}

export function isWorkspaceId(value: string): value is WorkspaceId {
  return getWorkspaceConfig(value) !== null;
}

export function getWorkspaceRouteAccess(user: CurrentUserAccess, workspaceId: string): WorkspaceRouteAccess {
  const workspace = getWorkspaceConfig(workspaceId);

  if (!workspace) {
    return {
      reason: "This workspace route is not registered.",
      status: "unknown",
      workspaceId
    };
  }

  const hasAssignedWorkspace = hasWorkspace(user, workspace.id);
  const hasRequiredPermission = hasAnyPermission(user, workspace.requiredPermissions);

  if (hasAssignedWorkspace && hasRequiredPermission) {
    return {
      reason: null,
      status: "allowed",
      workspace
    };
  }

  return {
    reason: getWorkspaceRestrictionReason(user, workspace, hasAssignedWorkspace, hasRequiredPermission),
    status: "blocked",
    workspace
  };
}

export function getActionState(user: CurrentUserAccess, actionId: ActionId): ActionState {
  const action = ACTION_CONFIG.find((item) => item.id === actionId);

  if (!action) {
    throw new Error(`Unknown ACL action: ${actionId}`);
  }

  const allowed = hasAnyPermission(user, action.requiredPermissions);

  return {
    ...action,
    disabled: !allowed && action.unauthorizedMode === "disabled",
    hidden: !allowed && action.unauthorizedMode === "hidden",
    reason: allowed ? null : action.unavailableReason
  };
}

export function getVisibleActions(user: CurrentUserAccess): readonly ActionState[] {
  return ACTION_CONFIG.map((action) => getActionState(user, action.id)).filter((action) => !action.hidden);
}

export function getWorkspaceActions(user: CurrentUserAccess, workspaceId: WorkspaceId): readonly ActionState[] {
  return getVisibleActions(user).filter((action) => action.workspaceId === workspaceId);
}

export function getBlockedActions(user: CurrentUserAccess): readonly ActionState[] {
  return getVisibleActions(user).filter((action) => action.disabled);
}

export function getRoleLabel(role: StaffRole): string {
  return ROLE_LABELS[role];
}

export function isStaffRole(value: string): value is StaffRole {
  return STAFF_ROLES.includes(value as StaffRole);
}

function toCurrentUserWorkspace(id: WorkspaceId): CurrentUserWorkspace {
  const workspace = getWorkspaceConfig(id);

  if (!workspace) {
    throw new Error(`Unknown ACL workspace: ${id}`);
  }

  return {
    id,
    label: workspace.label
  };
}

function getWorkspaceRestrictionReason(
  user: CurrentUserAccess,
  workspace: WorkspaceConfig,
  hasAssignedWorkspace: boolean,
  hasRequiredPermission: boolean
): string {
  if (!hasAssignedWorkspace) {
    return `${getRoleLabel(user.role)} is not assigned to the ${workspace.label} workspace.`;
  }

  if (!hasRequiredPermission) {
    return `${getRoleLabel(user.role)} does not have the required ${workspace.label} permission.`;
  }

  return `${getRoleLabel(user.role)} cannot open the ${workspace.label} workspace.`;
}

function toPermissionKey(permission: ApiPermissionDefinition): string {
  if (permission.resource === "catalog" && permission.action === "read") {
    return "catalog.view";
  }

  if (permission.resource === "catalog" && permission.action === "manage") {
    return "catalog.manage";
  }

  if (permission.resource === "files" && permission.action === "read") {
    return permission.scope === "assigned" ? "files.view_assigned" : "files.view_all";
  }

  if (permission.resource === "files" && permission.action === "create") {
    return "files.create";
  }

  if (permission.resource === "payments" && permission.action === "read") {
    return "payments.view";
  }

  if (permission.resource === "payments" && permission.action === "confirm") {
    return "payments.confirm";
  }

  if (permission.resource === "admission" && permission.action === "read") {
    return "admission.view";
  }

  if (permission.resource === "admission" && permission.action === "approve") {
    return "admission.approve";
  }

  if (permission.resource === "visa" && permission.action === "read") {
    return "visa.view";
  }

  if (permission.resource === "visa" && permission.action === "approve") {
    return "visa.approve";
  }

  if (permission.resource === "reports" && permission.action === "read") {
    if (permission.scope === "all") {
      return "reports.view_full";
    }

    return permission.scope === "assigned" ? "reports.view_own" : "reports.view_limited";
  }

  if (permission.resource === "users" && permission.action === "manage") {
    return "users.manage";
  }

  if (permission.resource === "commissions" && permission.action === "read") {
    return "commissions.view";
  }

  if (permission.resource === "commissions" && permission.action === "manage") {
    return "commissions.manage";
  }

  return `${permission.resource}.${permission.action}`;
}

function isPermissionKey(value: string): value is PermissionKey {
  const knownPermissionKeys = new Set<PermissionKey>([
    ...ACTION_CONFIG.flatMap((action) => action.requiredPermissions),
    ...WORKSPACE_CONFIG.flatMap((workspace) => workspace.requiredPermissions)
  ]);

  return knownPermissionKeys.has(value as PermissionKey);
}
