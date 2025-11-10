import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/common/PageHeader";
import { Menu } from "lucide-react";
import { useState } from "react";

interface ProjectHeaderProps {
  project?: Project;
  onStudyClick: () => void;
  onCreateClick: () => void;
  onGenerateAIClick: () => void;
  isLoading?: boolean;
  showButtons?: boolean;
}

/**
 * Project subheader component - displays directly under MainToolbar
 * Shows project title with metadata on the left, action buttons on the right
 * Supports loading state with skeleton placeholders for title/description
 */
export default function ProjectHeader({
  project,
  onStudyClick,
  onCreateClick,
  onGenerateAIClick,
  isLoading = false,
  showButtons = true,
}: ProjectHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const renderButtons = () => (
    <>
      <div className="hidden sm:flex gap-2">
        <Button variant="outline" onClick={onStudyClick} type="button" size="sm">
          Study
        </Button>
        <Button onClick={onCreateClick} type="button" size="sm">
          Create Flashcard
        </Button>
        <Button
          onClick={onGenerateAIClick}
          type="button"
          size="sm"
          className="group animate-rainbow text-primary-foreground focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center justify-center rounded-md border-2 border-transparent bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] font-bold transition-colors focus-visible:ring-[1px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 before:animate-rainbow before:absolute before:bottom-[-5%] before:left-0 before:z-0 before:h-1/9 before:w-full before:bg-[linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] before:[filter:blur(calc(0.625*1rem))] bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_30%,rgba(0,0,0,0)),linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] w-auto"
        >
          ✨ Generate with AI
        </Button>
      </div>
      <div className="relative sm:hidden">
        <Button onClick={() => setMenuOpen(!menuOpen)} variant="outline" size="sm" type="button">
          <Menu className="w-4 h-4" />
        </Button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 bg-white border rounded shadow-lg p-2 z-10 flex flex-col gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onStudyClick();
                setMenuOpen(false);
              }}
              type="button"
              size="sm"
            >
              Study
            </Button>
            <Button
              onClick={() => {
                onCreateClick();
                setMenuOpen(false);
              }}
              type="button"
              size="sm"
            >
              Create Flashcard
            </Button>
            <Button
              onClick={() => {
                onGenerateAIClick();
                setMenuOpen(false);
              }}
              type="button"
              size="sm"
              className="group animate-rainbow text-primary-foreground focus-visible:ring-ring/50 relative inline-flex cursor-pointer items-center justify-center rounded-md border-2 border-transparent bg-[length:200%] [background-clip:padding-box,border-box,border-box] [background-origin:border-box] font-bold transition-colors focus-visible:ring-[1px] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 before:animate-rainbow before:absolute before:bottom-[-5%] before:left-0 before:z-0 before:h-1/9 before:w-full before:bg-[linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] before:[filter:blur(calc(0.625*1rem))] bg-[linear-gradient(var(--primary),var(--primary)),linear-gradient(var(--primary)_30%,rgba(0,0,0,0)),linear-gradient(90deg,#ff4242,#a1ff42,#42a1ff,#42d0ff,#a142ff)] w-auto"
            >
              ✨ Generate with AI
            </Button>
          </div>
        )}
      </div>
    </>
  );

  // Render with loading skeleton for title/subtitle, but show buttons only if enabled
  if (isLoading || !project) {
    return <PageHeader isLoading={true}>{showButtons && renderButtons()}</PageHeader>;
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
      {showButtons && renderButtons()}
    </PageHeader>
  );
}
