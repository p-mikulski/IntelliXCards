import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProjectListItemDto } from "@/types";
import { FolderInput } from "lucide-react";

interface MoveFlashcardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (targetProjectId: string) => void;
  isSubmitting: boolean;
  currentProjectId: string;
}

/**
 * Dialog for moving a flashcard to a different project
 * Fetches and displays a list of available projects (excluding the current one)
 */
export default function MoveFlashcardDialog({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  currentProjectId,
}: MoveFlashcardDialogProps) {
  const [projects, setProjects] = useState<ProjectListItemDto[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch projects when dialog opens
  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        setIsLoadingProjects(true);
        setError(null);
        try {
          // Fetch all projects (we can increase limit if needed)
          const response = await fetch("/api/projects?page=1&limit=100");
          if (!response.ok) {
            throw new Error("Failed to fetch projects");
          }
          const data = await response.json();

          // Filter out the current project
          const availableProjects = data.projects.filter((p: ProjectListItemDto) => p.id !== currentProjectId);

          setProjects(availableProjects);

          // Auto-select first project if available
          if (availableProjects.length > 0) {
            setSelectedProjectId(availableProjects[0].id);
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load projects";
          setError(errorMessage);
        } finally {
          setIsLoadingProjects(false);
        }
      };

      fetchProjects();
    } else {
      // Reset state when dialog closes
      setSelectedProjectId("");
      setProjects([]);
      setError(null);
    }
  }, [isOpen, currentProjectId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProjectId) {
      onSubmit(selectedProjectId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Move Flashcard</DialogTitle>
            <DialogDescription>Select a project to move flashcard to.</DialogDescription>
          </DialogHeader>{" "}
          <div className="grid gap-4 py-4">
            {error && (
              <div
                className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            {isLoadingProjects ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FolderInput className="mx-auto h-12 w-12 mb-3 opacity-50" />
                <p>No other projects available.</p>
                <p className="text-sm mt-1">Create a new project first.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="project-select">Target Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} disabled={isSubmitting} required>
                  <SelectTrigger id="project-select" className="w-full">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                        {project.tag && ` (${project.tag})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedProjectId && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {projects.find((p) => p.id === selectedProjectId)?.description || "No description"}
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedProjectId || projects.length === 0}>
              {isSubmitting ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
