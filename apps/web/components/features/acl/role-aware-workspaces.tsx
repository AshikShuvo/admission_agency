"use client";

import {
  BriefcaseBusiness,
  FileText,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  Lock,
  ShieldCheck,
  UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getCurrentUserAccessResult } from "@/lib/acl/auth";
import {
  STAFF_ROLES,
  createRoleAccess,
  getActionState,
  getBlockedActions,
  getRoleLabel,
  getVisibleActions,
  getVisibleNavigation,
  getWorkspaceActions,
  isStaffRole,
  type ActionId,
  type CurrentUserAccess,
  type StaffRole,
  type WorkspaceId
} from "@/lib/acl/permissions";

type AuthLoadState =
  | { readonly status: "loading"; readonly user: null; readonly message: string }
  | { readonly status: "success"; readonly user: CurrentUserAccess; readonly message: string }
  | { readonly status: "error"; readonly user: null; readonly message: string };

const workspaceIcons = {
  catalog: GraduationCap,
  files: BriefcaseBusiness,
  payments: Landmark,
  admission: FileText,
  visa: ShieldCheck,
  reports: LayoutDashboard,
  users: UsersRound,
  commissions: Landmark
} as const satisfies Record<WorkspaceId, ComponentType<{ className?: string; "aria-hidden"?: boolean }>>;

const actionStatusById = {
  "manage-catalog": "Owner only",
  "create-student-file": "Files",
  "confirm-payment": "Accounts",
  "approve-admission": "Admission",
  "record-visa-outcome": "Visa",
  "manage-users": "Owner only",
  "enter-commission": "Owner only",
  "view-reports": "Scoped"
} as const satisfies Record<ActionId, string>;

const actionToneById = {
  "manage-catalog": "commission",
  "create-student-file": "info",
  "confirm-payment": "warning",
  "approve-admission": "hold",
  "record-visa-outcome": "success",
  "manage-users": "commission",
  "enter-commission": "commission",
  "view-reports": "info"
} as const satisfies Record<ActionId, BadgeProps["variant"]>;

export function RoleAwareWorkspaces() {
  const [authState, setAuthState] = useState<AuthLoadState>({
    status: "loading",
    user: null,
    message: "Loading access"
  });
  const [previewRole, setPreviewRole] = useState<StaffRole>("OWNER");

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentUser() {
      const result = await getCurrentUserAccessResult();

      if (!isMounted) {
        return;
      }

      if (result.ok && result.data) {
        setAuthState({
          status: "success",
          user: result.data,
          message: "Live access"
        });
        setPreviewRole(result.data.role);
        return;
      }

      setAuthState({
        status: "error",
        user: null,
        message: result.error?.message ?? "Access unavailable"
      });
    }

    void loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const currentUser = authState.user ?? createRoleAccess(previewRole);
  const visibleNavigation = useMemo(() => getVisibleNavigation(currentUser), [currentUser]);
  const visibleActions = useMemo(() => getVisibleActions(currentUser), [currentUser]);
  const blockedActions = useMemo(() => getBlockedActions(currentUser), [currentUser]);

  function handleRoleChange(value: string) {
    if (isStaffRole(value)) {
      setPreviewRole(value);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={authState.status === "success" ? "success" : authState.status === "loading" ? "info" : "warning"}>
                {authState.status === "loading" ? "Loading" : authState.message}
              </Badge>
              <Badge variant="info">{currentUser.role}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">All Workspaces</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              {getRoleLabel(currentUser.role)} access with role-scoped navigation, workspace visibility, and blocked
              action states from the current permission payload.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-56 space-y-2">
              <Label htmlFor="preview-role">Active role</Label>
              <Select
                id="preview-role"
                value={previewRole}
                onChange={(event) => handleRoleChange(event.target.value)}
                disabled={authState.status === "success"}
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </Select>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-extrabold uppercase text-muted-foreground">Permissions</p>
                  <p className="mt-1 text-2xl font-bold text-navy">{currentUser.permissions.length}</p>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase text-muted-foreground">Workspaces</p>
                  <p className="mt-1 text-2xl font-bold text-navy">{visibleNavigation.length}</p>
                </div>
              </CardContent>
            </Card>

            <nav aria-label="Workspace navigation" className="space-y-2">
              {visibleNavigation.length > 0 ? (
                visibleNavigation.map((workspace) => {
                  const Icon = workspaceIcons[workspace.id];

                  return (
                    <a
                      key={workspace.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 text-sm font-extrabold text-navy shadow-sm transition-colors hover:bg-secondary"
                      href={workspace.href}
                    >
                      <span className="flex size-9 items-center justify-center rounded-md bg-primary-soft text-primary">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">{workspace.label}</span>
                      <Badge variant={workspace.tone}>{workspace.statusLabel}</Badge>
                    </a>
                  );
                })
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">No workspace access</CardTitle>
                    <CardDescription>The current role has no allowed workspace in this permission payload.</CardDescription>
                  </CardHeader>
                </Card>
              )}
            </nav>
          </aside>

          <div className="space-y-5">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Allowed workspaces">
              {visibleNavigation.map((workspace) => {
                const Icon = workspaceIcons[workspace.id];
                const workspaceActions = getWorkspaceActions(currentUser, workspace.id);

                return (
                  <Card key={workspace.id}>
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <Badge variant={workspace.tone}>{workspace.statusLabel}</Badge>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{workspace.label}</CardTitle>
                        <CardDescription className="mt-1">{workspace.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {workspaceActions.length > 0 ? (
                        workspaceActions.map((action) => (
                          <PermissionAction key={action.id} actionId={action.id} user={currentUser} />
                        ))
                      ) : (
                        <p className="rounded-lg border border-border bg-secondary px-3 py-3 text-sm text-muted-foreground">
                          No actions are available for this role in this workspace.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>

            <Separator />

            <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action Availability</CardTitle>
                  <CardDescription>Visible commands are enabled or blocked directly from permission keys.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                  {visibleActions.map((action) => (
                    <PermissionAction key={action.id} actionId={action.id} user={currentUser} compact />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Restricted Actions</CardTitle>
                  <CardDescription>{blockedActions.length} visible command blocked for this role.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {blockedActions.length > 0 ? (
                    blockedActions.map((action) => (
                      <div key={action.id} className="rounded-lg border border-border bg-secondary p-3">
                        <div className="flex items-center gap-2 text-sm font-extrabold text-navy">
                          <Lock className="size-4 text-warning" aria-hidden />
                          {action.label}
                        </div>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">{action.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-lg border border-border bg-success-background p-3 text-sm text-success">
                      Every visible command is available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

interface PermissionActionProps {
  readonly actionId: ActionId;
  readonly compact?: boolean;
  readonly user: CurrentUserAccess;
}

function PermissionAction({ actionId, compact = false, user }: PermissionActionProps) {
  const action = getActionState(user, actionId);

  if (action.hidden) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-navy">{action.label}</p>
          {!compact ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{action.description}</p> : null}
        </div>
        <Badge variant={action.disabled ? "warning" : actionToneById[action.id]}>{actionStatusById[action.id]}</Badge>
      </div>
      {action.reason ? <p className="mt-2 text-xs font-bold text-warning">{action.reason}</p> : null}
      <Button className="mt-3 w-full" disabled={action.disabled} size="sm" variant={action.disabled ? "secondary" : "default"}>
        {action.disabled ? (
          <>
            <Lock className="size-4" aria-hidden />
            Blocked
          </>
        ) : (
          action.label
        )}
      </Button>
    </div>
  );
}
