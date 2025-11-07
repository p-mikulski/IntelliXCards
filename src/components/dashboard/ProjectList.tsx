import React from "react";
import type { ProjectViewModel } from "./types";
import ProjectListItem from "./ProjectListItem";

interface ProjectListProps {
  projects: ProjectViewModel[];
  onEdit: (project: ProjectViewModel) => void;
  onDelete: (project: ProjectViewModel) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ projects, onEdit, onDelete }) => {
  // No longer handling loading state here - parent handles it with SkeletonLoader

  if (projects.length === 0) {
    return <div>No projects found.</div>; // Placeholder for EmptyState
  }

  return (
    <div>
      <div className="grid gap-4 px-4 sm:px-0 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
