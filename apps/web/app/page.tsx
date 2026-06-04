import { BriefcaseBusiness, FileText, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import type { ComponentType } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StageGate } from "@/components/ui/stage-gate";

const workspaces: {
  name: string;
  role: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  status: string;
  variant: BadgeProps["variant"];
}[] = [
  { name: "Catalog", role: "Owner", icon: GraduationCap, status: "Setup", variant: "commission" },
  { name: "Files", role: "Consultant", icon: BriefcaseBusiness, status: "Own files", variant: "info" },
  { name: "Payments", role: "Accounts", icon: Landmark, status: "Pending", variant: "warning" },
  { name: "Admission", role: "Admission", icon: FileText, status: "Documents", variant: "hold" },
  { name: "Visa", role: "Visa", icon: ShieldCheck, status: "Outcome", variant: "success" }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[360px_1fr] lg:items-center">
        <Card>
          <CardHeader>
            <CardTitle>Staff Login</CardTitle>
            <CardDescription>Role-scoped access for the internal admissions workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="owner@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Preview Role</Label>
              <Select id="role" defaultValue="OWNER">
                <option value="OWNER">Owner</option>
                <option value="CONSULTANT">Consultant</option>
                <option value="ACCOUNTS">Accounts</option>
                <option value="ADMISSION">Admission</option>
                <option value="VISA">Visa</option>
              </Select>
            </div>
            <Button className="w-full">Continue</Button>
            <p className="text-xs text-muted-foreground">Light and dark tokens follow the Admissions OS design guide.</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Light mode</Badge>
                <Badge variant="info">Dark mode</Badge>
                <Badge variant="commission">Owner commission accent</Badge>
              </div>
              <ThemeToggle />
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-normal">
              Admissions OS design system foundation
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              Neutral operational surfaces, green progress actions, navy authority headings, and restrained gold
              owner-only cues are available as reusable Tailwind tokens.
            </p>
          </div>

          <Separator />

          <div className="grid gap-3 sm:grid-cols-2">
            {workspaces.map((workspace) => {
              const Icon = workspace.icon;

              return (
                <Card key={workspace.name}>
                  <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{workspace.name}</CardTitle>
                      <CardDescription>{workspace.role} workspace</CardDescription>
                    </div>
                    <Badge variant={workspace.variant}>{workspace.status}</Badge>
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-3">
            <StageGate
              index={1}
              title="File opening payment"
              description="Accounts confirms deposit before Admission can begin."
              status="Cleared"
              statusVariant="success"
            />
            <StageGate
              index={2}
              title="Admission documents and dues"
              description="Submission is blocked until documents and payment are complete."
              status="BDT 18,000 due"
              statusVariant="warning"
            />
            <StageGate
              index={3}
              title="Visa outcome"
              description="Approval completes the file; rejection preserves history for review."
              status="Waiting"
              statusVariant="info"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="commission">
              <Landmark className="size-4" aria-hidden />
              Commission
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
