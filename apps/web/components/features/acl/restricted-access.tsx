import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRoleLabel, type CurrentUserAccess, type WorkspaceConfig } from "@/lib/acl/permissions";

interface RestrictedAccessProps {
  readonly currentUser?: CurrentUserAccess;
  readonly reason: string;
  readonly workspace: WorkspaceConfig;
}

export function RestrictedAccess({ currentUser, reason, workspace }: RestrictedAccessProps) {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-10 sm:px-6">
        <Card className="w-full">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="warning">Restricted access</Badge>
              <Badge variant={workspace.tone}>{workspace.label}</Badge>
              {currentUser ? <Badge variant="info">{currentUser.role}</Badge> : null}
            </div>
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-warning-background text-warning">
                <Lock className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardTitle className="text-2xl">You cannot open {workspace.label}</CardTitle>
                <CardDescription className="mt-2 text-base leading-7">
                  {currentUser ? `${getRoleLabel(currentUser.role)} access is blocked for this workspace.` : "Access could not be verified for this workspace."}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-lg border border-border bg-secondary p-4">
              <p className="text-sm font-extrabold text-navy">Reason</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{reason}</p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/">
                <ArrowLeft className="size-4" aria-hidden />
                Back to workspaces
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
