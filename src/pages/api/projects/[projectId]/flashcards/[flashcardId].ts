import type { APIRoute } from "astro";
import { FlashcardService } from "../../../../../lib/services/flashcard.service";
import { updateFlashcardSchema } from "../../../../../lib/validation/flashcard.schema";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../../../types";

export const prerender = false;

/**
 * PATCH /api/projects/[projectId]/flashcards/[flashcardId]
 * Update a flashcard
 */
export const PATCH: APIRoute = async ({ request, locals, params }) => {
  try {
    const { flashcardId } = params;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
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

    const body = await request.json();

    // Validate using the update schema
    const validationResult = updateFlashcardSchema.safeParse(body);

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
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard = await flashcardService.updateFlashcard(flashcardId, validationResult.data, locals.user.id);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Flashcard not found or access denied") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: error.message,
            statusCode: 404,
          } satisfies ErrorResponseDto),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }

      if (error.message === "Target project not found or access denied") {
        return new Response(
          JSON.stringify({
            error: "Not Found",
            message: error.message,
            statusCode: 404,
          } satisfies ErrorResponseDto),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    }

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
 * DELETE /api/projects/[projectId]/flashcards/[flashcardId]
 * Delete a flashcard
 */
export const DELETE: APIRoute = async ({ locals, params }) => {
  try {
    const { flashcardId } = params;
    if (!flashcardId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Flashcard ID is required",
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
    await flashcardService.deleteFlashcard(flashcardId, locals.user.id);

    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Flashcard not found or access denied") {
      return new Response(
        JSON.stringify({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        } satisfies ErrorResponseDto),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

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
