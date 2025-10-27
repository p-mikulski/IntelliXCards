import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthFormHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}

export function AuthFormHeader({
  title,
  subtitle,
  eyebrow,
  align = "center",
  className,
  children,
}: AuthFormHeaderProps) {
  return (
    <div className={cn("space-y-3", align === "center" ? "text-center" : "text-left", className)}>
      {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">{eyebrow}</p> : null}

      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>

      {subtitle ? <p className="text-sm text-white/70 sm:text-base">{subtitle}</p> : null}

      {children}
    </div>
  );
}
