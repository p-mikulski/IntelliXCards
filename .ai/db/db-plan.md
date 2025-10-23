# Database Schema for IntelliXCards

## 1. List of Tables

### users

This table is managed by Supabase Auth.

- `id` UUID PRIMARY KEY
- `email` VARCHAR(255) NOT NULL UNIQUE
- `encrypted_password` VARCHAR NOT NULL
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `confirmed_at` TIMESTAMPTZ

### projects

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `title` VARCHAR(255) NOT NULL
- `description` TEXT
- `tag` VARCHAR(100)
- `created_at` TIMESTAMP DEFAULT NOW()
- `last_modified` TIMESTAMP DEFAULT NOW()

### flashcards

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `project_id` UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
- `front` VARCHAR(200) NOT NULL CHECK (length(front) <= 200)
- `back` VARCHAR(500) NOT NULL CHECK (length(back) <= 500)
- `next_review_date` TIMESTAMP DEFAULT NOW() + INTERVAL '1 day'
- `ease_factor` DECIMAL(3,2) DEFAULT 2.5
- `feedback` ENUM ('accepted', 'rejected') -- NULL allowed
- `feedback_timestamp` TIMESTAMP
- `created_at` TIMESTAMP DEFAULT NOW()

### study_sessions

- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- `project_id` UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE
- `start_time` TIMESTAMP NOT NULL
- `end_time` TIMESTAMP
- `cards_reviewed` INTEGER DEFAULT 0

## 2. Relationships

- `auth.users` (from Supabase Auth) to `projects`: One-to-many (one user can have many projects)
- `projects` to `flashcards`: One-to-many (one project can have many flashcards)
- `auth.users` to `study_sessions`: One-to-many (one user can have many study sessions)
- `projects` to `study_sessions`: One-to-many (one project can have many study sessions)

## 3. Indexes

- `projects_user_id_idx` on `projects(user_id)`
- `projects_user_id_creation_date_idx` on `projects(user_id, creation_date DESC)`
- `flashcards_project_id_idx` on `flashcards(project_id)`
- `flashcards_project_id_next_review_date_idx` on `flashcards(project_id, next_review_date)`
- `study_sessions_user_id_idx` on `study_sessions(user_id)`
- `study_sessions_project_id_idx` on `study_sessions(project_id)`
- `study_sessions_start_time_idx` on `study_sessions(start_time)`

## 4. PostgreSQL Policies

Enable RLS on projects and flashcards tables with policies like "user_id = auth.uid()" for Supabase integration, ensuring multi-tenant security and preventing data leakage between users.

## 5. Additional Notes

- The `users` table is managed by Supabase Auth (`auth.users`), referenced via `user_id` in other tables.
- A trigger is implemented on the `flashcards` table to update `projects.last_modified` on INSERT, UPDATE, or DELETE operations.
- Character limits on `front` and `back` are enforced via CHECK constraints.
- Default values for `next_review_date` and `ease_factor` are set as specified.
- Foreign keys use ON DELETE CASCADE to maintain data integrity.
- The schema is normalized to 3NF and optimized for the small initial scale.
