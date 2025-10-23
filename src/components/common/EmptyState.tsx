import React from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAction: () => void;
  title: string;
  description: string;
  actionText: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAction, title, description, actionText }) => {
  return (
    <div className="text-center py-16">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground mt-2 mb-4">{description}</p>
      <Button onClick={onAction}>{actionText}</Button>
    </div>
  );
};

export default EmptyState;
