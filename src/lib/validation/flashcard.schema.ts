import { z } from "zod";
import type { CreateFlashcardCommand } from "../../types";

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
