import React from "react";
import type { ProjectViewModel } from "./types";
// import ProjectListItem from "./ProjectListItem";
// import SkeletonLoader from "../common/SkeletonLoader";
// import EmptyState from "../common/EmptyState";
// import ProjectListToolbar from "./ProjectListToolbar";

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
          <div key={project.id} className="p-4 border rounded-lg">
            <h3 className="font-bold">{project.title}</h3>
            <p>{project.description}</p>
            <p className="text-sm text-muted-foreground">Created: {project.formattedCreatedAt}</p>
            {project.optimisticState && <p className="text-sm text-yellow-500">Status: {project.optimisticState}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => onEdit(project)}>Edit</button>
              <button onClick={() => onDelete(project)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
