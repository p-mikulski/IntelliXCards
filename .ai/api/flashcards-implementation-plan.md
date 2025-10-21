# API Endpoint Implementation Plan: Create Flashcard (Manual Entry)

## 1. Endpoint Overview
This endpoint allows users to manually create a new flashcard under a specified project using a POST request. It validates user input (ensuring that 'front' and 'back' fields meet character limits), associates the flashcard with the given project, and persists the record in the database. Upon success, it returns the created flashcard data with a 201 Created status.

## 2. Request Details
- **HTTP Method:** POST
- **URL Structure:** /projects/{projectId}/flashcards
- **Parameters:**
  - **Path Parameter:**
    - `projectId` (UUID, required): The ID of the project under which the flashcard is to be created.
  - **Body Parameters:**
    - `front` (string, required, max 200 characters): The front text of the flashcard.
    - `back` (string, required, max 500 characters): The back text of the flashcard.
- **Request Body Example:**
  ```json
  {
    "front": "What is the capital of France?",
    "back": "Paris"
  }
  ```

## 3. Used Types
- **DTO Types & Command Models:**
  - `CreateFlashcardCommand` (from types.ts): Contains the fields `front` and `back` drawn from the request payload.
  - `FlashcardDto` for response payload.

## 4. Response Details
- **Success Response:**
  - **Status Code:** 201 Created
  - **Payload:**
    ```json
    {
      "id": "UUID",
      "project_id": "UUID",
      "front": "string",
      "back": "string",
      "next_review_date": "timestamp",
      "ease_factor": 2.5,
      "created_at": "timestamp"
    }
    ```
- **Error Responses:**
  - **400 Bad Request:** For invalid inputs or when validation fails.
  - **401 Unauthorized:** When the user is not authenticated.
  - **404 Not Found:** If the project does not exist.
  - **500 Internal Server Error:** For unexpected server errors.

## 5. Data Flow
1. **Request Reception:** The API gateway or server receives the POST request with a project ID and request body.
2. **Authentication & Authorization:** Verify that the user is authenticated and authorized to add flashcards to the specified project.
3. **Input Validation:** Validate payload ensuring 'front' is present and not exceeding 200 characters and 'back' is present and not exceeding 500 characters.
4. **Service Layer Processing:** Call the flashcard service to create the flashcard using the `CreateFlashcardCommand` DTO.
   - Validate that the project exists and belongs to the user.
   - Use database constraints to enforce additional rules (e.g., defaults for `next_review_date`, `ease_factor`).
5. **Database Interaction:** Insert the new flashcard into the `flashcards` table.
6. **Response Generation:** Construct the response payload based on the created flashcard and return a 201 status.

## 6. Security Considerations
- **Authentication:** Ensure endpoint is protected using authentication middleware (e.g., JWT, session-based auth).
- **Authorization:** Confirm that the authenticated user has access rights to the specified project.
- **Input Sanitization:** Validate and sanitize inputs to prevent injection attacks.
- **Rate Limiting:** Consider rate limiting to prevent abuse of the endpoint.

## 7. Error Handling
- **Validation Errors (400):** Return detailed error messages when 'front' or 'back' fields are missing or exceed character limits.
- **Unauthorized Access (401):** Return error when authentication fails.
- **Resource Not Found (404):** Return error if the project with the given ID does not exist.
- **Server Errors (500):** Log unexpected errors and return a generic error message to prevent sensitive information leakage.

## 8. Performance Considerations
- **Efficient Database Queries:** Ensure that the insertion operation is efficient by leveraging proper indexing (using `projects_user_id_idx` and `flashcards_project_id_idx`).
- **Validation Efficiency:** Implement early validation to avoid unnecessary processing.
- **Scalability:** Ensure the service layer can handle concurrent requests gracefully.

## 9. Implementation Steps
1. **Define the Route Handler:** Create or update the API route file at `src/pages/api/projects/[projectId]/flashcards/index.ts` to handle POST requests.
2. **Extract Request Data:** Parse the `projectId` from URL parameters and the request body.
3. **Authentication Middleware:** Integrate authentication/authorization checks to confirm user access to the project.
4. **Input Validation:** Validate request body using either custom logic or a validation library (e.g., Zod) against the `CreateFlashcardCommand` type.
5. **Service Layer Call:** Pass validated input to a flashcard service function (e.g., `flashcardGenerationService` or create a new service in `src/lib/services/flashcard.service.ts`) that handles business logic and database insertion.
6. **Database Insertion:** Use Supabase or a raw SQL client to perform the insertion in the `flashcards` table, leveraging defaults (e.g., for `next_review_date` and `ease_factor`).
7. **Handle Errors:** Wrap operations in try-catch blocks to capture and log errors. Return appropriate HTTP status codes based on error type.
8. **Construct Response:** On successful creation, return the inserted flashcard data with a 201 Created status.
9. **Testing:** Write unit and integration tests to verify that valid input creates a flashcard and invalid input returns proper errors.
10. **Documentation:** Update API documentation to reflect endpoint details, both inline and in external docs if applicable.
