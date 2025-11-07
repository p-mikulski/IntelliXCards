import type { APIRoute } from "astro";
import { StudySessionService } from "../../../lib/services/study-session.service";
import { sessionIdParamSchema } from "../../../lib/validation/study-session.schema";
import type { ErrorResponseDto, StudySessionDto } from "../../../types";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET /api/study-sessions/[sessionId]
 * Retrieves a single study session by ID
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    // Validate session ID parameter
    const { sessionId } = sessionIdParamSchema.parse(params);

    // Retrieve study session via service
    const studySessionService = new StudySessionService(locals.supabase);
    const studySession = await studySessionService.getStudySessionById(sessionId);

    return new Response(JSON.stringify(studySession as StudySessionDto), {
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
          message: "Invalid session ID format",
          statusCode: 400,
          details: { fields: fieldErrors },
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message === "Study session not found") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: error.message,
            statusCode: 404,
          } as ErrorResponseDto),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      // Handle other known errors
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
    console.error("Unexpected error in GET /api/study-sessions/[sessionId]:", error);
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
