# Product Requirements Document (PRD) - IntelliXCards

## 1. Product Overview

IntelliXCards is a web-based learning tool designed to streamline the creation of flashcards using Artificial Intelligence. The application enables users to automatically generate high-quality flashcards from pasted text, significantly reducing the manual effort required for content creation. By integrating with a simple spaced repetition algorithm, IntelliXCards helps users leverage an effective study method without the typical time investment. The Minimum Viable Product (MVP) focuses on the core workflow: text input, AI-driven generation, manual refinement, and a basic study mode.

---

## 2. User Problem

Many learners, including students and professionals, understand the value of spaced repetition for long-term knowledge retention. However, a significant barrier to adopting this method is the time-consuming and tedious process of manually creating effective flashcards. This initial friction often discourages users from starting or consistently using spaced repetition systems, causing them to miss out on a powerful learning technique. IntelliXCards aims to solve this by automating the most labor-intensive part of the process.

---

## 3. Functional Requirements

### 3.1. User Account Management

- Users must be able to create an account, log in, and log out, delete and account with associated project / flashcards.
- Authentication and user data will be managed via Supabase.
- User sessions should be persistent.

### 3.2. Project (Deck) Management

- Users can create "Projects" which function as folders or decks for flashcards.
- Each project must have a title, an optional short description, creation date, and an optional tag.
- Users can view a list of all their projects on a main dashboard.
- Users can rename and delete existing projects. Deleting a project will also delete all associated flashcards.

### 3.3. AI Flashcard Generation

- Users can input plain text (up to 10,000 characters) into a text area.
- Users can specify the desired number of flashcards to be generated from the text.
- The AI will use a mix of summarization and extraction techniques to create flashcards.
- The AI can propose various flashcard types, including open-ended, fill-in-the-blank, and multiple-choice (without distractor options for the MVP).
- Generated flashcards will be presented to the user as drafts for review before being saved.
- The front of a flashcard is limited to 200 characters; the back is limited to 500 characters.

### 3.4. Flashcard Management (CRUD)

- Users can manually create new flashcards within a project.
- Users can view all flashcards within a project.
- Users can edit the content of any flashcard (both AI-generated and manually created).
- Users can delete individual flashcards.
- Users can regenerate a specific AI-generated flashcard. The new version will overwrite the old one without keeping a version history.

### 3.5. Review and Feedback

- AI-generated flashcards will have a "thumbs up/thumbs down" option for users to provide feedback on quality. This feedback is for internal analytics only and will not trigger a regeneration loop.
- A flashcard receiving a "thumbs up" is considered "accepted."

### 3.6. Spaced Repetition and Study Mode

- The application will integrate a ready-made, simple spaced repetition algorithm.
- Users can initiate a study session for any project.
- After a study session is complete, a summary review table will show the status of flashcards (e.g., done, new, upcoming, to learn).

### 3.7. Error Handling

- The UI must display a clear, user-friendly error message if AI generation fails (e.g., "Generation failed, please try again").

### 3.8. Analytics

- An internal, non-user-facing dashboard will be created to track key success metrics, specifically the AI flashcard acceptance rate.

---

## 4. Product Boundaries

### 4.1. In Scope for MVP

- User authentication and database management using Supabase.
- AI flashcard generation from plain text pasted by the user.
- Full CRUD functionality for flashcards and projects.
- Integration with a pre-built, simple spaced repetition algorithm.
- A web-only application built with Astro 5, TypeScript 5, React 19, and Tailwind 4.
- A linear and simple user interface.

### 4.2. Out of Scope for MVP

- Development of a proprietary, advanced repetition algorithm (e.g., SM-2).
- Importing content from various file formats (PDF, DOCX, etc.).
- Sharing projects or flashcard decks between users.
- Integrations with third-party educational platforms (e.g., LMS, note-taking apps).
- Native mobile applications for iOS or Android.
- Version history for edited or regenerated flashcards.

---

## 5. User Stories

### 5.1. Authentication

- ID: US-001
- Title: User Registration
- Description: As a new user, I want to create an account using my email and a password so that I can store my flashcards and access them later.
- Acceptance Criteria:
  1.  The registration form must require a valid email format and a password.
  2.  Password fields must have basic validation (e.g., minimum length).
  3.  Upon successful registration, the user is automatically logged in and redirected to the main dashboard.
  4.  An error message is shown if the email is already in use or if the input is invalid.

- ID: US-002
- Title: User Login
- Description: As a returning user, I want to log in with my email and password to access my projects and flashcards.
- Acceptance Criteria:
  1.  The login form must have fields for email and password.
  2.  Upon successful login, the user is redirected to their main project dashboard.
  3.  A clear error message is displayed for incorrect credentials.

- ID: US-003
- Title: User Logout
- Description: As a logged-in user, I want to be able to log out of my account to ensure my session is terminated securely.
- Acceptance Criteria:
  1.  A "Logout" button is available within the application's main navigation.
  2.  Clicking the "Logout" button terminates the user's session.
  3.  The user is redirected to the public-facing homepage or login page after logging out.

### 5.2. Project Management

- ID: US-004
- Title: Create a New Project
- Description: As a logged-in user, I want to create a new project to organize a set of related flashcards.
- Acceptance Criteria:
  1.  There is a "Create New Project" button on the dashboard.
  2.  The creation form requires a project title and allows for an optional description and tag.
  3.  Upon creation, the new project appears in my list of projects.
  4.  The creation date is automatically recorded and displayed.

- ID: US-005
- Title: View All Projects
- Description: As a logged-in user, I want to see a list of all my projects on a dashboard so I can easily navigate between them.
- Acceptance Criteria:
  1.  The dashboard displays all user-created projects in a list or grid format.
  2.  Each project entry displays its title, creation date, and tag.
  3.  Clicking on a project takes the user to that project's detail view.

- ID: US-006
- Title: Rename a Project
- Description: As a user, I want to rename an existing project to better reflect its contents.
- Acceptance Criteria:
  1.  An "Edit" or "Rename" option is available for each project in the list.
  2.  The user can change the project's title, description, and tag.
  3.  The changes are saved and reflected immediately in the project list.

- ID: US-007
- Title: Delete a Project
- Description: As a user, I want to delete a project I no longer need to keep my dashboard clean.
- Acceptance Criteria:
  1.  A "Delete" option is available for each project.
  2.  A confirmation modal appears to prevent accidental deletion.
  3.  Upon confirmation, the project and all its associated flashcards are permanently removed.

### 5.3. AI Flashcard Generation and Management

- ID: US-008
- Title: Initiate AI Flashcard Generation
- Description: As a user, I want to paste a block of text and specify how many flashcards I want, so the AI can generate them for me.
- Acceptance Criteria:
  1.  Inside a project, there is a clear entry point for AI generation.
  2.  The UI includes a text area that accepts up to 10,000 characters of plain text.
  3.  There is a number input field to specify the desired quantity of flashcards.
  4.  A "Generate" button starts the AI generation process.

- ID: US-009
- Title: Review and Edit Generated Flashcards
- Description: As a user, after the AI generates flashcards, I want to review them as drafts, edit their content, and decide which ones to keep.
- Acceptance Criteria:
  1.  The generated flashcards are displayed in a list view as editable drafts.
  2.  Each draft has editable fields for the front and back content.
  3.  Each draft has a "thumbs up" and "thumbs down" button for feedback.
  4.  Each draft has a "Regenerate" button and a "Delete" button.
  5.  A single "Save All" button persists all the visible drafts to the project.

- ID: US-010
- Title: Regenerate a Single AI Flashcard
- Description: As a user, if I am not satisfied with a specific AI-generated flashcard, I want to regenerate just that one card to get a better version.
- Acceptance Criteria:
  1.  Clicking the "Regenerate" button on a draft card sends a request to the AI.
  2.  The content of that specific card is replaced with the newly generated version.
  3.  The regeneration action does not affect any other cards in the draft list.

- ID: US-011
- Title: Provide Feedback on AI Flashcards
- Description: As a user, I want to give a thumbs up or thumbs down on each generated flashcard to mark its quality for my own reference and for system analytics.
- Acceptance Criteria:
  1.  Clicking "thumbs up" marks the card as "accepted" in the backend for analytics.
  2.  Clicking "thumbs down" marks the card as "rejected" for analytics.
  3.  The UI provides a clear visual indicator of which feedback option has been selected for each card.

### 5.4. Manual Flashcard Management

- ID: US-012
- Title: Create a Flashcard Manually
- Description: As a user, I want to manually create a new flashcard from scratch within a project.
- Acceptance Criteria:
  1.  Within a project view, there is a "Create Manual Card" button.
  2.  A form appears with fields for the "Front" and "Back" of the card.
  3.  Upon saving, the new card is added to the project's flashcard list.

- ID: US-013
- Title: Edit an Existing Flashcard
- Description: As a user, I want to edit the content of any saved flashcard in my project.
- Acceptance Criteria:
  1.  An "Edit" option is available on each flashcard in the project view.
  2.  Clicking "Edit" makes the front and back content fields editable.
  3.  Saving the changes updates the flashcard's content in the database.

- ID: US-014
- Title: Delete an Existing Flashcard
- Description: As a user, I want to delete a single flashcard that is no longer relevant or correct.
- Acceptance Criteria:
  1.  A "Delete" option is available on each flashcard.
  2.  A confirmation prompt is displayed to prevent accidental deletion.
  3.  Upon confirmation, the flashcard is permanently removed from the project.

### 5.5. Study and Review

- ID: US-015
- Title: Start a Study Session
- Description: As a user, I want to start a study session for a project to review my flashcards using the spaced repetition system.
- Acceptance Criteria:
  1.  A "Study" button is available on the project page.
  2.  The study session presents flashcards one by one according to the integrated algorithm.
  3.  The user can reveal the back of the card and provide feedback on their recall performance (e.g., "easy," "hard").

- ID: US-016
- Title: View Study Progress
- Description: As a user, after completing a study session, I want to see a simple overview of my progress.
- Acceptance Criteria:
  1.  After the session ends, a summary view is displayed.
  2.  The summary includes categories like "done," "new," "upcoming," and "to learn."
  3.  This summary table provides a high-level snapshot of the project's learning status.

---

## 6. Success Metrics

- KPI-1: User Acceptance of AI.
  - Metric: 75% of all AI-generated flashcards that are reviewed by a user receive a "thumbs up" (are accepted).
  - Measurement: Tracked via the internal analytics dashboard by calculating (total thumbs up) / (total thumbs up + total thumbs down) per user session.
- KPI-2: AI Generation Adoption.
  - Metric: 75% of all flashcards saved in the system are created via the AI generation flow (as opposed to being created manually).
  - Measurement: Tracked via the internal analytics dashboard by calculating (total AI-generated cards) / (total saved cards) across the platform.
- Project Goal: MVP Delivery.
  - Metric: The MVP, meeting all functional requirements outlined in this document, is deployed to a live environment within the 4-week development timeline.
  - Measurement: Monitored via the project plan and weekly milestones.
