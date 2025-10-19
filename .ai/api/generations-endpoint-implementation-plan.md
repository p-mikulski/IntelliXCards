# API Endpoint Implementation Plan: AI Flashcard Generation

## 1. Endpoint Overview

This plan covers the implementation of two REST API endpoints for AI-powered flashcard generation:

1. **AI Flashcard Generation** - Generates multiple flashcard drafts from provided text using AI
2. **Flashcard Regeneration** - Regenerates a single existing flashcard using AI

Both endpoints leverage AI services to create educational flashcard content. The generation endpoint returns draft flashcards for user review (not persisted to database), while the regeneration endpoint updates an existing flashcard in place.

---

## 2. Request Details

### Endpoint 1: Initiate AI Flashcard Generation

- **HTTP Method:** POST
- **URL Structure:** `/api/projects/{projectId}/flashcards/ai-generate`
- **Content-Type:** `application/json`

**URL Parameters:**
- **Required:**
  - `projectId` (UUID) - The project ID to generate flashcards for

**Request Body:**
- **Required:**
  - `text` (string) - Plain text source material (min: 50 chars, max: 10,000 chars)
  - `desired_count` (number) - Number of flashcards to generate (min: 1, max: 50)

**Example Request:**
```json
{
  "text": "The Krebs cycle, also known as the citric acid cycle...",
  "desired_count": 5
}
```

### Endpoint 2: Regenerate Flashcard

- **HTTP Method:** POST
- **URL Structure:** `/api/flashcards/{flashcardId}/regenerate`
- **Content-Type:** `application/json`

**URL Parameters:**
- **Required:**
  - `flashcardId` (UUID) - The flashcard ID to regenerate

**Request Body:**
- None required (uses existing flashcard content)

---

## 3. Used Types

The following types from `src/types.ts` will be used:

### Command Models (Request)
- `GenerateFlashcardsCommand` - Request body for AI generation
  ```typescript
  {
    text: string;
    desired_count: number;
  }
  ```

### Response DTOs
- `GenerateFlashcardsResponseDto` - Response for AI generation
  ```typescript
  {
    drafts: FlashcardDraft[];
  }
  ```

- `FlashcardDraft` - Individual draft flashcard structure
  ```typescript
  {
    front: string;
    back: string;
  }
  ```

- `FlashcardDto` - Complete flashcard for regeneration response
  ```typescript
  {
    id: string;
    project_id: string;
    front: string;
    back: string;
    next_review_date: string;
    ease_factor: number;
    feedback: 'accepted' | 'rejected' | null;
    feedback_timestamp: string | null;
    created_at: string;
  }
  ```

### Error DTOs
- `ErrorResponseDto` - Standard error structure
- `ValidationErrorResponseDto` - Validation error with field details

### Additional Validation Schemas (to be created with Zod)
```typescript
// For AI generation endpoint
const GenerateFlashcardsSchema = z.object({
  text: z.string().min(50).max(10000),
  desired_count: z.number().int().min(1).max(50)
});

// For UUID validation
const UuidSchema = z.string().uuid();
```

---

## 4. Response Details

### Endpoint 1: AI Flashcard Generation

**Success Response (200 OK):**
```json
{
  "drafts": [
    {
      "front": "What is the Krebs cycle?",
      "back": "The Krebs cycle is a series of chemical reactions..."
    },
    {
      "front": "Where does the Krebs cycle occur?",
      "back": "The Krebs cycle occurs in the mitochondrial matrix..."
    }
  ]
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input (text too long, invalid desired_count, invalid UUID format)
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Project doesn't belong to authenticated user
- `404 Not Found` - Project not found
- `500 Internal Server Error` - AI service error or database error
- `503 Service Unavailable` - AI service temporarily unavailable

### Endpoint 2: Regenerate Flashcard

**Success Response (200 OK):**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "project_id": "123e4567-e89b-12d3-a456-426614174001",
  "front": "What is the revised question?",
  "back": "This is the regenerated answer with improved clarity...",
  "next_review_date": "2025-10-20T10:00:00Z",
  "ease_factor": 2.5,
  "feedback": null,
  "feedback_timestamp": null,
  "created_at": "2025-10-19T10:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid flashcardId format
- `401 Unauthorized` - User not authenticated
- `403 Forbidden` - Flashcard's project doesn't belong to authenticated user
- `404 Not Found` - Flashcard not found
- `500 Internal Server Error` - AI service error or database error
- `503 Service Unavailable` - AI service temporarily unavailable

---

## 5. Data Flow

### AI Flashcard Generation Flow

```
Client Request
    ↓
[1] API Endpoint (/api/projects/{projectId}/flashcards/ai-generate.ts)
    ↓
[2] Validate Request (Zod Schema)
    ├─→ Invalid → Return 400 with validation errors
    └─→ Valid
        ↓
[3] Authenticate User (via context.locals.supabase)
    ├─→ Not authenticated → Return 401
    └─→ Authenticated
        ↓
[4] Verify Project Ownership (Database Query)
    ├─→ Not found → Return 404
    ├─→ Not owned by user → Return 403
    └─→ Authorized
        ↓
[5] Call AI Service (src/lib/services/flashcard-ai.service.ts)
    ├─→ AI Error → Return 500 or 503
    └─→ Success
        ↓
[6] Parse AI Response to FlashcardDraft[]
    ↓
[7] Return 200 OK with GenerateFlashcardsResponseDto
    ↓
Client Receives Drafts
```

### Flashcard Regeneration Flow

```
Client Request
    ↓
[1] API Endpoint (/api/flashcards/{flashcardId}/regenerate.ts)
    ↓
[2] Validate flashcardId (UUID format)
    ├─→ Invalid → Return 400
    └─→ Valid
        ↓
[3] Authenticate User (via context.locals.supabase)
    ├─→ Not authenticated → Return 401
    └─→ Authenticated
        ↓
[4] Fetch Flashcard from Database (with project relation)
    ├─→ Not found → Return 404
    └─→ Found
        ↓
[5] Verify Project Ownership
    ├─→ Not owned by user → Return 403
    └─→ Authorized
        ↓
[6] Call AI Service to Regenerate (with existing content as context)
    ├─→ AI Error → Return 500 or 503
    └─→ Success
        ↓
[7] Update Flashcard in Database (front & back only)
    ├─→ Database Error → Return 500
    └─→ Success
        ↓
[8] Return 200 OK with FlashcardDto
    ↓
Client Receives Updated Flashcard
```

---

## 6. Security Considerations

### Authentication & Authorization

1. **Session Validation**
   - Extract session from Supabase auth using `context.locals.supabase.auth.getSession()`
   - Reject requests without valid session (401 Unauthorized)
   - Verify session hasn't expired

2. **Project Ownership Verification**
   - For AI generation: Query `projects` table to verify `user_id` matches authenticated user
   - Use Supabase RLS policies to automatically filter by user_id

3. **Flashcard Ownership Verification**
   - For regeneration: Query flashcard with JOIN to projects table
   - Verify project's `user_id` matches authenticated user
   - Use Supabase RLS policies for additional security layer

### Input Validation & Sanitization

1. **UUID Validation**
   - Validate all UUID parameters using Zod's `.uuid()` validator
   - Prevents SQL injection and enumeration attacks
   - Returns 400 Bad Request for malformed UUIDs

2. **Text Input Sanitization**
   - Enforce strict length limits (50-10,000 chars)
   - Validate UTF-8 encoding
   - Consider stripping potentially dangerous characters
   - HTML encode if displaying back to users

3. **Numeric Input Validation**
   - Validate `desired_count` is positive integer
   - Enforce reasonable limits (1-50) to prevent resource abuse
   - Check for NaN and infinity values

### Rate Limiting (Recommended but not implemented in this plan)

1. **Request Throttling**
   - Consider implementing rate limiting per user (e.g., 10 requests/hour)
   - AI generation is expensive; protect against abuse
   - Use Redis or similar for distributed rate limiting

2. **Cost Control**
   - Monitor AI API usage per user
   - Implement usage quotas for free tier users
   - Log all AI service calls for billing/auditing

### Data Privacy

1. **User Data Isolation**
   - Ensure users can only access their own projects and flashcards
   - Never expose other users' data in error messages
   - Use Supabase RLS policies as defense-in-depth

2. **Error Message Sanitization**
   - Don't expose internal error details in production
   - Don't reveal system architecture in error messages
   - Log full errors server-side for debugging

3. **AI Service Data Handling**
   - Ensure AI provider's data handling complies with privacy policies
   - Consider anonymizing data sent to AI service
   - Review AI provider's data retention policies

---

## 7. Error Handling

### Validation Errors (400 Bad Request)

**Scenario 1: Invalid Request Body**
```typescript
// Missing or invalid fields
{
  "error": "Validation Error",
  "message": "Invalid request body",
  "statusCode": 400,
  "details": {
    "fields": {
      "text": ["Text must be at least 50 characters"],
      "desired_count": ["Must be a number between 1 and 50"]
    }
  }
}
```

**Scenario 2: Invalid UUID Format**
```typescript
{
  "error": "Validation Error",
  "message": "Invalid project ID format",
  "statusCode": 400
}
```

**Scenario 3: Text Length Violation**
```typescript
{
  "error": "Validation Error",
  "message": "Text exceeds maximum length of 10,000 characters",
  "statusCode": 400
}
```

### Authentication Errors (401 Unauthorized)

**Scenario: No Valid Session**
```typescript
{
  "error": "Unauthorized",
  "message": "Authentication required",
  "statusCode": 401
}
```

### Authorization Errors (403 Forbidden)

**Scenario: Project Not Owned by User**
```typescript
{
  "error": "Forbidden",
  "message": "You do not have access to this project",
  "statusCode": 403
}
```

### Not Found Errors (404 Not Found)

**Scenario 1: Project Not Found**
```typescript
{
  "error": "Not Found",
  "message": "Project not found",
  "statusCode": 404
}
```

**Scenario 2: Flashcard Not Found**
```typescript
{
  "error": "Not Found",
  "message": "Flashcard not found",
  "statusCode": 404
}
```

### Server Errors (500 Internal Server Error)

**Scenario 1: AI Service Error**
```typescript
{
  "error": "Internal Server Error",
  "message": "Failed to generate flashcards",
  "statusCode": 500
}
// Server-side log should contain full AI error details
```

**Scenario 2: Database Error**
```typescript
{
  "error": "Internal Server Error",
  "message": "Database operation failed",
  "statusCode": 500
}
// Server-side log should contain full database error
```

### Service Unavailable (503 Service Unavailable)

**Scenario: AI Service Down**
```typescript
{
  "error": "Service Unavailable",
  "message": "AI service is temporarily unavailable",
  "statusCode": 503
}
```

### Error Handling Implementation Pattern

```typescript
try {
  // Validation
  const validatedData = schema.parse(requestBody);
  
  // Authentication
  const session = await supabase.auth.getSession();
  if (!session) {
    return new Response(JSON.stringify({
      error: "Unauthorized",
      message: "Authentication required",
      statusCode: 401
    }), { status: 401 });
  }
  
  // Authorization & business logic
  // ...
  
} catch (error) {
  if (error instanceof z.ZodError) {
    // Handle validation errors (400)
  } else if (error instanceof AIServiceError) {
    // Handle AI service errors (500/503)
  } else {
    // Handle unexpected errors (500)
    console.error("Unexpected error:", error);
    return new Response(JSON.stringify({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500
    }), { status: 500 });
  }
}
```

---

## 8. Performance Considerations

### Potential Bottlenecks

1. **AI Service Latency**
   - **Issue:** AI API calls can take 5-30 seconds
   - **Impact:** Slow response times, potential timeouts
   - **Mitigation:**
     - Set appropriate timeout values (30-60 seconds)
     - Consider implementing request queuing for high load
     - Show loading indicators on frontend
     - Future: Consider streaming responses

2. **Database Queries**
   - **Issue:** Multiple queries for authorization checks
   - **Impact:** Added latency, connection pool usage
   - **Mitigation:**
     - Use JOINs to reduce query count
     - Leverage Supabase RLS policies for combined auth/query
     - Index foreign keys (project_id, user_id)

3. **Large Text Processing**
   - **Issue:** 10,000 character texts in request body
   - **Impact:** Memory usage, parsing time
   - **Mitigation:**
     - Enforce strict content-length limits at middleware level
     - Stream request body parsing for large payloads
     - Validate length early in the request pipeline

### Optimization Strategies

1. **Caching Considerations**
   - **Not Recommended:** Caching AI responses (each generation should be unique)
   - **Recommended:** Cache project ownership checks (with short TTL)
   - **Recommended:** Cache user session data (if using JWT)

2. **Connection Pooling**
   - Use Supabase client connection pooling
   - Reuse Supabase client instance from `context.locals`
   - Don't create new clients per request

3. **Timeout Configuration**
   ```typescript
   // AI Service timeout
   const AI_TIMEOUT = 60000; // 60 seconds
   
   // Database query timeout
   const DB_TIMEOUT = 5000; // 5 seconds
   
   // Overall request timeout
   const REQUEST_TIMEOUT = 70000; // 70 seconds
   ```

4. **Payload Size Limits**
   - Enforce at middleware level
   - Set Content-Length header validation
   - Reject oversized requests early

5. **Database Query Optimization**
   ```sql
   -- Ensure indexes exist
   CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
   CREATE INDEX IF NOT EXISTS idx_flashcards_project_id ON flashcards(project_id);
   
   -- Use selective queries
   SELECT f.*, p.user_id 
   FROM flashcards f
   JOIN projects p ON f.project_id = p.id
   WHERE f.id = $1 AND p.user_id = $2;
   ```

6. **Response Size Management**
   - Draft flashcards are lightweight (< 700 chars each)
   - 50 flashcards × 700 chars = ~35KB (acceptable)
   - Enable gzip compression at server level

### Monitoring & Metrics

1. **Key Metrics to Track**
   - AI service response times (p50, p95, p99)
   - Endpoint response times
   - Error rates by type (validation, auth, AI, database)
   - AI service failures and retries
   - Request volume per user

2. **Alerting Thresholds**
   - AI service response time > 30 seconds
   - Error rate > 5%
   - AI service availability < 95%

---

## 9. Implementation Steps

### Phase 1: Setup and Configuration

**Step 1.1: Configure Environment Variables**
- Add AI service API keys to `.env`
  ```env
  OPENAI_API_KEY=sk-...
  OPENAI_MODEL=gpt-4o-mini
  OPENAI_API_URL=https://api.openai.com/v1
  ```
- Update `src/env.d.ts` to include new environment variables
- Document required environment variables in README

**Step 1.2: Install Dependencies**
```powershell
npm install openai zod
npm install -D @types/node
```

**Step 1.3: Create Directory Structure**
- Create `src/pages/api/projects/[projectId]/` directory
- Create `src/pages/api/flashcards/[flashcardId]/` directory
- Create `src/lib/services/` directory
- Create `src/lib/validators/` directory

### Phase 2: Service Layer Implementation

**Step 2.1: Create AI Service (`src/lib/services/flashcard-ai.service.ts`)**

```typescript
import OpenAI from 'openai';
import type { FlashcardDraft } from '../../types';

export class FlashcardAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: import.meta.env.OPENAI_API_KEY,
    });
  }

  async generateFlashcards(
    text: string,
    desiredCount: number
  ): Promise<FlashcardDraft[]> {
    // Implementation with prompt engineering
  }

  async regenerateFlashcard(
    currentFront: string,
    currentBack: string
  ): Promise<FlashcardDraft> {
    // Implementation for single flashcard regeneration
  }
}
```

**Key Implementation Details:**
- Design prompts for flashcard generation
- Parse JSON responses from AI
- Handle AI errors (rate limits, API errors)
- Validate AI response structure
- Ensure front/back character limits
- Handle cases where AI returns fewer cards than requested

**Step 2.2: Create Error Classes**

```typescript
// src/lib/errors/ai-service.error.ts
export class AIServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'AIServiceError';
  }
}

export class AIServiceUnavailableError extends AIServiceError {
  constructor(message: string = 'AI service temporarily unavailable') {
    super(message, 503);
    this.name = 'AIServiceUnavailableError';
  }
}
```

### Phase 3: Validation Layer

**Step 3.1: Create Zod Schemas (`src/lib/validators/flashcard.validators.ts`)**

```typescript
import { z } from 'zod';

export const UuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

export const GenerateFlashcardsSchema = z.object({
  text: z.string()
    .min(50, 'Text must be at least 50 characters')
    .max(10000, 'Text must not exceed 10,000 characters'),
  desired_count: z.number()
    .int('Desired count must be an integer')
    .min(1, 'Desired count must be at least 1')
    .max(50, 'Desired count must not exceed 50')
});

export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsSchema>;
```

### Phase 4: API Endpoint Implementation

**Step 4.1: Implement AI Generation Endpoint**

Create: `src/pages/api/projects/[projectId]/flashcards/ai-generate.ts`

```typescript
import type { APIRoute } from 'astro';
import { GenerateFlashcardsSchema, UuidSchema } from '../../../../lib/validators/flashcard.validators';
import { FlashcardAIService } from '../../../../lib/services/flashcard-ai.service';
import type { GenerateFlashcardsResponseDto, ErrorResponseDto } from '../../../../types';
import { z } from 'zod';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    // 1. Validate projectId
    const projectId = UuidSchema.parse(context.params.projectId);

    // 2. Authenticate user
    const { data: { session }, error: authError } = 
      await context.locals.supabase.auth.getSession();
    
    if (authError || !session) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401
      } as ErrorResponseDto), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Parse and validate request body
    const body = await context.request.json();
    const validatedInput = GenerateFlashcardsSchema.parse(body);

    // 4. Verify project ownership
    const { data: project, error: projectError } = 
      await context.locals.supabase
        .from('projects')
        .select('id, user_id')
        .eq('id', projectId)
        .eq('user_id', session.user.id)
        .single();

    if (projectError || !project) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Project not found',
        statusCode: 404
      } as ErrorResponseDto), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Call AI service
    const aiService = new FlashcardAIService();
    const drafts = await aiService.generateFlashcards(
      validatedInput.text,
      validatedInput.desired_count
    );

    // 6. Return response
    const response: GenerateFlashcardsResponseDto = { drafts };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Error handling implementation
    // (see Error Handling section for details)
  }
};
```

**Step 4.2: Implement Regenerate Endpoint**

Create: `src/pages/api/flashcards/[flashcardId]/regenerate.ts`

```typescript
import type { APIRoute } from 'astro';
import { UuidSchema } from '../../../lib/validators/flashcard.validators';
import { FlashcardAIService } from '../../../lib/services/flashcard-ai.service';
import type { FlashcardDto, ErrorResponseDto } from '../../../types';
import { z } from 'zod';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  try {
    // 1. Validate flashcardId
    const flashcardId = UuidSchema.parse(context.params.flashcardId);

    // 2. Authenticate user
    const { data: { session }, error: authError } = 
      await context.locals.supabase.auth.getSession();
    
    if (authError || !session) {
      return new Response(JSON.stringify({
        error: 'Unauthorized',
        message: 'Authentication required',
        statusCode: 401
      } as ErrorResponseDto), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Fetch flashcard with project ownership check
    const { data: flashcard, error: fetchError } = 
      await context.locals.supabase
        .from('flashcards')
        .select(`
          *,
          projects!inner(user_id)
        `)
        .eq('id', flashcardId)
        .eq('projects.user_id', session.user.id)
        .single();

    if (fetchError || !flashcard) {
      return new Response(JSON.stringify({
        error: 'Not Found',
        message: 'Flashcard not found',
        statusCode: 404
      } as ErrorResponseDto), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. Call AI service to regenerate
    const aiService = new FlashcardAIService();
    const regenerated = await aiService.regenerateFlashcard(
      flashcard.front,
      flashcard.back
    );

    // 5. Update flashcard in database
    const { data: updatedFlashcard, error: updateError } = 
      await context.locals.supabase
        .from('flashcards')
        .update({
          front: regenerated.front,
          back: regenerated.back
        })
        .eq('id', flashcardId)
        .select()
        .single();

    if (updateError || !updatedFlashcard) {
      console.error('Failed to update flashcard:', updateError);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: 'Failed to update flashcard',
        statusCode: 500
      } as ErrorResponseDto), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. Return updated flashcard
    return new Response(JSON.stringify(updatedFlashcard as FlashcardDto), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    // Error handling implementation
    // (see Error Handling section for details)
  }
};
```

### Phase 5: Error Handling Implementation

**Step 5.1: Create Centralized Error Handler**

```typescript
// src/lib/utils/error-handler.ts
import { z } from 'zod';
import { AIServiceError, AIServiceUnavailableError } from '../errors/ai-service.error';
import type { ErrorResponseDto, ValidationErrorResponseDto } from '../../types';

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  // Validation errors
  if (error instanceof z.ZodError) {
    const fields: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!fields[path]) fields[path] = [];
      fields[path].push(err.message);
    });

    const response: ValidationErrorResponseDto = {
      error: 'Validation Error',
      message: 'Invalid request data',
      statusCode: 400,
      details: { fields }
    };

    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // AI Service errors
  if (error instanceof AIServiceUnavailableError) {
    const response: ErrorResponseDto = {
      error: 'Service Unavailable',
      message: error.message,
      statusCode: 503
    };

    return new Response(JSON.stringify(response), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (error instanceof AIServiceError) {
    const response: ErrorResponseDto = {
      error: 'Internal Server Error',
      message: 'Failed to process AI request',
      statusCode: 500
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Default error
  const response: ErrorResponseDto = {
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500
  };

  return new Response(JSON.stringify(response), {
    status: 500,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Step 5.2: Integrate Error Handler in Endpoints**
- Replace catch blocks with `return handleAPIError(error);`

### Phase 6: Testing

**Step 6.1: Unit Tests**
- Test `FlashcardAIService` with mocked OpenAI client
- Test validation schemas with valid/invalid inputs
- Test error handler with different error types

**Step 6.2: Integration Tests**
- Test full endpoint flows with test database
- Test authentication and authorization
- Test AI service integration (with real or mocked API)

**Step 6.3: Manual Testing Checklist**
- [ ] Test AI generation with valid input
- [ ] Test AI generation with text too short
- [ ] Test AI generation with text too long
- [ ] Test AI generation with invalid desired_count
- [ ] Test AI generation without authentication
- [ ] Test AI generation for non-existent project
- [ ] Test AI generation for other user's project
- [ ] Test regeneration with valid flashcard
- [ ] Test regeneration without authentication
- [ ] Test regeneration for non-existent flashcard
- [ ] Test regeneration for other user's flashcard
- [ ] Test error responses have correct structure
- [ ] Test response times within acceptable limits

### Phase 7: Documentation

**Step 7.1: Update API Documentation**
- Document both endpoints with examples
- Include error response examples
- Document authentication requirements
- Add rate limiting information (if implemented)

**Step 7.2: Update Environment Variables Documentation**
- Add required AI service configuration to README
- Document optional configuration values
- Provide setup instructions for AI service

**Step 7.3: Add Code Comments**
- Document AI service prompts and their design rationale
- Comment complex authorization logic
- Add JSDoc comments to public functions

### Phase 8: Deployment Preparation

**Step 8.1: Environment Configuration**
- Set up production AI API keys
- Configure appropriate timeout values
- Set up monitoring and logging

**Step 8.2: Security Review**
- Review RLS policies on `projects` and `flashcards` tables
- Verify all inputs are validated
- Check error messages don't leak sensitive information
- Verify authentication on all endpoints

**Step 8.3: Performance Testing**
- Load test with multiple concurrent requests
- Test with maximum text length (10,000 chars)
- Test with maximum desired_count (50 cards)
- Verify timeout handling

**Step 8.4: Monitoring Setup**
- Set up logging for AI service calls
- Configure error alerting
- Monitor response times
- Track AI API usage and costs

---

## 10. Additional Notes

### AI Prompt Engineering

The quality of generated flashcards depends heavily on prompt design. Consider:

1. **System Prompt Structure:**
   ```
   You are an expert educational content creator specializing in flashcards.
   Create clear, concise flashcards that test understanding, not memorization.
   Follow these rules:
   - Questions (front) must be clear and specific (max 200 chars)
   - Answers (back) must be complete but concise (max 500 chars)
   - Avoid yes/no questions
   - Use active voice
   - Return valid JSON only
   ```

2. **User Prompt Format:**
   ```
   Generate {desired_count} flashcards from the following text:
   
   {text}
   
   Return as JSON array: [{"front": "...", "back": "..."}]
   ```

3. **Regeneration Prompt:**
   ```
   Improve this flashcard while keeping the same topic:
   Current front: {front}
   Current back: {back}
   
   Return improved version as JSON: {"front": "...", "back": "..."}
   ```

### Future Enhancements

1. **Streaming Responses:** Use Server-Sent Events for real-time card generation
2. **Batch Operations:** Allow saving multiple drafts in one request
3. **Card Templates:** Support different flashcard formats (cloze deletion, multiple choice)
4. **Quality Scoring:** AI evaluates card quality before returning
5. **Translation:** Generate flashcards in multiple languages
6. **Image Support:** Include images in flashcard generation

### Dependencies

Required npm packages:
- `openai` - OpenAI API client
- `zod` - Schema validation
- `@supabase/supabase-js` - Already installed
- `astro` - Already installed

Optional packages for future enhancements:
- `eventsource-parser` - For streaming responses
- `rate-limiter-flexible` - For rate limiting
- `sharp` - For image processing
