/**
 * Data Transfer Objects (DTOs) and Command Models for the Anki-style Flashcard Application API
 *
 * This file contains type definitions for all DTOs used in the REST API.
 * Each type is derived from the database entity definitions to ensure type safety
 * and maintain a single source of truth.
 */

import type { Tables, TablesInsert, TablesUpdate, Enums } from "./db/database.types";

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

/**
 * Database entity types for direct reference
 */
export type Project = Tables<"projects">;
export type Flashcard = Tables<"flashcards">;
export type StudySession = Tables<"study_sessions">;
export type FlashcardFeedback = Enums<"flashcard_feedback">;

// ============================================================================
// PROJECT DTOs
// ============================================================================

/**
 * Command model for creating a new project
 * Derived from TablesInsert but excludes server-managed fields
 */
export type CreateProjectCommand = Pick<TablesInsert<"projects">, "title" | "description" | "tag">;

/**
 * Response DTO for a created/retrieved project
 * Returns all fields from the database
 */
export type ProjectDto = Project;

/**
 * Command model for updating an existing project
 * All fields are optional as per PATCH semantics
 */
export type UpdateProjectCommand = Pick<TablesUpdate<"projects">, "title" | "description" | "tag">;

/**
 * Simplified project DTO for list views
 * Excludes user_id for security/simplicity
 */
export type ProjectListItemDto = Omit<Project, "user_id">;

/**
 * Paginated response for project lists
 */
export interface ProjectListDto {
  projects: ProjectListItemDto[];
  page: number;
  limit: number;
  total: number;
}

// ============================================================================
// FLASHCARD DTOs
// ============================================================================

/**
 * Command model for creating a new flashcard manually
 * Only requires front and back content from the user
 */
export type CreateFlashcardCommand = Pick<TablesInsert<"flashcards">, "front" | "back">;

/**
 * Response DTO for a created/retrieved flashcard
 * Returns all fields from the database
 */
export type FlashcardDto = Flashcard;

/**
 * Command model for updating an existing flashcard
 * Allows updating content, feedback, and spaced repetition fields
 */
export type UpdateFlashcardCommand = Pick<
  TablesUpdate<"flashcards">,
  "front" | "back" | "feedback" | "next_review_date" | "ease_factor"
>;

/**
 * Simplified flashcard DTO for list views
 * Excludes project_id and created_at for cleaner responses
 */
export type FlashcardListItemDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "next_review_date" | "ease_factor" | "feedback" | "feedback_timestamp"
>;

/**
 * Paginated response for flashcard lists
 */
export interface FlashcardListDto {
  flashcards: FlashcardListItemDto[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Draft flashcard structure returned by AI generation
 * Does not include database-managed fields
 */
export type FlashcardDraft = Pick<Flashcard, "front" | "back">;

/**
 * Command model for AI-based flashcard generation
 * Includes the source text and desired number of flashcards
 */
export interface GenerateFlashcardsCommand {
  text: string; // Max 10,000 characters
  desired_count: number;
}

/**
 * Response DTO for AI flashcard generation
 * Returns an array of draft flashcards for user review
 */
export interface GenerateFlashcardsResponseDto {
  drafts: FlashcardDraft[];
}

// ============================================================================
// STUDY SESSION DTOs
// ============================================================================

/**
 * Command model for starting a new study session
 * Only requires the start time from the user
 */
export type CreateStudySessionCommand = Pick<TablesInsert<"study_sessions">, "start_time">;

/**
 * Response DTO for a created/retrieved study session
 * Returns all fields from the database
 */
export type StudySessionDto = StudySession;

/**
 * Paginated response for study session lists
 */
export interface StudySessionListDto {
  sessions: StudySessionDto[];
  page: number;
  limit: number;
  total: number;
}

/**
 * Command model for updating a study session
 * Typically used to end a session and update the count of reviewed cards
 */
export type UpdateStudySessionCommand = Pick<TablesUpdate<"study_sessions">, "end_time" | "cards_reviewed">;

// ============================================================================
// COMMON QUERY PARAMETERS
// ============================================================================

/**
 * Common pagination parameters used across list endpoints
 */
export interface PaginationParams {
  page?: number; // Default: 1
  limit?: number; // Default: 10
}

/**
 * Sorting parameters for list endpoints
 * Format: "field:direction" (e.g., "created_at:desc")
 */
export interface SortParams {
  sort?: string;
}

/**
 * Combined query parameters for list endpoints
 */
export type ListQueryParams = PaginationParams & SortParams;

/**
 * Study session filtering parameters
 */
export type StudySessionQueryParams = ListQueryParams & {
  projectId?: string;
};

// ============================================================================
// ERROR RESPONSE DTOs
// ============================================================================

/**
 * Standard error response structure
 */
export interface ErrorResponseDto {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

/**
 * Validation error response with field-specific errors
 */
export type ValidationErrorResponseDto = ErrorResponseDto & {
  details: {
    fields: Record<string, string[]>;
  };
};
