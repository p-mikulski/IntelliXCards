-- =====================================================
-- Migration: Initial Schema for IntelliXCards
-- =====================================================
-- Purpose: Create the initial database schema including:
--   - projects table for managing user's flashcard projects
--   - flashcards table for storing individual flashcards
--   - study_sessions table for tracking study activity
--   - all necessary indexes for query optimization
--   - row level security policies for multi-tenant data isolation
--   - triggers for automatic timestamp management
-- 
-- Affected Tables: projects, flashcards, study_sessions
-- Dependencies: Supabase Auth (auth.users)
-- Author: Database Migration System
-- Date: 2025-10-16
-- =====================================================

-- =====================================================
-- 1. CREATE ENUM TYPES
-- =====================================================

-- enum type for flashcard feedback status
create type flashcard_feedback as enum ('accepted', 'rejected');

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: projects
-- -----------------------------------------------------
-- stores user projects containing flashcard collections
-- each project is isolated per user for multi-tenant security
create table projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  tag varchar(100),
  created_at timestamptz not null default now(),
  last_modified timestamptz not null default now()
);

comment on table projects is 'stores flashcard projects owned by users';
comment on column projects.user_id is 'foreign key to auth.users - owner of the project';
comment on column projects.last_modified is 'automatically updated when flashcards are modified';

-- enable row level security on projects table
-- this ensures users can only access their own projects
alter table projects enable row level security;

-- -----------------------------------------------------
-- Table: flashcards
-- -----------------------------------------------------
-- stores individual flashcards within projects
-- includes spaced repetition algorithm fields (next_review_date, ease_factor)
create table flashcards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  front varchar(200) not null check (length(front) <= 200),
  back varchar(500) not null check (length(back) <= 500),
  next_review_date timestamptz not null default (now() + interval '1 day'),
  ease_factor decimal(3,2) not null default 2.5,
  feedback flashcard_feedback,
  feedback_timestamp timestamptz,
  created_at timestamptz not null default now()
);

comment on table flashcards is 'stores individual flashcards with spaced repetition data';
comment on column flashcards.front is 'question side of flashcard (max 200 chars)';
comment on column flashcards.back is 'answer side of flashcard (max 500 chars)';
comment on column flashcards.next_review_date is 'calculated date for next review in spaced repetition';
comment on column flashcards.ease_factor is 'difficulty multiplier for spaced repetition algorithm';
comment on column flashcards.feedback is 'user feedback status for ai-generated cards';

-- enable row level security on flashcards table
-- security is enforced through the projects relationship
alter table flashcards enable row level security;

-- -----------------------------------------------------
-- Table: study_sessions
-- -----------------------------------------------------
-- tracks user study sessions for analytics and progress monitoring
create table study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  start_time timestamptz not null,
  end_time timestamptz,
  cards_reviewed integer not null default 0
);

comment on table study_sessions is 'tracks study sessions for progress analytics';
comment on column study_sessions.cards_reviewed is 'total number of flashcards reviewed in this session';

-- enable row level security on study_sessions table
alter table study_sessions enable row level security;

-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

-- indexes for projects table
-- optimize queries filtering by user_id
create index projects_user_id_idx on projects(user_id);

-- optimize queries for listing user's projects sorted by creation date
create index projects_user_id_created_at_idx on projects(user_id, created_at desc);

-- indexes for flashcards table
-- optimize queries filtering by project_id
create index flashcards_project_id_idx on flashcards(project_id);

-- optimize queries for finding cards due for review
create index flashcards_project_id_next_review_date_idx on flashcards(project_id, next_review_date);

-- indexes for study_sessions table
-- optimize queries filtering by user_id
create index study_sessions_user_id_idx on study_sessions(user_id);

-- optimize queries filtering by project_id
create index study_sessions_project_id_idx on study_sessions(project_id);

-- optimize queries for session analytics by date
create index study_sessions_start_time_idx on study_sessions(start_time);

-- =====================================================
-- 4. CREATE TRIGGERS
-- =====================================================

-- -----------------------------------------------------
-- trigger function: update projects.last_modified
-- -----------------------------------------------------
-- automatically updates the last_modified timestamp on projects
-- when flashcards are inserted, updated, or deleted
create or replace function update_project_last_modified()
returns trigger as $$
begin
  -- update the parent project's last_modified timestamp
  update projects
  set last_modified = now()
  where id = coalesce(new.project_id, old.project_id);
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

comment on function update_project_last_modified is 'updates projects.last_modified when flashcards change';

-- attach trigger to flashcards table for insert, update, delete operations
create trigger update_project_last_modified_trigger
  after insert or update or delete on flashcards
  for each row
  execute function update_project_last_modified();

-- =====================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- =====================================================

-- -----------------------------------------------------
-- RLS policies for projects table
-- -----------------------------------------------------

-- policy: authenticated users can select their own projects
create policy "authenticated_users_select_own_projects"
  on projects
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "authenticated_users_select_own_projects" on projects is 
  'allows authenticated users to view only their own projects';

-- policy: authenticated users can insert their own projects
create policy "authenticated_users_insert_own_projects"
  on projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

comment on policy "authenticated_users_insert_own_projects" on projects is 
  'allows authenticated users to create projects owned by themselves';

-- policy: authenticated users can update their own projects
create policy "authenticated_users_update_own_projects"
  on projects
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on policy "authenticated_users_update_own_projects" on projects is 
  'allows authenticated users to update only their own projects';

-- policy: authenticated users can delete their own projects
create policy "authenticated_users_delete_own_projects"
  on projects
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy "authenticated_users_delete_own_projects" on projects is 
  'allows authenticated users to delete only their own projects';

-- -----------------------------------------------------
-- RLS policies for flashcards table
-- -----------------------------------------------------

-- policy: authenticated users can select flashcards from their own projects
create policy "authenticated_users_select_own_flashcards"
  on flashcards
  for select
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = flashcards.project_id
      and projects.user_id = auth.uid()
    )
  );

comment on policy "authenticated_users_select_own_flashcards" on flashcards is 
  'allows authenticated users to view flashcards only from their own projects';

-- policy: authenticated users can insert flashcards into their own projects
create policy "authenticated_users_insert_own_flashcards"
  on flashcards
  for insert
  to authenticated
  with check (
    exists (
      select 1 from projects
      where projects.id = flashcards.project_id
      and projects.user_id = auth.uid()
    )
  );

comment on policy "authenticated_users_insert_own_flashcards" on flashcards is 
  'allows authenticated users to create flashcards in their own projects';

-- policy: authenticated users can update flashcards in their own projects
create policy "authenticated_users_update_own_flashcards"
  on flashcards
  for update
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = flashcards.project_id
      and projects.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from projects
      where projects.id = flashcards.project_id
      and projects.user_id = auth.uid()
    )
  );

comment on policy "authenticated_users_update_own_flashcards" on flashcards is 
  'allows authenticated users to update flashcards only in their own projects';

-- policy: authenticated users can delete flashcards from their own projects
create policy "authenticated_users_delete_own_flashcards"
  on flashcards
  for delete
  to authenticated
  using (
    exists (
      select 1 from projects
      where projects.id = flashcards.project_id
      and projects.user_id = auth.uid()
    )
  );

comment on policy "authenticated_users_delete_own_flashcards" on flashcards is 
  'allows authenticated users to delete flashcards only from their own projects';

-- -----------------------------------------------------
-- RLS policies for study_sessions table
-- -----------------------------------------------------

-- policy: authenticated users can select their own study sessions
create policy "authenticated_users_select_own_sessions"
  on study_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

comment on policy "authenticated_users_select_own_sessions" on study_sessions is 
  'allows authenticated users to view only their own study sessions';

-- policy: authenticated users can insert their own study sessions
create policy "authenticated_users_insert_own_sessions"
  on study_sessions
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from projects
      where projects.id = study_sessions.project_id
      and projects.user_id = auth.uid()
    )
  );

comment on policy "authenticated_users_insert_own_sessions" on study_sessions is 
  'allows authenticated users to create study sessions for their own projects';

-- policy: authenticated users can update their own study sessions
create policy "authenticated_users_update_own_sessions"
  on study_sessions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

comment on policy "authenticated_users_update_own_sessions" on study_sessions is 
  'allows authenticated users to update only their own study sessions';

-- policy: authenticated users can delete their own study sessions
create policy "authenticated_users_delete_own_sessions"
  on study_sessions
  for delete
  to authenticated
  using (auth.uid() = user_id);

comment on policy "authenticated_users_delete_own_sessions" on study_sessions is 
  'allows authenticated users to delete only their own study sessions';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- this migration establishes the complete database schema
-- for the intellixcards application with proper multi-tenant
-- security through row level security policies
-- =====================================================
