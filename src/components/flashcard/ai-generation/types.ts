/**
 * Types for AI Flashcard Generation components
 */

import type { FlashcardDraft, GenerateFlashcardsCommand } from "@/types";

/**
 * ViewModel for a flashcard draft in the review UI.
 * Includes a client-side ID for UI management.
 */
export type FlashcardDraftViewModel = FlashcardDraft & {
  id: string; // A unique client-side identifier (e.g., generated with crypto.randomUUID())
};

/**
 * Props for AIGenerationView component
 */
export interface AIGenerationViewProps {
  projectId: string;
}

/**
 * Props for AIGenerationForm component
 */
export interface AIGenerationFormProps {
  projectId: string;
  onGenerate: (command: GenerateFlashcardsCommand) => void;
  isGenerating: boolean;
}

/**
 * Props for AIGenerationReview component
 */
export interface AIGenerationReviewProps {
  projectId: string;
  drafts: FlashcardDraftViewModel[];
  isSaving: boolean;
  saveProgress: { current: number; total: number } | null;
  onSaveAll: () => void;
  onUpdateDraft: (id: string, updates: Partial<FlashcardDraft>) => void;
  onDeleteDraft: (id: string) => void;
  onDiscardAll: () => void;
}

/**
 * Props for DraftFlashcardItem component
 */
export interface DraftFlashcardItemProps {
  draft: FlashcardDraftViewModel;
  onUpdate: (id: string, updates: Partial<FlashcardDraft>) => void;
  onDelete: (id: string) => void;
}
