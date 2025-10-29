import { Button } from "@/components/ui/button";

interface PageHeaderAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  icon?: string;
}

interface PageHeaderProps {
  title?: string | React.ReactNode;
  subtitle?: string;
  actions?: PageHeaderAction[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Reusable page subheader component - displays directly under MainToolbar
 * Shows page title with optional subtitle on the left, action buttons on the right
 * Can also render custom children instead of actions for more complex layouts
 * Supports loading state with skeleton placeholders
 */
export default function PageHeader({ title, subtitle, actions, children, isLoading = false }: PageHeaderProps) {
  return (
    <header className="sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex min-h-[4rem] items-center justify-between px-6 py-3 w-full max-w-full">
        {/* Left section: Title and subtitle */}
        <div className="flex-1 min-w-0 mr-4">
          {isLoading ? (
            // Loading skeleton
            <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
          ) : typeof title === "string" ? (
            <h1 className="text-2xl font-bold break-words">{title}</h1>
          ) : (
            <div className="text-2xl font-bold break-words">{title}</div>
          )}
          {isLoading ? (
            <div className="h-4 bg-muted rounded w-32 animate-pulse mt-1"></div>
          ) : (
            subtitle && <p className="mt-1 text-sm text-muted-foreground break-words line-clamp-1">{subtitle}</p>
          )}
        </div>

        {/* Right section: Action buttons or custom children */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Always show buttons/children, even when loading */}
          {children
            ? children
            : actions?.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  onClick={action.onClick}
                  type="button"
                  size="sm"
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </Button>
              ))}
        </div>
      </div>
    </header>
  );
}
