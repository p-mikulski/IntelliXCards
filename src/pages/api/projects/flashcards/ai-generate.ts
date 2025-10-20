import type { APIRoute } from "astro";
import {
  FlashcardGenerationService,
  generateFlashcardsSchema,
} from "../../../../lib/services/flashcard-generation.service";
import type { ErrorResponseDto, GenerateFlashcardsCommand, ValidationErrorResponseDto } from "../../../../types";
import { ZodError } from "zod";

// Disable prerendering as this is a dynamic API endpoint
export const prerender = false;

/**
 * POST /api/projects/:projectId/flashcards/ai-generate
 *
 * Generates flashcards using AI based on provided text input
 *
 * @param projectId - UUID of the project to generate flashcards for
 * @param text - Source text for flashcard generation (max 10,000 chars)
 * @param desired_count - Number of flashcards to generate
 * @returns Generated flashcard drafts or error response
 */
export const POST: APIRoute = async ({ params, request }) => {
  try {
    // Extract and validate project ID
    const { projectId } = params;
    if (!projectId) {
      return new Response(
        JSON.stringify({
          error: "BadRequest",
          message: "Project ID is required",
          statusCode: 400,
        } as ErrorResponseDto),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate request body against schema
    const validatedCommand = generateFlashcardsSchema.parse(body) as GenerateFlashcardsCommand;

    // Initialize the flashcard generation service
    const flashcardService = new FlashcardGenerationService();

    // Generate flashcard drafts
    const flashcardDrafts = await flashcardService.generateFlashcards(validatedCommand);

    // Return successful response
    return new Response(
      JSON.stringify({
        drafts: flashcardDrafts,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      const validationError: ValidationErrorResponseDto = {
        error: "ValidationError",
        message: "Invalid request data",
        statusCode: 400,
        details: {
          fields: Object.fromEntries(error.errors.map((err) => [err.path.join("."), [err.message]])),
        },
      };
      return new Response(JSON.stringify(validationError), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle other errors
    const errorResponse: ErrorResponseDto = {
      error: "InternalServerError",
      message: "An unexpected error occurred",
      statusCode: 500,
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
