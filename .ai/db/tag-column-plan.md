Plan to Implement a Separate Tags Table in Supabase
Based on your current database schema where projects.tag is a simple VARCHAR(100) field, here's a comprehensive plan to migrate to a dedicated tags table with proper relationships:

Phase 1: Database Schema Changes
1.1 Create New tags Table
Table structure:

id (UUID, primary key)
user_id (UUID, foreign key to auth.users, with CASCADE delete)
name (VARCHAR(50), unique per user)
color (VARCHAR(7), optional, for UI customization - hex color code)
created_at (TIMESTAMPTZ)
Indexes:

tags_user_id_idx on user_id
tags_user_id_name_idx unique index on (user_id, name) to prevent duplicate tag names per user
RLS Policies:

Users can only view, create, update, and delete their own tags
1.2 Create Junction Table project_tags
Since projects can have multiple tags (and tags can be reused across projects), we need a many-to-many relationship:

Table structure:

id (UUID, primary key)
project_id (UUID, foreign key to projects, CASCADE delete)
tag_id (UUID, foreign key to tags, CASCADE delete)
created_at (TIMESTAMPTZ)
Indexes:

project_tags_project_id_idx on project_id
project_tags_tag_id_idx on tag_id
Unique constraint on (project_id, tag_id) to prevent duplicate assignments
RLS Policies:

Users can only manage tag assignments for their own projects
1.3 Migration Strategy
Create a new migration file: 20251029000000_add_tags_table.sql
Migrate existing tag data from projects.tag to the new structure
Keep the projects.tag column temporarily for backward compatibility
Add a deprecation notice in code comments
Phase 2: API Changes
2.1 New Tag Endpoints
Add to api-plan.md:

Tags Resource

Create Tag

POST /tags
Request: { "name": "string", "color": "string (optional)" }
Response: Tag object with ID
List Tags

GET /tags
Query params: page, limit, sort
Response: Paginated list of user's tags
Update Tag

PATCH /tags/{tagId}
Request: { "name": "string", "color": "string" }
Response: Updated tag object
Delete Tag

DELETE /tags/{tagId}
Response: 204 No Content
Note: This removes all project-tag associations
2.2 Modified Project Endpoints
Update existing project endpoints:

Create Project

Add optional tag_ids: string[] array to request body
Deprecated: Keep tag: string for backward compatibility
Update Project

Add tag_ids: string[] to allow updating tag assignments
Deprecated: Keep tag: string for backward compatibility
List Projects

Add optional tag_id query parameter for filtering by tag
Response includes tags: TagDto[] array instead of single tag string
Get Project Detail

Response includes full tags: TagDto[] array with tag names and colors
Phase 3: TypeScript Types & DTOs
3.1 Add to types.ts:
3.2 Update database.types.ts
Regenerate Supabase types after migration to include new tables.

Phase 4: Backend Services
4.1 Create src/lib/services/tag.service.ts:
createTag(command, userId)
listTags(userId, pagination)
getTagById(tagId, userId)
updateTag(tagId, userId, command)
deleteTag(tagId, userId)
4.2 Create src/lib/services/project-tag.service.ts:
assignTagsToProject(projectId, tagIds, userId)
removeTagFromProject(projectId, tagId, userId)
getProjectTags(projectId, userId)
getProjectsByTag(tagId, userId)
4.3 Update project.service.ts:
Modify createProject to accept tag_ids and create associations
Modify listProjects to include tags via JOIN
Modify getProjectById to include associated tags
Add method filterProjectsByTag(tagId, userId)
Phase 5: Validation Schemas
5.1 Create src/lib/validation/tag.schema.ts:
5.2 Update project.schema.ts:
Phase 6: Frontend Components
6.1 Create Tag Management Components:
src/components/tags/TagBadge.tsx - Display tag with color
src/components/tags/TagSelector.tsx - Multi-select for project creation/editing
src/components/tags/TagManager.tsx - CRUD interface for tags
src/components/tags/CreateTagDialog.tsx - Modal for creating tags inline
6.2 Update Project Components:
CreateProjectDialog.tsx - Replace single tag input with multi-tag selector
EditProjectDialog.tsx - Same as above
ProjectListItem.tsx - Display multiple tag badges
ProjectListToolbar.tsx - Add tag filter dropdown
6.3 Add Custom Hook:
src/components/hooks/useTagManagement.ts - Handle tag CRUD operations
Phase 7: API Route Implementation
Create API routes following Astro patterns:

src/pages/api/tags/index.ts - GET (list), POST (create)
src/pages/api/tags/[tagId].ts - GET, PATCH, DELETE
Update index.ts - Handle tag_ids in creation
Update [projectId].ts - Include tags in response
Phase 8: Documentation Updates
Update all planning documents:

db-plan.md: Add tags and project_tags tables with full schema
api-plan.md: Document all new tag endpoints and modified project endpoints
prd.md: Update functional requirements to reflect tag management features
Phase 9: Migration & Testing
Run migration on Supabase (dev environment first)
Test data migration - verify existing tags are preserved
Test RLS policies - ensure users can't access others' tags
Test API endpoints with Postman/Thunder Client
Test frontend tag management UI
Deploy to production with rollback plan
