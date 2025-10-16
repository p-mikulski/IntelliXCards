<conversation_summary> <decisions>

The relationship between users and projects is one-to-many, with no multi-user access to projects in the MVP.

Flashcards belong to projects in a one-to-many relationship, enforced by a foreign key with ON DELETE CASCADE.

Flashcard content limits are fixed at 200 characters for the front and 500 for the back.

Spaced repetition data (next_review_date, ease_factor) will be stored directly as columns in the flashcards table.

User feedback on flashcards will be stored in a single ENUM column ('accepted', 'rejected', NULL) and a single timestamp that updates on every change.

A separate study_sessions table will be created to track session start/end times and summary statistics.

Default values for new flashcards will be set to next_review_date = NOW() + 1 day and ease_factor = 2.5.

Indexes will be created on foreign keys (user_id, project_id) and timestamps. Composite indexes (e.g., (user_id, creation_date DESC)) will be used to optimize common queries.

Duplicate flashcard content within a single project will be allowed.

The database is designed for a small initial scale (e.g., 20 users), and table partitioning is not required for the MVP.

Analytics for AI acceptance rates will be calculated using queries on the normalized flashcards table.

Row-Level Security (RLS) will not be implemented for the MVP.

A trigger will be implemented to update a last_modified timestamp on a project whenever an associated flashcard is changed.

</decisions>

<matched_recommendations>

Flashcards should belong to projects (one-to-many relationship), with a foreign key from flashcards to projects, ensuring data integrity and allowing cascading deletes when projects are removed.

Standardize on 200 for front and 500 for back as per the PRD, implementing CHECK constraints in PostgreSQL to enforce these limits and prevent invalid data entry.

Store scheduling fields (e.g., next_review_date TIMESTAMP, ease_factor DECIMAL) directly on the flashcards table for simplicity in the MVP, as it reduces joins and aligns with the simple algorithm requirement.

Add a feedback column (e.g., ENUM: 'accepted', 'rejected', NULL) to flashcards, with an optional feedback_timestamp; for analytics, use this for aggregation without versioning.

Create a study_sessions table with user_id, project_id, start_time, end_time, and summary stats (e.g., cards_reviewed), linked to projects, to enable progress tracking without overloading the flashcards table.

Add composite indexes like (user_id, creation_date DESC) on projects and (project_id, next_review_date) on flashcards to optimize dashboard views and study session queries.

Use foreign key constraints with ON DELETE CASCADE from flashcards to projects to maintain data integrity during operations like project deletion.

Implement a trigger on flashcards for updating the project's last_modified timestamp to ensure data consistency, reducing application complexity. </matched_recommendations>

<database_planning_summary>

Database Planning Summary for IntelliXCards MVP
Main Requirements
The database schema must support a multi-tenant architecture where individual users manage their own resources. Key requirements include storing projects (flashcard decks) and the flashcards within them, tracking spaced repetition data for studying, capturing user feedback on AI-generated cards, and logging study session history. Data integrity is paramount, particularly ensuring flashcards are deleted when their parent project is removed.

Key Entities and Their Relationships
The database will consist of four main tables:

users: This will be handled by Supabase Auth and referenced via a user_id in other tables.

projects: This table will store project information, including title, description, tag, creation_date, and a last_modified timestamp. It will have a many-to-one relationship with users (via user_id).

flashcards: This table will contain the core learning content. It includes front and back text fields with character limits, spaced repetition fields (next_review_date, ease_factor), and feedback columns (feedback ENUM, feedback_timestamp). It will have a many-to-one relationship with projects (via project_id).

study_sessions: This table will log study activity, linking to both users and projects. It will store start_time, end_time, and summary statistics for each session.

Important Security and Scalability Concerns
Security: A critical decision was made to omit Row-Level Security (RLS) for the MVP. This approach deviates from standard Supabase practice for multi-tenant applications and introduces a significant security risk. All data access control will need to be strictly managed at the application level to prevent users from accessing data belonging to others. Data integrity will be enforced with foreign key constraints and ON DELETE CASCADE rules.

Scalability: The design is optimized for a small initial user base, and partitioning is considered unnecessary. Performance for common queries, like loading a user's dashboard, will be ensured by creating B-tree indexes on all foreign keys and relevant timestamp fields, as well as composite indexes for frequent sorting and filtering patterns. </database_planning_summary>

<unresolved_issues>

Contradictory Decision on last_modified Field: A decision was made to not add a last_modified field to the projects table for the MVP. However, a later decision approved implementing a database trigger to automatically update this exact field. It needs to be clarified whether this field should be added to the projects table schema.

Security Risk from Lack of RLS: The decision to not use Row-Level Security (RLS) is a major security concern for a multi-tenant application built on Supabase. This could lead to data leaks between users if application-layer code is not perfectly secure. This decision should be reviewed to confirm it is acceptable for the MVP launch. </unresolved_issues> </conversation_summary>