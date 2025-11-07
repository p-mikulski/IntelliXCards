import type { APIRoute } from "astro";
import { StudySessionService } from "../../../../../lib/services/study-session.service";
import { createStudySessionSchema, projectIdParamSchema } from "../../../../../lib/validation/study-session.schema";
import type { CreateStudySessionCommand, ErrorResponseDto, StudySessionDto } from "../../../../../types";
import { ZodError } from "zod";
import { DEFAULT_USER_ID } from "../../../../../db/supabase.client";

export const prerender = false;

/**
 * POST /api/projects/[projectId]/study-sessions
 * Creates a new study session for a specific project
 */
export const POST: APIRoute = async ({ request, locals, params }) => {
  try {
    // Validate project ID parameter
    const { projectId } = projectIdParamSchema.parse(params);

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createStudySessionSchema.parse(body);

    // Create study session via service
    const studySessionService = new StudySessionService(locals.supabase);

    const studySession = await studySessionService.createStudySession(
      DEFAULT_USER_ID,
      projectId,
      validatedData as CreateStudySessionCommand
    );

    return new Response(JSON.stringify(studySession as StudySessionDto), {
      status: 201,
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
          message: "Invalid input data",
          statusCode: 400,
          details: { fields: fieldErrors },
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle business logic errors
    if (error instanceof Error) {
      // Check for specific error messages
      if (error.message === "Project not found") {
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
    console.error("Unexpected error in POST /api/projects/[projectId]/study-sessions:", error);
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
