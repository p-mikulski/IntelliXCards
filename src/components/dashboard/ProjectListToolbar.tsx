import React from "react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ProjectListToolbarProps {
  onSortChange: (sortKey: string) => void;
  onFilterChange: (filterQuery: string) => void;
}

const ProjectListToolbar: React.FC<ProjectListToolbarProps> = ({ onSortChange, onFilterChange }) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <Input placeholder="Filter projects..." onChange={(e) => onFilterChange(e.target.value)} className="max-w-sm" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Sort By</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("created_at:desc")}>Newest</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("created_at:asc")}>Oldest</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("title:asc")}>Title (A-Z)</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("title:desc")}>Title (Z-A)</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ProjectListToolbar;
