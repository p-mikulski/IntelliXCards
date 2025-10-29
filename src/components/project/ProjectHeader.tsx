import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectHeaderProps {
  project: Project;
  onStudyClick: () => void;
  onGenerateAIClick: () => void;
}

/**
 * Displays project title, description, tag, and primary action buttons
 * Includes breadcrumb navigation for better UX
 */
export default function ProjectHeader({ project, onStudyClick, onGenerateAIClick }: ProjectHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold break-words">{project.title}</h1>
              {project.description && <p className="mt-2 text-muted-foreground break-words">{project.description}</p>}
              {project.tag && (
                <span className="inline-block mt-3 px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
                  {project.tag}
                </span>
              )}
            </div>

            <div className="flex gap-3 flex-shrink-0">
              <Button variant="outline" onClick={onStudyClick} type="button">
                Study
              </Button>
              <Button onClick={onGenerateAIClick} type="button">
                ✨ Generate with AI
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
