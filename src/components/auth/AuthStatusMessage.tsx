import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AuthStatusVariant = "success" | "error" | "info";

interface AuthStatusMessageProps {
  variant: AuthStatusVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<AuthStatusVariant, string> = {
  success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  error: "border-red-500/40 bg-red-500/10 text-red-100",
  info: "border-blue-400/40 bg-blue-500/10 text-blue-100",
};

const variantIcons: Record<AuthStatusVariant, typeof AlertCircle> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export function AuthStatusMessage({ variant, children, className }: AuthStatusMessageProps) {
  const Icon = variantIcons[variant];
  const role = variant === "error" ? "alert" : "status";

  return (
    <div
      role={role}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-md",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
