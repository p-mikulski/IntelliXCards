import type { Project } from "@/types";

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
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <a href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
              Dashboard
            </a>
          </li>
          <li className="text-gray-400" aria-hidden="true">
            /
          </li>
          <li className="text-gray-900 font-medium" aria-current="page">
            {project.title}
          </li>
        </ol>
      </nav>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 break-words">{project.title}</h1>
          {project.description && <p className="mt-2 text-gray-600 break-words">{project.description}</p>}
          {project.tag && (
            <span className="inline-block mt-3 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              {project.tag}
            </span>
          )}
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 transition-colors"
            onClick={onStudyClick}
            type="button"
          >
            Study
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
            onClick={onGenerateAIClick}
            type="button"
          >
            Generate with AI
          </button>
        </div>
      </div>
    </div>
  );
}
