import type { APIRoute } from "astro";
import { FlashcardService } from "../../../../../lib/services/flashcard.service";
import { createFlashcardSchema } from "../../../../../lib/validation/flashcard.schema";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../../../types";
import { DEFAULT_USER_ID } from "../../../../../db/supabase.client";

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

    const body = await request.json();

    // Validate using the same schema but make fields optional
    const validationResult = createFlashcardSchema.partial().safeParse(body);

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
    const flashcard = await flashcardService.updateFlashcard(flashcardId, validationResult.data, DEFAULT_USER_ID);

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
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

    const flashcardService = new FlashcardService(locals.supabase);
    await flashcardService.deleteFlashcard(flashcardId, DEFAULT_USER_ID);

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
