import { z } from "zod";
import type { FlashcardDraft, GenerateFlashcardsCommand } from "../../types";
// Validation schema for the generate flashcards command
export const generateFlashcardsSchema = z.object({
  text: z.string().max(10000, "Text cannot exceed 10,000 characters"),
  desired_count: z.number().int().positive().max(100, "Cannot generate more than 100 flashcards at once"),
});
// Service class for handling flashcard generation
export class FlashcardGenerationService {
  /**
   * Generate flashcard drafts from the provided text using AI
   * @param command The generation command containing text and desired count
   * @returns A promise resolving to the generated flashcard drafts
   */
  async generateFlashcards(command: GenerateFlashcardsCommand): Promise<FlashcardDraft[]> {
    const { text, desired_count } = command;

    // Simple mock implementation that creates basic flashcards
    // This will be replaced with actual AI-based generation later
    const mockFlashcards: FlashcardDraft[] = [];

    // Split text into sentences (very basic approach)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    // Generate up to desired_count flashcards or as many as we can from the text
    const count = Math.min(desired_count, sentences.length);

    for (let i = 0; i < count; i++) {
      const sentence = sentences[i].trim();

      // Create a simple Q&A pair from the sentence
      mockFlashcards.push({
        front: `What is the main point of: "${sentence.slice(0, 200)}"?`,
        back: sentence.slice(0, 500),
      });
    }

    return mockFlashcards;
  }

  /**
   * Regenerate a specific flashcard using AI
   * @param flashcardId The ID of the flashcard to regenerate
   * @returns A promise resolving to the regenerated flashcard draft
   */
  async regenerateFlashcard(flashcardId: string): Promise<FlashcardDraft> {
    // Simple mock implementation that will be replaced with actual AI regeneration
    return {
      front: `Regenerated question for flashcard ${flashcardId}`,
      back: `Regenerated answer for flashcard ${flashcardId}`,
    };
  }
}
