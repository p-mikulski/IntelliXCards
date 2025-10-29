# Test Plan for Project "10x Anki"

---

### 1. Introduction and Testing Objectives

This document outlines the comprehensive testing strategy for the "10x Anki" project, a web-based application for creating and studying flashcards, with a key feature of AI-powered flashcard generation.

The primary objectives of this test plan are:
- **Ensure Functionality:** Verify that all features, from user authentication to AI-based flashcard generation, work as specified.
- **Guarantee Reliability:** Confirm the application is stable, handles errors gracefully, and performs consistently under expected user loads.
- **Validate Security:** Ensure that user data is secure, and users can only access their own information, leveraging Supabase's Row Level Security (RLS).
- **Confirm Usability:** Verify that the user interface is intuitive, responsive, and provides a positive user experience across supported devices.
- **Maintain Code Quality:** Establish a testing framework that supports continuous integration and prevents regressions.

---

### 2. Scope of Testing

#### In Scope:
- **User Authentication:** Registration, login, password recovery, and session management.
- **Dashboard & Project Management:** Creating, viewing, editing, and deleting projects.
- **Flashcard Management (CRUD):** All create, read, update, and delete operations for flashcards within a project.
- **AI Flashcard Generation:** The entire workflow, from text input to the creation of flashcards, including input validation and error handling.
- **Study Sessions:** The flashcard study interface, including recall scoring and session progress.
- **API Endpoints:** All backend API routes for data manipulation and retrieval.
- **Security:** User data isolation and access control (RLS policies).
- **UI/UX:** Responsiveness, cross-browser compatibility, and overall user experience.

#### Out of Scope:
- Third-party integrations beyond the direct scope of the application (e.g., the internal workings of the AI model provider).
- Performance stress testing beyond expected normal usage patterns.
- Usability testing with a broad external user group (this plan focuses on QA-led testing).

---

### 3. Types of Tests to be Conducted

A multi-layered testing approach will be adopted to ensure comprehensive coverage:

- **Unit Tests:** To test individual functions, React components, and custom hooks in isolation. This will focus on business logic within services and UI components.
- **Integration Tests:** To test the interaction between different parts of the application, such as a React component calling a service, which in turn queries the database. This is crucial for validating the Astro (backend) and React (frontend) integration.
- **End-to-End (E2E) Tests:** To simulate real user scenarios from start to finish. These tests will cover critical user flows like registering, creating a project, generating flashcards with AI, and starting a study session.
- **API Tests:** To directly test the API endpoints for correctness, error handling, and security. This will be done independently of the frontend UI.
- **Security Tests:** To verify authentication middleware and Supabase RLS policies, ensuring users cannot access or modify data that does not belong to them.
- **Manual & Exploratory Tests:** To identify issues not easily caught by automated tests, focusing on usability, visual consistency, and edge cases.

---

### 4. Test Scenarios for Key Functionalities

#### 4.1 User Authentication
- **Scenario:** A new user registers, logs in, and logs out.
- **Scenario:** An existing user logs in successfully.
- **Scenario:** A user attempts to log in with incorrect credentials.
- **Scenario:** A user who is not logged in attempts to access the dashboard and is redirected to the login page.

#### 4.2 Project Management
- **Scenario:** A logged-in user creates a new project from the dashboard.
- **Scenario:** A user edits the name and description of an existing project.
- **Scenario:** A user deletes a project and confirms all associated flashcards are also deleted.
- **Scenario:** The dashboard correctly displays a list of projects belonging only to the logged-in user.

#### 4.3 AI Flashcard Generation
- **Scenario:** A user navigates to the AI generation page, inputs a block of text, specifies the number of flashcards, and successfully generates them.
- **Scenario:** The system displays a validation error if the input text is too long or empty.
- **Scenario:** The system displays a validation error if the requested number of flashcards is outside the allowed range (e.g., 1-50).
- **Scenario:** The UI correctly shows a loading/generating state while the AI is processing and disables the form.

#### 4.4 Study Session
- **Scenario:** A user starts a study session for a project with existing flashcards.
- **Scenario:** The user cycles through flashcards, reveals the answer, and provides feedback on their recall ability.
- **Scenario:** The session progress bar updates correctly as the user reviews cards.

---

### 5. Test Environment

- **CI/CD Environment:** GitHub Actions will be used to run automated tests (Unit, Integration, API) on every push and pull request to the `master` branch.
- **Staging Environment:** A separate Supabase project and Vercel/Netlify deployment mirroring the production setup. This environment will be used for running E2E tests and for manual exploratory testing before deploying to production.
- **Local Development:** Developers will run tests locally before pushing code. The testing framework will be configured to connect to a local or shared dev instance of Supabase.

---

### 6. Testing Tools

- **Unit & Integration Testing:** **Vitest** with **React Testing Library**. Vitest is a modern, fast test runner compatible with Vite-based projects like Astro.
- **End-to-End Testing:** **Playwright**. It provides reliable E2E testing across modern browsers and is excellent for testing interactive applications.
- **API Testing:** **Postman** or **Thunder Client** (VS Code extension) for manual API endpoint testing. Automated API tests can be written within the Vitest or Playwright frameworks.
- **Linting:** **ESLint** will be used for static code analysis to catch potential issues early.

---

### 7. Test Schedule

Testing will be an integral part of the development lifecycle, not a separate phase.

- **Continuous Testing:** Automated unit, integration, and API tests will run on every pull request. A PR cannot be merged if tests fail.
- **Sprint-Based E2E & Manual Testing:** At the end of each development sprint (or before a major release), a full regression suite of E2E tests and manual exploratory testing will be performed on the staging environment.
- **Release:** A release to production will only occur after all tests on staging have passed and any critical bugs have been fixed.

---

### 8. Test Acceptance Criteria

- **Code Coverage:** A minimum of 80% code coverage for unit and integration tests on critical business logic (services, hooks).
- **Passing Tests:** 100% of all automated tests (Unit, Integration, E2E) must pass for a build to be considered for deployment.
- **No Critical Bugs:** No open bugs of "Critical" or "High" severity related to the features being released.
- **Manual Test Sign-off:** A QA engineer must manually verify the core user flows and sign off on the release.

---

### 9. Roles and Responsibilities

- **Developers:** Responsible for writing unit and integration tests for the code they produce. They must ensure all tests pass locally before creating a pull request.
- **QA Engineer:** Responsible for creating and maintaining the E2E test suite, performing manual and exploratory testing, defining test scenarios, and reporting bugs. The QA engineer has the final say on whether a build meets the quality standards for release.
- **DevOps/Team Lead:** Responsible for setting up and maintaining the CI/CD pipeline and testing environments.

---

### 10. Bug Reporting Procedures

- **Bug Tracking System:** All bugs will be tracked as issues in the project's GitHub repository.
- **Bug Report Template:** A standardized template will be used for all bug reports, including:
    - **Title:** A clear, concise summary of the bug.
    - **Environment:** (e.g., Browser, OS, Staging/Production).
    - **Steps to Reproduce:** Detailed, numbered steps that consistently reproduce the bug.
    - **Expected Result:** What should have happened.
    - **Actual Result:** What actually happened.
    - **Severity:** (Critical, High, Medium, Low).
    - **Screenshots/Videos:** Attached to provide visual context.
- **Triage:** New bugs will be triaged daily to assess their priority and assign them to the appropriate developer.
