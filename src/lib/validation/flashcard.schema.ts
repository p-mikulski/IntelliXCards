import { z } from "zod";
import type { CreateFlashcardCommand, UpdateFlashcardCommand } from "../../types";

/**
 * Schema for validating flashcard creation requests
 * Enforces character limits and required fields as per database constraints
 */
export const createFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, { message: "Front content is required" })
    .max(200, { message: "Front content must not exceed 200 characters" })
    .trim(),
  back: z
    .string()
    .min(1, { message: "Back content is required" })
    .max(500, { message: "Back content must not exceed 500 characters" })
    .trim(),
}) satisfies z.ZodType<CreateFlashcardCommand>;

/**
 * Schema for validating flashcard update requests
 * All fields are optional, including spaced repetition fields and project_id for moving flashcards
 */
export const updateFlashcardSchema = z.object({
  front: z
    .string()
    .min(1, { message: "Front content is required" })
    .max(200, { message: "Front content must not exceed 200 characters" })
    .trim()
    .optional(),
  back: z
    .string()
    .min(1, { message: "Back content is required" })
    .max(500, { message: "Back content must not exceed 500 characters" })
    .trim()
    .optional(),
  feedback: z.enum(["accepted", "rejected"]).optional(),
  next_review_date: z.string().datetime({ message: "next_review_date must be a valid ISO 8601 datetime" }).optional(),
  ease_factor: z
    .number()
    .min(1.3, { message: "ease_factor must be at least 1.3" })
    .max(3.0, { message: "ease_factor must not exceed 3.0" })
    .optional(),
  project_id: z.string().uuid({ message: "project_id must be a valid UUID" }).optional(),
}) satisfies z.ZodType<UpdateFlashcardCommand>;
