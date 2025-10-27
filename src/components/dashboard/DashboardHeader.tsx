import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  email: string;
}

interface DashboardHeaderProps {
  projectCount: number;
  onOpenCreateDialog: () => void;
  user: User;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ projectCount, onOpenCreateDialog, user }) => {
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
        toast.error("Nie udalo sie wylogowac. Sprobuj ponownie.");
        return;
      }

      toast.success("Wylogowano pomyslnie!");
      // Redirect to login page
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Wystapil blad podczas wylogowywania.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">You have {projectCount} projects.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{user.email}</span>
          </div>
          <Button onClick={onOpenCreateDialog}>Create Project</Button>
          <Button variant="outline" onClick={handleLogout} disabled={isLoggingOut}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
