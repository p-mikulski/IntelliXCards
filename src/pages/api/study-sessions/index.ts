import type { APIRoute } from "astro";
import { StudySessionService } from "../../../lib/services/study-session.service";
import { listStudySessionsSchema } from "../../../lib/validation/study-session.schema";
import type { ErrorResponseDto, StudySessionListDto } from "../../../types";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/study-sessions
 * Lists study sessions with optional filtering and pagination
 */
export const GET: APIRoute = async ({ locals, url }) => {
  try {
    // Extract and validate query parameters
    const queryParams = {
      projectId: url.searchParams.get("projectId") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined,
      sort: url.searchParams.get("sort") || undefined,
    };

    const validatedParams = listStudySessionsSchema.parse(queryParams);

    // Retrieve study sessions via service
    const studySessionService = new StudySessionService(locals.supabase);
    const result = await studySessionService.listStudySessions(validatedParams);

    return new Response(JSON.stringify(result as StudySessionListDto), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(err.message);
      });

      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid query parameters",
          statusCode: 400,
          details: { fields: fieldErrors },
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle unexpected errors
    console.error("Unexpected error in GET /api/study-sessions:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        statusCode: 500,
      } as ErrorResponseDto),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
