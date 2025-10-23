# API Endpoint Implementation Plan: AI Flashcard Generation & Regeneration

## 1. Endpoint Overview

This plan covers two REST API endpoints:

- **Initiate AI Flashcard Generation**: This endpoint accepts plain text from a client and triggers AI-powered flashcard generation within a project. The generated drafts contain brief flashcards with a truncated front (max 200 characters) and back (max 500 characters).

- **Regenerate Flashcard (AI Based)**: This endpoint refreshes an existing flashcard (previously generated through AI) for correction or updated content, replacing the former version.

## 2. Request Details

### Initiate AI Flashcard Generation

- **HTTP Method**: POST
- **URL Path**: `/projects/{projectId}/flashcards/ai-generate`
- **Parameters**:
  - **Route Parameter**: `projectId` (UUID, required)
  - **Request Body** (JSON):
    - `text`: string (up to 10,000 characters, required)
    - `desired_count`: number (required)

### Regenerate Flashcard

- **HTTP Method**: POST
- **URL Path**: `/flashcards/{flashcardId}/regenerate`
- **Parameters**:
  - **Route Parameter**: `flashcardId` (UUID, required)
  - (Optional request body may be defined for future extensions; for now, no additional data is required.)

## 3. Used Types

- **GenerateFlashcardsCommand**: Used to capture the `text` and `desired_count` parameters for AI generation.
- **GenerateFlashcardsResponseDto**: Defines the response payload containing an array of flashcard drafts (`FlashcardDraft[]`).
- **FlashcardDraft**: Represents the AI-generated flashcard with `front` (max 200 characters) and `back` (max 500 characters).

## 4. Data Flow

1. **Input Validation**: Validate request body (using a library such as Zod) to ensure `text` does not exceed 10,000 characters and that `desired_count` is a valid number.
2. **Authentication & Authorization**: Authenticate the user and validate that they have access to the given `projectId` (for generation) or `flashcardId` (for regeneration).
3. **Service Invocation**: Call the AI flashcard generation service:
   - For generation: Pass the `GenerateFlashcardsCommand` to an internal service which performs text processing and AI interaction to generate drafts.
   - For regeneration: Trigger the same service to update the existing flashcard with fresh AI-generated content.
4. **Database Interaction**: Optionally log the request or store generation logs; enforce consistency with the project and flashcard database records.
5. **Response Transformation**: Format and return the resulting drafts in a JSON response upon success.

## 5. Security Considerations

- **Input Sanitization**: Ensure the plain text input is sanitized to prevent injection attacks.
- **Authorization Check**: Verify that the authenticated user has permission to interact with the specified project or flashcard.
- **Rate Limiting**: Consider rate-limiting endpoints to mitigate abuse of AI generation capabilities.
- **Error Logging**: Securely log error details without exposing sensitive data in client responses.

## 6. Error Handling

- **400 Bad Request**: Returned when input validation fails (e.g., missing required parameters, text exceeding limits, invalid numbers).
- **401 Unauthorized**: For regeneration endpoint if the user is not authenticated or lacks proper authorization.
- **404 Not Found**: If the specified `projectId` or `flashcardId` does not exist in the database.
- **500 Internal Server Error**: For unexpected server errors, such as failures in the AI service or database issues.

## 7. Performance Considerations

- **Asynchronous Processing**: If AI generation is resource-intensive, consider handling the request asynchronously with status polling or background jobs.
- **Caching**: Cache frequently requested generation results if applicable to reduce latency.
- **Scalability**: Design the AI generation service to scale horizontally to handle multiple concurrent requests.

## 8. Implementation Steps

1. **Input Validation**:
   - Use a validation library (e.g., Zod) to enforce payload constraints (text length, desired_count number).
2. **Authentication/Authorization**:
   - Confirm the authenticated user's rights against the provided `projectId` or `flashcardId`.
3. **Service Layer**:
   - Design or extend the FlashcardGenerationService with methods for both generating and regenerating flashcards.
4. **Database Interactions**:
   - Retrieve and validate project/flashcard existence.
   - Optionally record generation logs or events.
5. **Endpoint Handler**:
   - Create the controller or endpoint handler for each route following the project’s coding practices.
   - Ensure proper mapping from incoming DTOs (GenerateFlashcardsCommand) to service calls and format the returned response as GenerateFlashcardsResponseDto.
6. **Error Handling and Logging**:
   - Implement try/catch blocks to gracefully handle and log errors.
   - Map errors to the corresponding HTTP status codes (400, 401, 404, 500).
7. **Testing**:
   - Write unit tests and integration tests covering normal flow, input errors, and edge cases.
8. **Documentation**:
   - Update API documentation with the new endpoints, including expected payloads and error codes.
9. **Code Review & Deployment**:
   - Follow team processes for peer review;
   - Deploy changes to a staging environment before production rollout.

---

This document provides comprehensive guidelines for the development team to implement and integrate the AI flashcard generation and regeneration endpoints effectively.
