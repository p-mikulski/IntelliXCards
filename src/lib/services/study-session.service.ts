import type { supabaseClient } from "../../db/supabase.client";
import type {
  CreateStudySessionCommand,
  StudySessionDto,
  StudySessionListDto,
  StudySessionQueryParams,
} from "../../types";
import {
  createStudySessionSchema,
  updateStudySessionSchema,
  listStudySessionsSchema,
} from "../validation/study-session.schema";

/**
 * Service class for managing study sessions
 * Handles business logic for creating, retrieving, and listing study sessions
 */
export class StudySessionService {
  constructor(private readonly supabase: typeof supabaseClient) {}

  /**
   * Creates a new study session for a project
   * @param userId - The authenticated user's ID
   * @param projectId - The project ID for which the session is being created
   * @param command - The study session creation data
   * @returns The created study session
   * @throws {Error} If validation fails, project not found, or database error occurs
   */
  async createStudySession(
    userId: string,
    projectId: string,
    command: CreateStudySessionCommand
  ): Promise<StudySessionDto> {
    // Validate input data
    const validatedData = createStudySessionSchema.parse(command);

    // First, verify that the project exists and belongs to the user
    const { data: project, error: projectError } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (projectError || !project) {
      if (projectError?.code === "PGRST116") {
        throw new Error("Project not found");
      }
      throw new Error(`Failed to verify project: ${projectError?.message || "Unknown error"}`);
    }

    // Create the study session
    const { data, error } = await this.supabase
      .from("study_sessions")
      .insert({
        user_id: userId,
        project_id: projectId,
        start_time: validatedData.start_time,
        cards_reviewed: 0,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create study session: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves a single study session by ID
   * @param sessionId - The study session ID
   * @returns The study session
   * @throws {Error} If session not found or database error occurs
   */
  async getStudySessionById(sessionId: string): Promise<StudySessionDto> {
    const { data, error } = await this.supabase.from("study_sessions").select("*").eq("id", sessionId).single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Study session not found");
      }
      throw new Error(`Failed to retrieve study session: ${error.message}`);
    }

    return data;
  }

  /**
   * Lists study sessions with optional filtering and pagination
   * @param params - Query parameters for filtering, sorting, and pagination
   * @returns Paginated list of study sessions
   * @throws {Error} If validation fails or database error occurs
   */
  async listStudySessions(params: StudySessionQueryParams): Promise<StudySessionListDto> {
    // Validate query parameters
    const validatedParams = listStudySessionsSchema.parse(params);
    const { projectId, page, limit, sort } = validatedParams;

    // Calculate pagination offset
    const offset = (page - 1) * limit;

    // Build the query
    let query = this.supabase.from("study_sessions").select("*", { count: "exact" });

    // Apply project filter if provided
    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    // Apply sorting
    if (sort) {
      const [field, direction] = sort.split(":");
      query = query.order(field, { ascending: direction === "asc" });
    } else {
      // Default sort by start_time descending (most recent first)
      query = query.order("start_time", { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list study sessions: ${error.message}`);
    }

    return {
      sessions: data || [],
      page,
      limit,
      total: count || 0,
    };
  }

  /**
   * Updates a study session (typically to end it and update cards_reviewed)
   * @param sessionId - The study session ID
   * @param userId - The authenticated user's ID
   * @param command - The update data
   * @returns The updated study session
   * @throws {Error} If validation fails, session not found, or database error occurs
   */
  async updateStudySession(
    sessionId: string,
    userId: string,
    command: Partial<StudySessionDto>
  ): Promise<StudySessionDto> {
    // Validate input data
    const validatedData = updateStudySessionSchema.parse(command);

    // Update the study session
    const { data, error } = await this.supabase
      .from("study_sessions")
      .update(validatedData)
      .eq("id", sessionId)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Study session not found");
      }
      throw new Error(`Failed to update study session: ${error.message}`);
    }

    return data;
  }
}
