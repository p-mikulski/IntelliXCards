import React from "react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";

interface DashboardHeaderProps {
  projectCount: number;
  onOpenCreateDialog: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ projectCount, onOpenCreateDialog }) => {
  return (
    <PageHeader title="Projects" subtitle={`You have ${projectCount} project${projectCount !== 1 ? "s" : ""}`}>
      <Button onClick={onOpenCreateDialog} size="sm">
        Create Project
      </Button>
    </PageHeader>
  );
};
export default DashboardHeader;
