import { z } from "zod";

/**
 * Validation schema for project creation
 */
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  tag: z.string().max(50, "Tag must be 50 characters or less").optional(),
});

/**
 * Validation schema for project updates
 */
export const updateProjectSchema = createProjectSchema.partial();

/**
 * Validation schema for list query parameters
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z
    .string()
    .regex(/^[a-zA-Z_]+:(asc|desc)$/, "Invalid sort format. Use field:asc or field:desc")
    .optional(),
});

/**
 * Type inference helpers
 */
export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;
export type ListQuerySchema = z.infer<typeof listQuerySchema>;
