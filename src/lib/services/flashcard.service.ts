import type { supabaseClient } from "../../db/supabase.client";
import type { CreateFlashcardCommand, FlashcardDto, UpdateFlashcardCommand, FlashcardListItemDto } from "../../types";

/** Service for managing flashcard operations */
export class FlashcardService {
  constructor(private readonly supabase: typeof supabaseClient) {}

  /**
   * Gets all flashcards for a specific project with pagination
   * @param projectId - UUID of the project
   * @param userId - UUID of the user requesting flashcards
   * @param page - Page number (1-based)
   * @param limit - Number of items per page
   * @returns Paginated flashcard list with total count
   * @throws Error if project doesn't exist or user lacks permission
   */
  async getFlashcardsByProject(
    projectId: string,
    userId: string,
    page = 1,
    limit = 9
  ): Promise<{ flashcards: FlashcardListItemDto[]; total: number }> {
    // First verify project exists and user has access
    const { data: project, error: projectError } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      throw new Error("Project not found or access denied");
    }

    // Get total count of flashcards for this project
    const { count, error: countError } = await this.supabase
      .from("flashcards")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId);

    if (countError) {
      throw new Error("Failed to count flashcards");
    }

    const total = count || 0;

    // Calculate offset for pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch paginated flashcards for this project
    const { data: flashcards, error: fetchError } = await this.supabase
      .from("flashcards")
      .select("id, front, back, next_review_date, ease_factor, feedback, feedback_timestamp")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (fetchError) {
      throw new Error("Failed to fetch flashcards");
    }

    return { flashcards: flashcards || [], total };
  }

  /**
   * Gets a single flashcard by ID
   * @param flashcardId - UUID of the flashcard
   * @param userId - UUID of the user requesting the flashcard
   * @returns The flashcard
   * @throws Error if flashcard doesn't exist or user lacks permission
   */
  async getFlashcardById(flashcardId: string, userId: string): Promise<FlashcardDto> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .select("*, projects!inner(user_id)")
      .eq("id", flashcardId)
      .eq("projects.user_id", userId)
      .single();

    if (error || !flashcard) {
      throw new Error("Flashcard not found or access denied");
    }

    // Remove the nested projects object before returning
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { projects, ...flashcardData } = flashcard as Record<string, unknown> & FlashcardDto;
    return flashcardData;
  }

  /**
   * Updates an existing flashcard
   * @param flashcardId - UUID of the flashcard to update
   * @param command - Validated UpdateFlashcardCommand containing updates
   * @param userId - UUID of the user updating the flashcard
   * @returns The updated flashcard
   * @throws Error if flashcard doesn't exist or user lacks permission
   */
  async updateFlashcard(flashcardId: string, command: UpdateFlashcardCommand, userId: string): Promise<FlashcardDto> {
    // First verify the flashcard exists and user has access
    await this.getFlashcardById(flashcardId, userId);

    // If project_id is being changed, verify the target project exists and user has access
    if (command.project_id !== undefined) {
      const { data: targetProject, error: projectError } = await this.supabase
        .from("projects")
        .select("id")
        .eq("id", command.project_id)
        .eq("user_id", userId)
        .single();

      if (projectError || !targetProject) {
        throw new Error("Target project not found or access denied");
      }
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {};
    if (command.front !== undefined) updateData.front = command.front;
    if (command.back !== undefined) updateData.back = command.back;
    if (command.feedback !== undefined) updateData.feedback = command.feedback;
    if (command.next_review_date !== undefined) updateData.next_review_date = command.next_review_date;
    if (command.ease_factor !== undefined) updateData.ease_factor = command.ease_factor;
    if (command.project_id !== undefined) updateData.project_id = command.project_id;

    // Update the flashcard
    const { data: flashcard, error: updateError } = await this.supabase
      .from("flashcards")
      .update(updateData)
      .eq("id", flashcardId)
      .select()
      .single();

    if (updateError || !flashcard) {
      throw new Error("Failed to update flashcard");
    }

    return flashcard;
  }

  /**
   * Deletes a flashcard
   * @param flashcardId - UUID of the flashcard to delete
   * @param userId - UUID of the user deleting the flashcard
   * @throws Error if flashcard doesn't exist or user lacks permission
   */
  async deleteFlashcard(flashcardId: string, userId: string): Promise<void> {
    // First verify the flashcard exists and user has access
    await this.getFlashcardById(flashcardId, userId);

    // Delete the flashcard
    const { error: deleteError } = await this.supabase.from("flashcards").delete().eq("id", flashcardId);

    if (deleteError) {
      throw new Error("Failed to delete flashcard");
    }
  }

  /**
   * Creates a new flashcard in the specified project
   * @param projectId - UUID of the project to create the flashcard in
   * @param command - Validated CreateFlashcardCommand containing front and back content
   * @param userId - UUID of the user creating the flashcard
   * @returns The created flashcard
   * @throws Error if project doesn't exist or user lacks permission
   */
  async createFlashcard(projectId: string, command: CreateFlashcardCommand, userId: string): Promise<FlashcardDto> {
    // First verify project exists and user has access
    const { data: project, error: projectError } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
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
