import Link from "next/link";
import { ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { notFound } from "next/navigation";

import { RestrictedAccess } from "@/components/features/acl/restricted-access";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserAccessResult } from "@/lib/acl/auth";
import {
  getRoleLabel,
  getWorkspaceActions,
  getWorkspaceConfig,
  getWorkspaceRouteAccess,
  type CurrentUserAccess,
  type WorkspaceConfig
} from "@/lib/acl/permissions";

export const dynamic = "force-dynamic";

interface WorkspacePageProps {
  readonly params: Promise<{
    readonly workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  const workspace = getWorkspaceConfig(workspaceId);

  if (!workspace) {
    notFound();
  }

  const currentUserResult = await getCurrentUserAccessResult();

  if (!currentUserResult.ok || !currentUserResult.data) {
    return (
      <RestrictedAccess
        reason={currentUserResult.error?.message ?? "The current access payload is unavailable."}
        workspace={workspace}
      />
    );
  }

  const currentUser = currentUserResult.data;
  const routeAccess = getWorkspaceRouteAccess(currentUser, workspace.id);

  if (routeAccess.status === "blocked") {
    return <RestrictedAccess currentUser={currentUser} reason={routeAccess.reason} workspace={routeAccess.workspace} />;
  }

  if (routeAccess.status === "unknown") {
    notFound();
  }

  return <WorkspaceAccessGranted currentUser={currentUser} workspace={routeAccess.workspace} />;
}

interface WorkspaceAccessGrantedProps {
  readonly currentUser: CurrentUserAccess;
  readonly workspace: WorkspaceConfig;
}

function WorkspaceAccessGranted({ currentUser, workspace }: WorkspaceAccessGrantedProps) {
  const actions = getWorkspaceActions(currentUser, workspace.id);

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-5 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Access allowed</Badge>
              <Badge variant={workspace.tone}>{workspace.statusLabel}</Badge>
              <Badge variant="info">{currentUser.role}</Badge>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-normal sm:text-4xl">{workspace.label}</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{workspace.description}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="size-4" aria-hidden />
              All workspaces
            </Link>
          </Button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Workspace Access</CardTitle>
              <CardDescription>
                {getRoleLabel(currentUser.role)} can open this workspace from the current permission payload.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {actions.length > 0 ? (
                actions.map((action) => (
                  <div key={action.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-navy">{action.label}</p>
                        <p className="mt-1 text-sm leading-5 text-muted-foreground">{action.description}</p>
                      </div>
                      {action.disabled ? (
                        <Lock className="size-4 shrink-0 text-warning" aria-hidden />
                      ) : (
                        <CheckCircle2 className="size-4 shrink-0 text-success" aria-hidden />
                      )}
                    </div>
                    {action.reason ? <p className="mt-2 text-xs font-bold text-warning">{action.reason}</p> : null}
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-border bg-secondary p-3 text-sm text-muted-foreground">
                  No visible actions are available in this workspace.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{currentUser.name}</CardTitle>
              <CardDescription>{currentUser.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">Role</p>
                <p className="mt-1 text-lg font-bold text-navy">{getRoleLabel(currentUser.role)}</p>
              </div>
              <div>
                <p className="text-xs font-extrabold uppercase text-muted-foreground">Workspace</p>
                <p className="mt-1 text-lg font-bold text-navy">{workspace.label}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
