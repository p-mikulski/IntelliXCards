import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  { label: "Minimum 8 znakow", test: (password) => password.length >= 8 },
  { label: "Litera", test: (password) => /[a-zA-Z]/.test(password) },
  { label: "Cyfra", test: (password) => /\d/.test(password) },
  { label: "Znak specjalny", test: (password) => /[^a-zA-Z0-9]/.test(password) },
];

const labels = [
  { min: 0, text: "Bardzo slabe", tone: "text-red-200" },
  { min: 25, text: "Slabe", tone: "text-orange-200" },
  { min: 50, text: "Srednie", tone: "text-yellow-200" },
  { min: 75, text: "Silne", tone: "text-emerald-200" },
];

export function PasswordStrengthMeter({ password, className }: PasswordStrengthMeterProps) {
  const { score, label } = useMemo(() => {
    if (!password) {
      return { score: 0, label: labels[0] };
    }

    const passed = requirements.reduce((acc, requirement) => acc + (requirement.test(password) ? 1 : 0), 0);
    const maxScore = requirements.length;
    const scorePercent = Math.min(100, Math.round((passed / maxScore) * 100));
    const activeLabel = [...labels].reverse().find((item) => scorePercent >= item.min) ?? labels[0];

    return { score: scorePercent, label: activeLabel };
  }, [password]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>Jak mocne jest haslo?</span>
        <span className={cn("font-medium", label.tone)}>{label.text}</span>
      </div>
      <Progress value={score} className="h-2 bg-white/10" />
      <ul className="grid gap-1 text-[11px] text-white/50 sm:text-xs">
        {requirements.map((item) => (
          <li key={item.label} className={item.test(password) ? "text-white/80" : undefined}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
