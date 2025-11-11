import { useState, useEffect } from "react";
import type { Project } from "@/types";
import ProjectHeader from "../project/ProjectHeader";
import AIGenerationView from "../project/ai-generation/AIGenerationView";

interface GeneratePageViewProps {
  projectId: string;
}

/**
 * Wrapper component for the Generate page that includes the project header
 */
export default function GeneratePageView({ projectId }: GeneratePageViewProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch project");
        }
        const projectData = await response.json();
        setProject(projectData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleStudyClick = () => {
    window.location.href = `/projects/${projectId}/study`;
  };

  const handleCreateClick = () => {
    window.location.href = `/projects/${projectId}`;
  };

  const handleGenerateAIClick = () => {
    // Already on generate page, do nothing
  };

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <ProjectHeader
        project={project || undefined}
        onStudyClick={handleStudyClick}
        onCreateClick={handleCreateClick}
        onGenerateAIClick={handleGenerateAIClick}
        isLoading={isLoading}
        showButtons={false}
      />

      <div className="flex-1 w-full py-4 px-90 space-y-4 bg-muted overflow-auto">
        {error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <AIGenerationView projectId={projectId} />
        )}
      </div>
    </div>
  );
}
