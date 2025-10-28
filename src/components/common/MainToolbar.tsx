import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MainToolbarProps {
  user?: User;
  breadcrumbs?: BreadcrumbItem[];
}

/**
 * Main application toolbar component
 * Displays app logo, breadcrumb navigation, user email, and logout button
 */
export default function MainToolbar({ user, breadcrumbs = [] }: MainToolbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        toast.error("Failed to log out. Please try again.");
        return;
      }

      toast.success("Logged out successfully!");
      window.location.href = "/auth/login";
    } catch {
      toast.error("An error occurred while logging out.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-secondary">
      <div className="container flex h-16 items-center justify-between px-6 w-full max-w-full mx-2">
        {/* Left section: Logo and Breadcrumb */}
        <div className="flex items-center gap-6">
          {/* App Logo */}
          <a href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="App Logo" className="h-8 w-8" />
            <span className="font-bold text-lg text-primary-foreground">10xDevs Anki</span>
          </a>

          {/* Breadcrumb Navigation */}
          {breadcrumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="hidden md:block">
              <ol className="flex items-center gap-2 text-sm text-primary-foreground">
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <li aria-hidden="true" className="select-none">
                        /
                      </li>
                    )}
                    <li>
                      {item.href ? (
                        <a href={item.href} className="hover:text-foreground transition-colors">
                          {item.label}
                        </a>
                      ) : (
                        <span className="text-primary-foreground font-medium" aria-current="page">
                          {item.label}
                        </span>
                      )}
                    </li>
                  </React.Fragment>
                ))}
              </ol>
            </nav>
          )}
        </div>

        {/* Right section: User info and logout */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              <span className="font-medium text-primary-foreground">{user.email}</span>
            </div>
            <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut} size="sm">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
