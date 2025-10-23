# API Endpoint Implementation Plan: Study Sessions

This document outlines the implementation plan for the REST API endpoints related to managing study sessions.

## 1. Endpoint Overview
The goal is to create a set of endpoints to manage the lifecycle of a user's study session for a specific project. This includes starting a session, listing all sessions, and viewing the details of a specific session. These endpoints are crucial for tracking user engagement and study habits.

## 2. Request Details

### A. Start Study Session
- **HTTP Method:** `POST`
- **URL Structure:** `/api/projects/{projectId}/study-sessions`
- **Parameters:**
  - **Required:** `projectId` (UUID, from URL)
- **Request Body:**
  ```json
  {
    "start_time": "string" // ISO 8601 format
  }
  ```

### B. Get Study Session Detail
- **HTTP Method:** `GET`
- **URL Structure:** `/api/study-sessions/{sessionId}`
- **Parameters:**
  - **Required:** `sessionId` (UUID, from URL)
- **Request Body:** None

### C. List Study Sessions
- **HTTP Method:** `GET`
- **URL Structure:** `/api/study-sessions`
- **Parameters:**
  - **Optional:** `projectId` (UUID, query param), `page` (number, query param), `limit` (number, query param)
- **Request Body:** None

## 3. Used Types
The following DTOs and Command models from `src/types.ts` will be used:
- `CreateStudySessionCommand`: For the request body of the "Start Study Session" endpoint.
- `StudySessionDto`: As the response for creating and retrieving a single session.
- `StudySessionListDto`: As the paginated response for listing sessions.
- `StudySessionQueryParams`: To handle query parameters for the list endpoint.
- `ErrorResponseDto` / `ValidationErrorResponseDto`: For standardized error responses.

## 4. Data Flow

1.  **API Route Handler (`/src/pages/api/...`)**:
    - Receives the incoming HTTP request.
    - Authenticates the user using `Astro.locals.supabase`.
    - Validates URL parameters and request body using `zod` schemas defined in `src/lib/validation`.
    - Calls the appropriate method in the `StudySessionService`.
2.  **Service Layer (`/src/lib/services/study-session.service.ts`)**:
    - Contains the core business logic.
    - Constructs and executes Supabase queries to interact with the `study_sessions` table.
    - All queries will implicitly use the authenticated user's ID due to RLS policies.
    - Handles data transformation and pagination logic.
3.  **Supabase Client (`/src/db/supabase.client.ts`)**:
    - Executes the database queries against the PostgreSQL database.
    - Supabase enforces Row-Level Security (RLS) to ensure data isolation between users.

## 5. Security Considerations
- **Authentication:** All endpoints will be protected. The user's session will be retrieved from `Astro.locals.session`. If no session exists, a `401 Unauthorized` error will be returned.
- **Authorization:** Supabase's Row-Level Security (RLS) will be the primary mechanism for authorization. Policies must be in place to ensure users can only access `projects` and `study_sessions` that belong to them (`user_id = auth.uid()`).
- **Input Validation:** All incoming data (URL params, query params, and request body) will be strictly validated using `zod` to prevent injection attacks and malformed data errors.

## 6. Error Handling
A consistent error handling strategy will be implemented:
- **`400 Bad Request`**: Returned for validation failures from `zod`. The response body will be a `ValidationErrorResponseDto` detailing the specific field errors.
- **`401 Unauthorized`**: Returned if `Astro.locals.session` is null.
- **`404 Not Found`**: Returned by the service layer if a specified `projectId` or `sessionId` is not found for the authenticated user.
- **`500 Internal Server Error`**: Returned for any unexpected exceptions or database errors, with a generic error message.

## 7. Performance Considerations
- **Database Indexing:** The `db-plan.md` specifies indexes on `study_sessions(user_id)`, `study_sessions(project_id)`, and `study_sessions(start_time)`. These are crucial for efficient filtering and sorting. The development team must ensure these indexes are created in the initial migration.
- **Pagination:** The list endpoint will use limit-offset pagination by default (`page`, `limit`) to avoid loading large datasets and ensure fast response times.
- **Payload Size:** The DTOs are designed to be concise. No large text fields are included, so payload size is not a major concern.

## 8. Implementation Steps

1.  **Create Validation Schemas:**
    - In a new file `src/lib/validation/study-session.schema.ts`, define `zod` schemas for:
      - `createStudySessionSchema` (validating `start_time`).
      - `listStudySessionsSchema` (validating optional `projectId`, `page`, `limit`).

2.  **Create Service Layer:**
    - Create `src/lib/services/study-session.service.ts`.
    - Implement the following async functions:
      - `createStudySession(supabase: SupabaseClient, userId: string, projectId: string, data: CreateStudySessionCommand)`: Inserts a new record into the `study_sessions` table.
      - `getStudySessionById(supabase: SupabaseClient, sessionId: string)`: Retrieves a single session, respecting RLS.
      - `listStudySessions(supabase: SupabaseClient, params: StudySessionQueryParams)`: Retrieves a paginated list of sessions, respecting RLS and applying filters.

3.  **Implement API Endpoints:**
    - **`POST /api/projects/[projectId]/study-sessions/index.ts`**:
      - Create the file.
      - Implement the `POST` handler.
      - Perform authentication and validation.
      - Call `studySessionService.createStudySession`.
      - Return a `201 Created` response with the `StudySessionDto`.
    - **`GET /api/study-sessions/[sessionId].ts`**:
      - Create the file.
      - Implement the `GET` handler.
      - Perform authentication and validation.
      - Call `studySessionService.getStudySessionById`.
      - Return a `200 OK` response with the `StudySessionDto` or `404 Not Found`.
    - **`GET /api/study-sessions/index.ts`**:
      - Create the file.
      - Implement the `GET` handler.
      - Perform authentication and validation.
      - Call `studySessionService.listStudySessions`.
      - Return a `200 OK` response with the `StudySessionListDto`.

4.  **Add RLS Policies (if not present):**
    - In the Supabase dashboard or a new migration file, verify/add RLS policies for the `study_sessions` table to ensure users can only access their own data.
    - Example Policy: `(auth.uid() = user_id)`

5.  **Unit & Integration Testing:**
    - Write tests for the service layer functions to ensure business logic is correct.
    - Write integration tests for the API endpoints to verify authentication, validation, and correct responses.
