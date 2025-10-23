# API Endpoint Implementation Plan: AI Flashcard Generation

## 1. Endpoint Overview
This endpoint initiates the AI-powered generation of flashcard drafts from a user-provided text. It takes a block of text and a desired number of flashcards, processes them through an external AI service, and returns a list of generated `(front, back)` pairs as drafts. These drafts are not persisted to the database until the user explicitly saves them.

## 2. Request Details
- **HTTP Method:** `POST`
- **URL Structure:** `/api/projects/{projectId}/flashcards/ai-generate`
- **Parameters:**
  - **URL Parameter (Required):**
    - `projectId` (UUID): The identifier of the project for which flashcards are being generated.
  - **Request Body (Required):**
    ```json
    {
      "text": "string (non-empty, max 10,000 characters)",
      "desired_count": "number (positive integer)"
    }
    ```

## 3. Used Types
- **`GenerateFlashcardsDto` (New):** A Data Transfer Object for the request body, validated with a Zod schema.
  ```typescript
  // In: src/lib/validation/flashcard.schema.ts
  import { z } from 'zod';

  export const GenerateFlashcardsDtoSchema = z.object({
    text: z.string({ required_error: 'Text is required.' }).min(1, 'Text cannot be empty.').max(10000, 'Text cannot exceed 10,000 characters.'),
    desired_count: z.number({ required_error: 'Desired count is required.' }).int('Desired count must be an integer.').positive('Desired count must be positive.'),
  });

  export type GenerateFlashcardsDto = z.infer<typeof GenerateFlashcardsDtoSchema>;
  ```
- **`FlashcardDraft` (New):** A type representing a single, non-persisted flashcard draft.
  ```typescript
  // In: src/types.ts
  export type FlashcardDraft = {
    front: string;
    back: string;
  };
  ```

## 4. Response Details
- **Success (200 OK):**
  - Returns a JSON object containing an array of generated flashcard drafts.
  ```json
  {
    "drafts": [
      {
        "front": "Generated question about the text.",
        "back": "Generated answer to the question."
      }
    ]
  }
  ```
- **Error:**
  - Returns a standard JSON error object with a descriptive message.
  ```json
  {
    "error": "Descriptive error message."
  }
  ```

## 5. Data Flow
1. The client sends a `POST` request to `/api/projects/{projectId}/flashcards/ai-generate` with the required payload.
2. The Astro middleware (`src/middleware/index.ts`) authenticates the user and attaches the Supabase client and user session to `context.locals`.
3. The API route handler (`src/pages/api/projects/[projectId]/flashcards/ai-generate.ts`) is invoked.
4. The handler validates the `projectId` from the URL.
5. It parses and validates the JSON request body against the `GenerateFlashcardsDtoSchema`.
6. It queries the `projects` table to verify that a project with the given `projectId` exists and belongs to the authenticated user (`auth.uid()`).
7. The handler calls the `FlashcardGenerationService`, passing the `text` and `desired_count`.
8. The `FlashcardGenerationService` constructs a precise prompt for the AI model, sends the request, and parses the response into an array of `FlashcardDraft` objects.
9. The API route handler receives the drafts from the service and sends them back to the client with a `200 OK` status.

## 6. Security Considerations
- **Authentication:** All requests must be authenticated. The Astro middleware will reject any request without a valid session, returning a `401 Unauthorized` error.
- **Authorization:** The endpoint must verify that the `projectId` belongs to the authenticated user. This prevents a user from generating flashcards for another user's project. A query will be performed using both `projectId` and the `user_id` from the session.
- **Input Validation:** All incoming data (`projectId`, `text`, `desired_count`) will be strictly validated to prevent invalid data processing and potential injection attacks. The `text` field will be limited to 10,000 characters to prevent abuse of the AI service.
- **Prompt Engineering:** The backend will use a securely constructed prompt template to wrap the user-provided text, reducing the risk of prompt injection attacks that could alter the AI's intended function.

## 7. Error Handling
- **400 Bad Request:**
  - The `projectId` is not a valid UUID.
  - The request body is malformed or fails validation (e.g., `text` is too long, `desired_count` is not a positive integer).
- **401 Unauthorized:**
  - The user is not authenticated.
- **404 Not Found:**
  - The project with the specified `projectId` does not exist or does not belong to the user.
- **500 Internal Server Error:**
  - The AI service is unavailable or returns an unexpected error.
  - The database is unreachable or a query fails unexpectedly.
  - Any other unhandled exception occurs on the server.

## 8. Performance Considerations
- **AI Service Latency:** The primary performance bottleneck will be the response time of the external AI service. The client-side UI should display a loading state to indicate that generation is in progress.
- **Payload Size:** The request payload is limited by the `text` character count, and the response payload is expected to be small, so network transfer time should be minimal.

## 9. Implementation Steps
1. **Update Types:** Add the `FlashcardDraft` type to `src/types.ts`.
2. **Create Validation Schema:** Create `src/lib/validation/flashcard.schema.ts` and define the `GenerateFlashcardsDtoSchema`.
3. **Implement Service:**
   - Create the `FlashcardGenerationService` in `src/lib/services/flashcard-generation.service.ts`.
   - Implement a `generateFlashcardsFromText` method that takes `text` and `desired_count` as input.
   - This method will be responsible for constructing the AI prompt, calling the AI API (e.g., using `fetch`), and parsing the response into an array of `FlashcardDraft` objects.
4. **Create API Endpoint:**
   - Create the file `src/pages/api/projects/[projectId]/flashcards/ai-generate.ts`.
   - Implement the `POST` handler function.
5. **Implement Endpoint Logic:**
   - **Authentication:** Check for an active session in `Astro.locals.session`. If none, return `401`.
   - **Parameter Validation:** Validate that `Astro.params.projectId` is a valid UUID.
   - **Body Validation:** Parse the request body and validate it using `GenerateFlashcardsDtoSchema.safeParse()`. If invalid, return `400`.
   - **Authorization:** Query the database to ensure the project exists and belongs to `Astro.locals.session.user.id`. If not found, return `404`.
   - **Service Call:** Instantiate `FlashcardGenerationService` and call `generateFlashcardsFromText`.
   - **Response:** Wrap the result in a `try...catch` block. On success, return the drafts with a `200` status. On failure (e.g., AI service error), log the error and return `500`.
