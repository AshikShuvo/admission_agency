"use client";

import { X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ToastVariant = "error" | "info" | "success";

export interface ToastInput {
  readonly description?: string;
  readonly title: string;
  readonly variant?: ToastVariant;
}

interface ToastItem extends Required<ToastInput> {
  readonly id: string;
}

interface ToastContextValue {
  readonly dismiss: (id: string) => void;
  readonly error: (title: string, description?: string) => void;
  readonly info: (title: string, description?: string) => void;
  readonly show: (toast: ToastInput) => void;
  readonly success: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const toastVariantClasses: Record<ToastVariant, string> = {
  error: "border-danger bg-danger-background text-foreground",
  info: "border-info bg-info-background text-foreground",
  success: "border-success bg-success-background text-foreground"
};

export function ToastProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((toast: ToastInput) => {
    const id = crypto.randomUUID();
    const item: ToastItem = {
      description: toast.description ?? "",
      id,
      title: toast.title,
      variant: toast.variant ?? "info"
    };

    setToasts((current) => [item, ...current].slice(0, 4));
    window.setTimeout(() => dismiss(id), 5000);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(
    () => ({
      dismiss,
      error: (title, description) => show({ description, title, variant: "error" }),
      info: (title, description) => show({ description, title, variant: "info" }),
      show,
      success: (title, description) => show({ description, title, variant: "success" })
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 grid w-[min(360px,calc(100vw-2rem))] gap-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-lg border p-4 shadow-card",
              "transition-colors",
              toastVariantClasses[toast.variant]
            )}
            role={toast.variant === "error" ? "alert" : "status"}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-navy">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p> : null}
              </div>
              <Button
                aria-label="Dismiss notification"
                className="size-7 shrink-0"
                onClick={() => dismiss(toast.id)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}
