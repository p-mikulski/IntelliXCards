import React from "react";
import type { ProjectViewModel } from "./types";
import ProjectActions from "./ProjectActions";
import { cn } from "@/lib/utils";

interface ProjectListItemProps {
  project: ProjectViewModel;
  onEdit: (project: ProjectViewModel) => void;
  onDelete: (project: ProjectViewModel) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onEdit, onDelete }) => {
  const isOptimistic = project.optimisticState !== undefined;

  return (
    <div className={cn("p-4 border rounded-lg flex flex-col justify-between", isOptimistic && "opacity-50")}>
      <div>
        <h3 className="font-bold text-lg">{project.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{project.description}</p>
        {project.tag && (
          <span className="mt-2 inline-block bg-secondary text-secondary-foreground text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
            {project.tag}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
        <span>Created: {project.formattedCreatedAt}</span>
        <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
};

export default ProjectListItem;
