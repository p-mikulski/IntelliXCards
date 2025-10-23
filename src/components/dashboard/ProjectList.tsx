import React from "react";
import type { ProjectViewModel } from "./types";
import ProjectListItem from "./ProjectListItem";

interface ProjectListProps {
  projects: ProjectViewModel[];
  isLoading: boolean;
  onEdit: (project: ProjectViewModel) => void;
  onDelete: (project: ProjectViewModel) => void;
  onSortChange: (sortKey: string) => void;
  onFilterChange: (filterQuery: string) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  isLoading,
  onEdit,
  onDelete,
  onSortChange,
  onFilterChange,
}) => {
  if (isLoading) {
    return <div>Loading...</div>; // Placeholder for SkeletonLoader
  }

  if (projects.length === 0) {
    return <div>No projects found.</div>; // Placeholder for EmptyState
  }

  return (
    <div>
      {/* Placeholder for ProjectListToolbar */}
      <div className="mb-4">Toolbar will be here</div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectListItem key={project.id} project={project} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
