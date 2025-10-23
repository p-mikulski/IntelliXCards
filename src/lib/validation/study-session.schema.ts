import { z } from "zod";

/**
 * Validation schema for creating a study session
 */
export const createStudySessionSchema = z.object({
  start_time: z.string().datetime({ message: "start_time must be a valid ISO 8601 datetime string" }),
});

/**
 * Validation schema for updating a study session
 */
export const updateStudySessionSchema = z.object({
  end_time: z.string().datetime({ message: "end_time must be a valid ISO 8601 datetime string" }).optional(),
  cards_reviewed: z.number().int().min(0, "cards_reviewed must be a non-negative integer").optional(),
});

/**
 * Validation schema for listing study sessions with query parameters
 */
export const listStudySessionsSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format").optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z
    .string()
    .regex(/^[a-zA-Z_]+:(asc|desc)$/, "Invalid sort format. Use field:asc or field:desc")
    .optional(),
});

/**
 * Validation schema for session ID parameter
 */
export const sessionIdParamSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID format"),
});

/**
 * Validation schema for project ID parameter
 */
export const projectIdParamSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
});

/**
 * Type inference helpers
 */
export type CreateStudySessionSchema = z.infer<typeof createStudySessionSchema>;
export type UpdateStudySessionSchema = z.infer<typeof updateStudySessionSchema>;
export type ListStudySessionsSchema = z.infer<typeof listStudySessionsSchema>;
export type SessionIdParamSchema = z.infer<typeof sessionIdParamSchema>;
export type ProjectIdParamSchema = z.infer<typeof projectIdParamSchema>;
