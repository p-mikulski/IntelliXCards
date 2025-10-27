import type { APIRoute } from "astro";
import { FlashcardService } from "../../../../../lib/services/flashcard.service";
import { createFlashcardSchema } from "../../../../../lib/validation/flashcard.schema";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../../../types";

export const prerender = false;

/**
 * GET /api/projects/[projectId]/flashcards
 * Get all flashcards for a project
 */
export const GET: APIRoute = async ({ locals, params }) => {
  try {
    const projectId = params.projectId;
    if (!projectId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Project ID is required",
          statusCode: 400,
        } satisfies ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in",
          statusCode: 401,
        } satisfies ErrorResponseDto),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcards = await flashcardService.getFlashcardsByProject(projectId, locals.user.id);

    return new Response(
      JSON.stringify({
        flashcards,
        page: 1,
        limit: flashcards.length,
        total: flashcards.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Project not found or access denied") {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        } satisfies ErrorResponseDto),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // eslint-disable-next-line no-console
    console.error("Error fetching flashcards:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        statusCode: 500,
      } satisfies ErrorResponseDto),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

/**
 * POST /api/projects/[projectId]/flashcards
 * Create a new flashcard for a project
 */
export const POST: APIRoute = async ({ request, locals, params }) => {
  try {
    // 1. Extract and validate projectId
    const projectId = params.projectId;
    if (!projectId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Project ID is required",
          statusCode: 400,
        } satisfies ErrorResponseDto),
        { status: 400 }
      );
    }

    if (!locals.user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in",
          statusCode: 401,
        } satisfies ErrorResponseDto),
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid request data",
          statusCode: 400,
          details: {
            fields: validationResult.error.flatten().fieldErrors,
          },
        } satisfies ValidationErrorResponseDto),
        { status: 400 }
      );
    }

    // 3. Create flashcard using service
    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.createFlashcard(projectId, validationResult.data, locals.user.id);

    // 4. Return success response
    return new Response(JSON.stringify(flashcard), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle known error types
    if (error instanceof Error && error.message === "Project not found or access denied") {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        } satisfies ErrorResponseDto),
        { status: 404 }
      );
    }

    // Log unexpected errors but don't expose details to client
    // eslint-disable-next-line no-console
    console.error("Error creating flashcard:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
        statusCode: 500,
      } satisfies ErrorResponseDto),
      { status: 500 }
    );
  }
};
