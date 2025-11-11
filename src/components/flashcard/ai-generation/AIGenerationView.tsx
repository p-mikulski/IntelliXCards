/**
 * AIGenerationView component
 * Main container for AI flashcard generation workflow
 */

import { Toaster } from "@/components/ui/sonner";
import { useAIGeneration } from "@/components/hooks/useAIGeneration";
import AIGenerationForm from "./AIGenerationForm";
import AIGenerationReview from "./AIGenerationReview";
import type { AIGenerationViewProps } from "./types";

export default function AIGenerationView({ projectId }: AIGenerationViewProps) {
  const {
    viewMode,
    isLoading,
    isSaving,
    saveProgress,
    drafts,
    generateFlashcards,
    updateDraft,
    deleteDraft,
    saveAllDrafts,
    discardAllDrafts,
  } = useAIGeneration(projectId);

  return (
    <>
      {viewMode === "form" ? (
        <AIGenerationForm projectId={projectId} onGenerate={generateFlashcards} isGenerating={isLoading} />
      ) : (
        <AIGenerationReview
          projectId={projectId}
          drafts={drafts}
          isSaving={isSaving}
          saveProgress={saveProgress}
          onSaveAll={saveAllDrafts}
          onUpdateDraft={updateDraft}
          onDeleteDraft={deleteDraft}
          onDiscardAll={discardAllDrafts}
        />
      )}
      <Toaster />
    </>
  );
}
