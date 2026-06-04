import * as React from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StageGateProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  title: string;
  description: string;
  status: string;
  statusVariant?: BadgeProps["variant"];
}

function StageGate({
  index,
  title,
  description,
  status,
  statusVariant = "default",
  className,
  ...props
}: StageGateProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-lg border border-border bg-card p-3 text-sm max-sm:grid-cols-[2rem_1fr]",
        className
      )}
      {...props}
    >
      <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-sm font-extrabold text-primary">
        {index}
      </span>
      <div className="min-w-0">
        <p className="font-extrabold text-foreground">{title}</p>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      <Badge className="max-sm:col-start-2" variant={statusVariant}>
        {status}
      </Badge>
    </div>
  );
}

export { StageGate };
