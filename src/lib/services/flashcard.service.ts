import type { SupabaseClient } from "@supabase/supabase-js";
import type { CreateFlashcardCommand, FlashcardDto } from "../../types";

/** Service for managing flashcard operations */
export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Creates a new flashcard in the specified project
   * @param projectId - UUID of the project to create the flashcard in
   * @param command - Validated CreateFlashcardCommand containing front and back content
   * @returns The created flashcard
   * @throws Error if project doesn't exist or user lacks permission
   */
  async createFlashcard(projectId: string, command: CreateFlashcardCommand): Promise<FlashcardDto> {
    // First verify project exists and user has access
    const { data: project, error: projectError } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found or access denied");
    }

    // Insert the new flashcard
    const { data: flashcard, error: insertError } = await this.supabase
      .from("flashcards")
      .insert({
        project_id: projectId,
        front: command.front,
        back: command.back,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error("Failed to create flashcard");
    }

    return flashcard;
  }
}
