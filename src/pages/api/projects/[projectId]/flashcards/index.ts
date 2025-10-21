import type { APIRoute } from "astro";
import { FlashcardService } from "../../../../../lib/services/flashcard.service";
import { createFlashcardSchema } from "../../../../../lib/validation/flashcard.schema";
import type { ErrorResponseDto, ValidationErrorResponseDto } from "../../../../../types";

export const prerender = false;

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
    const flashcard = await flashcardService.createFlashcard(projectId, validationResult.data);

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
