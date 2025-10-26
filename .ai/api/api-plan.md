# REST API Plan

## 1. Authentication Endpoints (Managed by Supabase Auth)

All authentication endpoints are automatically provided and managed by Supabase Auth service:

### POST /auth/v1/signup
- **Description:** Create a new user account
- **Authentication:** None
- **Request Body:**
  ```typescript
  {
    email: string;     // User's email address
    password: string;  // User's password (min 6 characters)
  }
  ```
- **Response:**
  - 200 OK: User created successfully
    ```typescript
    {
      user: {
        id: string;
        email: string;
        created_at: string;
      };
      session: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    }
    ```
  - 400 Bad Request: Invalid input
  - 409 Conflict: Email already registered

### POST /auth/v1/token
- **Description:** Sign in with email and password
- **Authentication:** None
- **Request Body:**
  ```typescript
  {
    email: string;     // User's email
    password: string;  // User's password
  }
  ```
- **Response:**
  - 200 OK: Login successful
    ```typescript
    {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: {
        id: string;
        email: string;
      };
    }
    ```
  - 400 Bad Request: Invalid credentials
  - 401 Unauthorized: Wrong email/password

### POST /auth/v1/logout
- **Description:** Sign out the current user
- **Authentication:** Bearer token required
- **Request Body:** None
- **Response:**
  - 200 OK: Logout successful
  - 401 Unauthorized: Invalid token

### POST /auth/v1/token/refresh
- **Description:** Refresh expired access token
- **Authentication:** None
- **Request Body:**
  ```typescript
  {
    refresh_token: string;  // The refresh token from login
  }
  ```
- **Response:**
  - 200 OK: Token refreshed
    ```typescript
    {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    }
    ```
  - 401 Unauthorized: Invalid refresh token

### DELETE /auth/v1/user
- **Description:** Delete current user's account
- **Authentication:** Bearer token required
- **Request Body:** None
- **Response:**
  - 200 OK: Account deleted successfully
  - 401 Unauthorized: Invalid token

### Authentication Implementation Notes

1. Authentication is handled entirely by Supabase Auth service
2. All authenticated API endpoints require a valid JWT token in the Authorization header
3. Token management and session persistence are handled by Supabase Client
4. CORS is pre-configured by Supabase
5. Rate limiting is automatically applied by Supabase
6. Password reset and email verification flows are available but not configured for MVP

## 2. Resources

- **Users**: Managed by Supabase Auth (endpoints detailed above).
- **Projects**: Corresponds to the `projects` table.
- **Flashcards**: Corresponds to the `flashcards` table.
- **StudySessions**: Corresponds to the `study_sessions` table.

## 2. Endpoints

### Projects

- **Create Project**
  - **Method:** POST
  - **URL Path:** `/projects`
  - **Description:** Creates a new project.
  - **JSON Request Payload:**
    ```json
    {
      "title": "string (required)",
      "description": "string (optional)",
      "tag": "string (optional)"
    }
    ```
  - **JSON Response Payload:**
    ```json
    {
      "id": "UUID",
      "user_id": "UUID",
      "title": "string",
      "description": "string",
      "tag": "string",
      "created_at": "timestamp",
      "last_modified": "timestamp"
    }
    ```
  - **Success Codes:** 201 Created
  - **Error Codes:** 400 Bad Request, 401 Unauthorized

- **List Projects**
  - **Method:** GET
  - **URL Path:** `/projects`
  - **Description:** Retrieves a paginated list of projects for the authenticated user.
  - **Query Parameters:**
    - `page` (optional, default=1)
    - `limit` (optional, default=10)
    - `sort` (optional, e.g., `created_at:desc`)
  - **JSON Response Payload:**
    ```json
    {
      "projects": [
        {
          "id": "UUID",
          "title": "string",
          "description": "string",
          "tag": "string",
          "created_at": "timestamp",
          "last_modified": "timestamp"
        }
      ],
      "page": 1,
      "limit": 10,
      "total": "number"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 401 Unauthorized

- **Get Project Detail**
  - **Method:** GET
  - **URL Path:** `/projects/{projectId}`
  - **Description:** Retrieves full details for a single project.
  - **JSON Response Payload:**
    ```json
    {
      "id": "UUID",
      "user_id": "UUID",
      "title": "string",
      "description": "string",
      "tag": "string",
      "created_at": "timestamp",
      "last_modified": "timestamp"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 404 Not Found, 401 Unauthorized

- **Update Project**
  - **Method:** PATCH
  - **URL Path:** `/projects/{projectId}`
  - **Description:** Rename or update a project’s description and tag.
  - **JSON Request Payload:**
    ```json
    {
      "title": "string (optional)",
      "description": "string (optional)",
      "tag": "string (optional)"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

- **Delete Project**
  - **Method:** DELETE
  - **URL Path:** `/projects/{projectId}`
  - **Description:** Deletes the project along with all associated flashcards.
  - **Success Codes:** 204 No Content
  - **Error Codes:** 401 Unauthorized, 404 Not Found

### Flashcards

- **Create Flashcard (Manual Entry)**
  - **Method:** POST
  - **URL Path:** `/projects/{projectId}/flashcards`
  - **Description:** Creates a new flashcard under the specified project.
  - **JSON Request Payload:**
    ```json
    {
      "front": "string (max 200 characters, required)",
      "back": "string (max 500 characters, required)"
    }
    ```
  - **JSON Response Payload:**
    ```json
    {
      "id": "UUID",
      "project_id": "UUID",
      "front": "string",
      "back": "string",
      "next_review_date": "timestamp (default now + 1 day)",
      "ease_factor": 2.5,
      "created_at": "timestamp"
    }
    ```
  - **Success Codes:** 201 Created
  - **Error Codes:** 400 Bad Request, 401 Unauthorized

- **List Flashcards**
  - **Method:** GET
  - **URL Path:** `/projects/{projectId}/flashcards`
  - **Description:** Retrieves a paginated list of flashcards for a project.
  - **Query Parameters:**
    - `page` (optional, default=1)
    - `limit` (optional, default=10)
    - `sort` (optional, e.g., `next_review_date:asc`)
  - **JSON Response Payload:**
    ```json
    {
      "flashcards": [
        {
          "id": "UUID",
          "front": "string",
          "back": "string",
          "next_review_date": "timestamp",
          "ease_factor": "number",
          "feedback": "accepted/rejected/null",
          "feedback_timestamp": "timestamp"
        }
      ],
      "page": 1,
      "limit": 10,
      "total": "number"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 401 Unauthorized, 404 Not Found

- **Get Flashcard Detail**
  - **Method:** GET
  - **URL Path:** `/flashcards/{flashcardId}`
  - **Description:** Retrieves details of a specific flashcard.
  - **JSON Response Payload:**
    ```json
    {
      "id": "UUID",
      "project_id": "UUID",
      "front": "string",
      "back": "string",
      "next_review_date": "timestamp",
      "ease_factor": "number",
      "feedback": "accepted/rejected/null",
      "feedback_timestamp": "timestamp",
      "created_at": "timestamp"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 404 Not Found, 401 Unauthorized

- **Update Flashcard**
  - **Method:** PATCH
  - **URL Path:** `/flashcards/{flashcardId}`
  - **Description:** Updates the content, feedback, or other fields of a flashcard.
  - **JSON Request Payload (example):**
    ```json
    {
      "front": "string (optional)",
      "back": "string (optional)",
      "feedback": "accepted or rejected (optional)"
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

- **Delete Flashcard**
  - **Method:** DELETE
  - **URL Path:** `/flashcards/{flashcardId}`
  - **Description:** Deletes a flashcard.
  - **Success Codes:** 204 No Content
  - **Error Codes:** 401 Unauthorized, 404 Not Found

- **Initiate AI Flashcard Generation**
  - **Method:** POST
  - **URL Path:** `/projects/{projectId}/flashcards/ai-generate`
  - **Description:** Initiates AI generation of flashcards from provided plain text.
  - **JSON Request Payload:**
    ```json
    {
      "text": "string (up to 10,000 characters, required)",
      "desired_count": "number (required)"
    }
    ```
  - **JSON Response Payload:**
    ```json
    {
      "drafts": [
        {
          "front": "string (max 200 characters)",
          "back": "string (max 500 characters)"
        }
      ]
    }
    ```
  - **Success Codes:** 200 OK
  - **Error Codes:** 400 Bad Request, 500 Internal Server Error

- **Regenerate Flashcard (AI Based)**
  - **Method:** POST
  - **URL Path:** `/flashcards/{flashcardId}/regenerate`
  - **Description:** Regenerates an AI-generated flashcard, overwriting the previous version.
  - **Success Codes:** 200 OK (with revised flashcard payload)
  - **Error Codes:** 400 Bad Request, 401 Unauthorized, 404 Not Found

### Study Sessions

- **Start Study Session**
  - **Method:** POST
  - **URL Path:** `/projects/{projectId}/study-sessions`
  - **Description:** Starts a new study session for the specified project.
  - **JSON Request Payload:**
    ```json
    {
      "start_time": "timestamp (required)"
    }
    ```
  - **JSON Response Payload:**
    ```json
    {
      "id": "UUID",
      "user_id": "UUID",
      "project_id": "UUID",
      "start_time": "timestamp",
      "end_time": null,
      "cards_reviewed": 0
    }
    ```
  - **Success Codes:** 201 Created
  - **Error Codes:** 400 Bad Request, 401 Unauthorized

- **Get Study Session Detail**
  - **Method:** GET
  - **URL Path:** `/study-sessions/{sessionId}`
  - **Description:** Retrieves details and summary of a study session.
  - **Success Codes:** 200 OK
  - **Error Codes:** 404 Not Found, 401 Unauthorized

- **List Study Sessions**
  - **Method:** GET
  - **URL Path:** `/study-sessions`
  - **Description:** Lists study sessions with optional filtering by project.
  - **Query Parameters:**
    - `projectId` (optional)
    - `page` (optional, default=1)
    - `limit` (optional, default=10)
  - **Success Codes:** 200 OK
  - **Error Codes:** 401 Unauthorized

## 3. Validation and Business Logic

### Validation Conditions

- **Projects:**
  - `title` is required.
- **Flashcards:**
  - `front` field: required and maximum 200 characters.
  - `back` field: required and maximum 500 characters.
- **Study Sessions:**
  - `start_time` should be a valid timestamp.
- All resources:
  - Enforce that the authenticated user's id matches the resource’s ownership.

### Business Logic Implementation

- **AI Flashcard Generation:**
  - On POST `/projects/{projectId}/flashcards/ai-generate`, the API calls the AI service to generate flashcard drafts from the provided text. The drafts are returned for user review before manual confirmation.
- **Flashcard Regeneration:**
  - On POST `/flashcards/{flashcardId}/regenerate`, the API triggers a regeneration process. The new flashcard content overwrites the existing content, and the revision is timestamped without version history.
- **Spaced Repetition / Study Mode:**
  - When a study session is started, the API initializes a session and later updates it (e.g., ending the session, updating the number of cards reviewed). Underlying logic calculates the "next_review_date" for flashcards based on the spaced repetition algorithm.
- **Feedback Submission:**
  - Updating flashcard feedback (thumbs up/thumbs down) via PATCH on `/flashcards/{flashcardId}` updates the `feedback` field and sets `feedback_timestamp`.

### Security and Performance

- **Security:**
  - Use JWT-based authentication.
  - Enforce database RLS policies (e.g., `user_id = auth.uid()`).
  - Rate limiting can be applied at a gateway level.
- **Performance:**
  - List endpoints support pagination, filtering, and sorting.
  - Appropriate indexes (e.g., on `project_id`, `next_review_date`, etc.) are leveraged in database queries.
