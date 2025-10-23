import React from "react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  projectCount: number;
  onOpenCreateDialog: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ projectCount, onOpenCreateDialog }) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">You have {projectCount} projects.</p>
      </div>
      <Button onClick={onOpenCreateDialog}>Create Project</Button>
    </div>
  );
};

export default DashboardHeader;
