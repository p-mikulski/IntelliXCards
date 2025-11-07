import React from "react";
import type { ProjectViewModel } from "./types";
import ProjectActions from "./ProjectActions";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectListItemProps {
  project: ProjectViewModel;
  onEdit: (project: ProjectViewModel) => void;
  onDelete: (project: ProjectViewModel) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onEdit, onDelete }) => {
  const isOptimistic = project.optimisticState !== undefined;

  const handleCardClick = () => {
    window.location.href = `/projects/${project.id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      className={cn("h-[206px] transition-all group hover:border-ring cursor-pointer", isOptimistic && "opacity-50")}
      onClick={handleCardClick}
      role="link"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="flex flex-col justify-between gap-4 h-full ">
        <div className="flex-1 flex flex-col gap-2">
          <h3 className="font-bold text-lg">{project.title}</h3>
          {project.tag && (
            <span className="inline-flex px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full w-max">
              {project.tag}
            </span>
          )}
          <p className="flex-1 text-sm text-muted-foreground line-clamp-2">{project.description}</p>
        </div>
        <div className="flex justify-between items-center mt-1 text-xs text-sidebar-foreground">
          <span>Created: {project.formattedCreatedAt}</span>
          <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectListItem;
