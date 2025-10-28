# Authentication Architecture Specification

## 1. Scope
- Covers registration (US-001), login (US-002), logout (US-003), and password recovery aligned with IntelliXCards MVP goals.
- Preserves existing Astro 5 + React 19 structure, Tailwind 4 styling strategy, and Supabase backend integration.

---

## 2. User Interface Architecture

### 2.1 Layout Strategy
- **`src/layouts/AuthLayout.astro` (new)**  
  - Minimal shell with brand header, body slot, and footer links to legal/support pages.  
  - Manages `<html>` class toggles for Tailwind dark mode parity with main layout.  
  - Uses `<ViewTransitions>` via ClientRouter to align with project transitions.
- **`src/layouts/MainLayout.astro` (existing to extend)**  
  - Expose navigation slot for auth-aware header.  
  - Injects authenticated user context (from middleware) into nav component via Astro props.

### 2.2 Pages
- **Public routes (new Astro pages)**  
  - `src/pages/auth/register.astro`  
  - `src/pages/auth/login.astro`  
  - `src/pages/auth/recovery.astro` (password reset request)  
  - Each page:
    - Imports `AuthLayout.astro`.  
    - Pulls `supabase = Astro.locals.supabase`. If session exists, performs server-side redirect to `/app` (dashboard).  
    - Renders metadata for SEO/accessibility.
- **Authenticated views (existing or future)**  
  - `src/pages/app/index.astro` (dashboard) receives `session` from locals; if absent, middleware handles redirect (see §3.5).  
  - Logout handled client-side via nav action + API endpoint; no dedicated page required.

### 2.3 Components
- **React form shells (new, placed in `src/components/auth`)**  
  - `RegisterForm.tsx`  
  - `LoginForm.tsx`  
  - `RecoveryForm.tsx`  
  - Shared subcomponents: `AuthFormHeader.tsx`, `PasswordStrengthMeter.tsx`, `AuthStatusMessage.tsx`.  
  - Responsibilities:
    - Controlled inputs, client-side validation (mirrors server Zod schemas).  
    - Submits via `fetch` to Astro API endpoints (`/api/auth/...`).  
    - Handles pending state, success/error toasts (Astro passes Shadcn/ui `useToast` provider).  
    - Emits `onSuccess` callback to trigger navigation using `Astro.redirect` through location change.
- **Navigation updates**  
  - `src/components/navigation/AppNav.astro` (extend)  
    - Accesses `Astro.props.session` to toggle links: shows “Login/Register” when unauthenticated; shows user menu with “Logout” when authenticated.  
    - “Logout” button triggers POST `/api/auth/logout` via small fetch helper.
- **Form vs Astro separation**  
  - Astro pages manage SSR state (session, redirect, CSRF token injection).  
  - React components render dynamic form UI, run optimistic validation, and call backend.

### 2.4 Validation & Error UX
- **Field rules (client + server)**  
  - Email: required, RFC 5322 basic regex, trimmed, max 254 chars.  
  - Password (register): min 8 chars, max 64, requires at least one letter and number; display strength meter.  
  - Password (login): required.  
  - Password recovery email: same as email rule.
- **Error messaging**  
  - Inline field errors shown beneath inputs (aria-live=polite).  
  - Top-level alert for submission errors (`AuthStatusMessage`), e.g.  
    - Registration: “Email already registered. Try logging in or reset your password.”  
    - Login: “Incorrect email or password.”  
    - Recovery: “If an account exists, a reset link was sent.” (to avoid user enumeration).
- **Accessibility**  
  - Forms use `<form>` semantics, `aria-describedBy` linking to hint/error text.  
  - Buttons include `aria-busy` during submission.  
  - `AuthLayout` sets main landmark for content.

### 2.5 Scenario Handling
| Scenario | UI Flow |
| --- | --- |
| Successful registration | Form sends POST `/api/auth/register` → on 200 returns session → React calls `window.location.href = "/app"`; toast “Account created”. |
| Duplicate email | API returns 409 with structured error → React surfaces message, keeps form values. |
| Invalid inputs | Client prevents submit; if server detects, returns 422 with error map consumed by form. |
| Login success | POST `/api/auth/login` → redirect to `/app`. |
| Wrong credentials | API 401; message displayed, password field cleared. |
| Logout | POST `/api/auth/logout` from nav → nav updates using custom hook `useSupabaseSession` (React context). |
| Recovery request | POST `/api/auth/recovery` → success banner encouraging email check. |

---

## 3. Backend Logic

### 3.1 Endpoint Structure (`src/pages/api/auth/*`)
- **`register.ts` (POST)**  
  - Accepts JSON `{ email, password }`.  
  - Validates via Zod (`registerSchema`).  
  - Uses `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`.  
  - On success, upserts profile entry in `profiles` table (future analytics).  
  - Returns `201` with `{ session }` or `202` when email confirmation required (Supabase setting dependent).
- **`login.ts` (POST)**  
  - `{ email, password }` → `supabase.auth.signInWithPassword`.  
  - Stores session via helper (see §4). Returns 200 + minimal user payload.
- **`logout.ts` (POST)**  
  - Reads session from cookie; calls `supabase.auth.signOut()`; clears cookie. Responds 200.
- **`recovery.ts` (POST)**  
  - `{ email }` validated; calls `supabase.auth.resetPasswordForEmail(email, { redirectTo })`.  
  - Always returns 202 regardless of account existence.
- All endpoints export `export const prerender = false;` per project rule.

### 3.2 Data Models
- Update `src/types.ts` with:
  - `AuthCredentials` (`email`, `password`).  
  - `AuthSession` (subset of Supabase session data needed client-side: `access_token`, `expires_in`, `user`).  
  - `AuthErrorResponse` (`code`, `message`, `fields?`).
- Add Supabase profile type if not existing, ensuring compatibility with Supabase generated types.

### 3.3 Validation Pipeline
- Place Zod schemas in `src/lib/validation/auth.ts`:
  - `registerSchema`, `loginSchema`, `recoverySchema`.  
  - Expose error enums for consistent messaging.  
  - Use `.superRefine` to enforce password complexity.
- Endpoints call `safeParse`. On failure, respond `422` with `fields` map keyed by field name.

### 3.4 Exception Handling
- Wrap Supabase calls in `try/catch`.  
- Translate Supabase errors:
  - 400-series from Supabase → map to user-friendly messages.  
  - Unknown errors → log with contextual metadata (`console.error` or future logger) and return `500` with generic error.  
- Include correlation ID header (generate via nanoid) so client logs can reference server logs.

### 3.5 SSR & Middleware
- Extend `src/middleware/index.ts`:
  - Initialize Supabase with `createSupabaseServerClient`.  
  - Attach `locals.supabase`, `locals.session`.  
  - Implement guard: for routes under `/app/**`, redirect to `/auth/login` if no session.  
  - For `/auth/**`, redirect to `/app` if session exists.  
  - Ensure middleware respects existing page behaviors (e.g., static public pages bypass).  
- Because `astro.config.mjs` uses Node adapter in standalone mode, maintain server output. Confirm middleware is registered via default export function.

---

## 4. Authentication System

### 4.1 Supabase Integration
- Maintain Supabase client factory in `src/db/supabase.client.ts` returning typed `SupabaseClient`.  
- Middleware obtains session using `supabase.auth.getSession()` and attaches to locals.  
- API routes retrieve `{ supabase } = Astro.locals` instead of creating new clients.

### 4.2 Session Persistence
- Use Supabase helper to set auth cookies (`setAuthCookies` equivalent).  
- When receiving session from register/login response, call `setSession` to refresh cookies.  
- Configure cookie options: `Secure` (honor `Astro.request.url` scheme), `SameSite=Lax`, `HttpOnly`, `Path=/`.

### 4.3 Logout Flow
- API `logout.ts` calls `supabase.auth.signOut({ scope: 'global' })`.  
- Clears auth cookies via `supabase.auth.setSession(null)` or manual cookie deletion.  
- Client receives 200 and triggers UI update (e.g., `sessionContext.clear()`).

### 4.4 Password Recovery
- **Request phase** handled by `/api/auth/recovery`.  
- **Reset UI** (optional future)  
  - When Supabase redirect hits `src/pages/auth/reset.astro`, provide React form to set new password using `supabase.auth.updateUser({ password })`.  
  - For current specification, include placeholder planning to avoid broken link.
- Ensure redirect URL added to Supabase dashboard settings.

### 4.5 Security Considerations
- Throttle form submissions client-side (disable button for debounce) and server-side (future rate limiting via middleware).  
- Avoid user enumeration with neutral recovery responses.  
- Log only non-sensitive metadata; never echo passwords.  
- Enforce HTTPS in production via environment configuration.

---

## 5. Testing & Observability

- **Unit tests**  
  - Zod schemas tested in `src/lib/validation/__tests__/auth.test.ts`.  
  - React form components tested with Testing Library + Vitest (mock fetch).  
- **Integration tests**  
  - API endpoints tested via Astro’s testing harness using Supabase client mocks.  
- **Manual QA checklist**  
  - Register/login/logout flows, invalid inputs, network failure fallback (display “Service unavailable, please retry”).  
- **Telemetry hooks**  
  - Emit custom analytics events (future) on registration success to support KPI tracking.

---

## 6. Dependencies & Environment

- Ensure `.env` includes `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`.  
- Add `SUPABASE_SERVICE_ROLE_KEY` only for server-side use if needed (not for auth flows).  
- Update documentation in `.ai/prd.md` if new routes introduced for recovery.
