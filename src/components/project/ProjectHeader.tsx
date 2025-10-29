import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";

interface ProjectHeaderProps {
  project?: Project;
  onStudyClick: () => void;
  onGenerateAIClick: () => void;
  isLoading?: boolean;
}

/**
 * Project subheader component - displays directly under MainToolbar
 * Shows project title with metadata on the left, action buttons on the right
 * Supports loading state with skeleton placeholders for title/description
 */
export default function ProjectHeader({
  project,
  onStudyClick,
  onGenerateAIClick,
  isLoading = false,
}: ProjectHeaderProps) {
  // Render with loading skeleton for title/subtitle, but always show buttons
  if (isLoading || !project) {
    return (
      <PageHeader isLoading={true}>
        <Button variant="outline" onClick={onStudyClick} type="button" size="sm">
          Study
        </Button>
        <Button onClick={onGenerateAIClick} type="button" size="sm">
          ✨ Generate with AI
        </Button>
      </PageHeader>
    );
  }

  return (
    <PageHeader
      title={
        <div className="flex items-center gap-3 flex-wrap">
          <span>{project.title}</span>
          {project.tag && (
            <span className="inline-flex px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
              {project.tag}
            </span>
          )}
        </div>
      }
      subtitle={project.description || undefined}
    >
      <Button variant="outline" onClick={onStudyClick} type="button" size="sm">
        Study
      </Button>
      <Button onClick={onGenerateAIClick} type="button" size="sm">
        ✨ Generate with AI
      </Button>
    </PageHeader>
  );
}
