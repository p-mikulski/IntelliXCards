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

  return (
    <Card className={cn("transition-all group hover:border-ring", isOptimistic && "opacity-50")}>
      <CardContent className="flex flex-col justify-between gap-4">
        <a href={`/projects/${project.id}`} className="block hover:opacity-80 transition-opacity">
          <div>
            <h3 className="font-bold text-lg">{project.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 h-[40px]">{project.description}</p>
            {project.tag && (
              <span className="mt-2 inline-block bg-secondary text-secondary-foreground text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
                {project.tag}
              </span>
            )}
          </div>
        </a>
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <span>Created: {project.formattedCreatedAt}</span>
          <ProjectActions project={project} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectListItem;
