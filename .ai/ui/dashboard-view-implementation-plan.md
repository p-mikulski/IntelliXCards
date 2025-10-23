# View Implementation Plan: Dashboard (Projects List)

## 1. Overview

The Dashboard view serves as the main hub for authenticated users, displaying a comprehensive list of their projects. It provides the primary interface for project management, allowing users to create, view, update, and delete projects. The view is designed to be interactive and responsive, featuring sorting, pagination, and optimistic UI updates for a seamless user experience. It also includes a welcoming empty state for new users to guide them through creating their first project.

## 2. View Routing

- **Path:** `/dashboard`
- **Access:** This is a protected route and requires user authentication. Unauthenticated users attempting to access this path should be redirected to the login page.

## 3. Component Structure

The view will be composed of a main Astro page (`dashboard.astro`) that orchestrates several client-side React components.

```
/src/pages/dashboard.astro (Server-side wrapper, handles auth)
└── /src/components/dashboard/DashboardView.tsx (Client-side root)
    ├── /src/components/dashboard/DashboardHeader.tsx
    │   ├── /src/components/ui/Button.tsx (for "Create Project")
    │   └── Project statistics/counters
    ├── /src/components/dashboard/ProjectList.tsx
    │   ├── /src/components/dashboard/ProjectListToolbar.tsx
    │   │   ├── /src/components/ui/Input.tsx (for filtering)
    │   │   └── /src/components/ui/Dropdown.tsx (for sorting)
    │   ├── /src/components/dashboard/ProjectListItem.tsx (Repeated for each project)
    │   │   ├── Project details (title, date, tag)
    │   │   └── /src/components/dashboard/ProjectActions.tsx (Edit/Delete dropdown)
    │   ├── /src/components/common/SkeletonLoader.tsx (for loading state)
    │   └── /src/components/common/EmptyState.tsx (for new users)
    └── /src/components/common/Pagination.tsx
    └── /src/components/dashboard/CreateProjectDialog.tsx (Modal for creating projects)
    └── /src/components/dashboard/EditProjectDialog.tsx (Modal for editing projects)
    └── /src/components/common/ConfirmDialog.tsx (Modal for delete confirmation)
```

## 4. Component Details

### `DashboardView.tsx`

- **Description:** The main client-side component that fetches project data and manages the overall state for the dashboard, including dialog visibility and project list data.
- **Main Elements:** Renders `DashboardHeader`, `ProjectList`, `Pagination`, and all dialog components.
- **Handled Interactions:**
  - Handles opening/closing the Create, Edit, and Delete dialogs.
  - Manages API calls for fetching, creating, updating, and deleting projects.
  - Implements optimistic UI updates on the project list.
- **Types:** `ProjectListDto`, `ProjectListItemDto`, `ProjectViewModel`
- **Props:** None.

### `DashboardHeader.tsx`

- **Description:** Displays the view title, project statistics (e.g., "You have 5 projects"), and the primary "Create Project" button.
- **Main Elements:** `h1` for the title, `p` for stats, and a `Button` component.
- **Handled Interactions:**
  - `onClick` on the "Create Project" button, which calls a handler passed via props from `DashboardView`.
- **Types:** `ProjectListDto` (to derive stats).
- **Props:**
  - `projectCount: number`
  - `onOpenCreateDialog: () => void`

### `ProjectList.tsx`

- **Description:** Renders the list of projects. It handles the display of the loading state (skeleton), empty state, or the actual project items.
- **Main Elements:** A `div` container that conditionally renders `SkeletonLoader`, `EmptyState`, or a list of `ProjectListItem` components. It also includes the `ProjectListToolbar`.
- **Handled Interactions:**
  - Passes down event handlers for edit and delete actions to `ProjectListItem`.
  - Handles sorting and filtering changes from `ProjectListToolbar`.
- **Types:** `ProjectViewModel[]`
- **Props:**
  - `projects: ProjectViewModel[]`
  - `isLoading: boolean`
  - `onEdit: (project: ProjectViewModel) => void`
  - `onDelete: (project: ProjectViewModel) => void`
  - `onSortChange: (sortKey: string) => void`
  - `onFilterChange: (filterQuery: string) => void`

### `ProjectListItem.tsx`

- **Description:** Represents a single project in the list, displaying its key details and action controls.
- **Main Elements:** A clickable `div` or `a` tag that navigates to the project detail page. Contains text elements for title, creation date, and tag, along with the `ProjectActions` component.
- **Handled Interactions:**
  - `onClick` on the item navigates to `/projects/{projectId}`.
- **Types:** `ProjectViewModel`
- **Props:**
  - `project: ProjectViewModel`
  - `onEdit: (project: ProjectViewModel) => void`
  - `onDelete: (project: ProjectViewModel) => void`

### `CreateProjectDialog.tsx`

- **Description:** A modal form for creating a new project.
- **Main Elements:** A form with `Input` fields for `title`, `description`, and `tag`, and a "Save" button.
- **Handled Interactions:**
  - `onSubmit` of the form triggers validation and the API call.
- **Validation:**
  - `title`: Required, max 100 characters.
  - `description`: Optional, max 500 characters.
  - `tag`: Optional, max 50 characters.
- **Types:** `CreateProjectCommand`
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onCreate: (data: CreateProjectCommand) => Promise<void>`

### `EditProjectDialog.tsx`

- **Description:** A modal form for editing an existing project.
- **Main Elements:** A form pre-filled with the project's current data, with `Input` fields for `title`, `description`, and `tag`.
- **Handled Interactions:**
  - `onSubmit` triggers validation and the `PATCH` API call.
- **Validation:** Same as `CreateProjectDialog`.
- **Types:** `UpdateProjectCommand`, `ProjectViewModel`
- **Props:**
  - `isOpen: boolean`
  - `onClose: () => void`
  - `onUpdate: (projectId: string, data: UpdateProjectCommand) => Promise<void>`
  - `project: ProjectViewModel | null`

## 5. Types

### `ProjectViewModel`

A client-side representation of a project, derived from `ProjectListItemDto` but with an added state for optimistic UI.

```typescript
import type { ProjectListItemDto } from "./types";

export type ProjectViewModel = ProjectListItemDto & {
  /** 'syncing' for create/update, 'deleting' for delete */
  optimisticState?: "syncing" | "deleting";
  /** Formatted creation date string for display */
  formattedCreatedAt: string;
};
```

### DTOs (from `src/types.ts`)

- `ProjectListDto`: Used for the response of the `GET /api/projects` endpoint.
- `ProjectListItemDto`: The shape of a single project within `ProjectListDto`.
- `CreateProjectCommand`: The request payload for `POST /api/projects`.
- `UpdateProjectCommand`: The request payload for `PATCH /api/projects/{projectId}`.

## 6. State Management

State will be managed within the `DashboardView.tsx` component using React hooks. A custom hook, `useProjectDashboard`, will be created to encapsulate all business logic.

### `useProjectDashboard` Custom Hook

- **Purpose:** To centralize data fetching, state management, and API interactions for the dashboard.
- **State Variables:**
  - `projects: ProjectViewModel[]`: The list of projects to display.
  - `pagination: { page: number; limit: number; total: number }`: Pagination state.
  - `isLoading: boolean`: Tracks the data fetching status.
  - `error: Error | null`: Stores any API errors.
  - `dialogState: { create: boolean; edit: ProjectViewModel | null; delete: ProjectViewModel | null }`: Manages the visibility of modals.
- **Functions:**
  - `fetchProjects()`: Fetches projects from the API.
  - `handleCreateProject(data: CreateProjectCommand)`: Handles project creation with optimistic update.
  - `handleUpdateProject(id: string, data: UpdateProjectCommand)`: Handles project updates with optimistic update.
  - `handleDeleteProject(id: string)`: Handles project deletion with optimistic update.
  - `openCreateDialog()`, `openEditDialog(project)`, `openDeleteDialog(project)`, `closeDialogs()`.

## 7. API Integration

- **List Projects:**
  - **Action:** On component mount and when pagination/sort changes.
  - **Endpoint:** `GET /api/projects`
  - **Request:** Query params `page`, `limit`, `sort`.
  - **Response Type:** `ProjectListDto`

- **Create Project:**
  - **Action:** On "Save" in `CreateProjectDialog`.
  - **Endpoint:** `POST /api/projects`
  - **Request Type:** `CreateProjectCommand`
  - **Response Type:** `ProjectDto`

- **Update Project:**
  - **Action:** On "Save" in `EditProjectDialog`.
  - **Endpoint:** `PATCH /api/projects/{projectId}`
  - **Request Type:** `UpdateProjectCommand`
  - **Response Type:** `ProjectDto`

- **Delete Project:**
  - **Action:** On confirmation in `ConfirmDialog`.
  - **Endpoint:** `DELETE /api/projects/{projectId}`
  - **Request:** None.
  - **Response:** `204 No Content`

## 8. User Interactions

- **Create Project:** User clicks "Create Project" -> `CreateProjectDialog` opens -> User fills form and clicks "Save" -> Form is validated -> API call is made -> List updates optimistically.
- **Update Project:** User clicks "Edit" on a project -> `EditProjectDialog` opens with data -> User modifies form and clicks "Save" -> Form is validated -> API call is made -> List updates optimistically.
- **Delete Project:** User clicks "Delete" on a project -> `ConfirmDialog` opens -> User clicks "Confirm" -> API call is made -> Project is optimistically removed from the list.
- **View Project:** User clicks a project card -> Navigates to `/projects/{projectId}`.
- **Pagination:** User clicks a page number or next/prev button -> `fetchProjects` is called with the new page number.
- **Sorting/Filtering:** User selects a sort option or types in the filter input -> `fetchProjects` is called with new query parameters.

## 9. Conditions and Validation

- **Authentication:** The `dashboard.astro` page will check for a valid user session. If absent, it will redirect to the login page.
- **Form Validation:** `CreateProjectDialog` and `EditProjectDialog` will validate inputs before submission.
  - `title` is required. An error message ("Title is required") will be shown if empty.
  - Character limits will be enforced, displaying an error if exceeded (e.g., "Title cannot exceed 100 characters").
  - The "Save" button will be disabled until the form is valid.
- **Loading State:** While `isLoading` is true, `ProjectList` will display `SkeletonLoader` components instead of project items.
- **Empty State:** If `isLoading` is false and the `projects` array is empty, the `EmptyState` component will be displayed.

## 10. Error Handling

- **API Fetch Errors:** If `fetchProjects` fails, a toast notification or an inline error message will be displayed (e.g., "Failed to load projects. Please try again.").
- **Action Errors (Create/Update/Delete):** If an optimistic update fails, the UI will revert the change. For example, a project that was optimistically removed will reappear in the list. A toast notification will inform the user of the failure (e.g., "Failed to delete project.").
- **Validation Errors:** Handled inline within the forms, displaying error messages next to the invalid fields.
- **Unauthorized (401):** If any API call returns a 401 status, the user should be logged out and redirected to the login page.

## 11. Implementation Steps

1.  **Create File Structure:** Create the new files for the Astro page and all React components under `/src/pages/dashboard.astro` and `/src/components/dashboard/`.
2.  **Implement `dashboard.astro`:** Set up the page, handle authentication, and render the main `DashboardView` component with `client:load`.
3.  **Develop `useProjectDashboard` Hook:** Implement the custom hook with all state variables and functions for API logic and state management.
4.  **Build UI Components:**
    - Implement `DashboardView.tsx` to use the `useProjectDashboard` hook and orchestrate child components.
    - Create the static UI for `DashboardHeader`, `ProjectList`, `ProjectListItem`, `Pagination`, and the dialogs.
    - Implement the `SkeletonLoader` and `EmptyState` components.
5.  **Connect State and Props:** Wire up the state and event handlers from `DashboardView` down to the child components via props.
6.  **Implement Forms and Validation:** Build the forms in `CreateProjectDialog` and `EditProjectDialog`. Use a library like `react-hook-form` with `zod` for robust validation.
7.  **Implement Optimistic UI:**
    - On create, add a temporary `ProjectViewModel` with `optimisticState: 'syncing'` to the list.
    - On update, update the project in the list and set `optimisticState: 'syncing'`.
    - On delete, set `optimisticState: 'deleting'` on the project.
    - On API success, update the item with the response and remove the `optimisticState`.
    - On API failure, revert the change and show an error.
8.  **Styling:** Apply Tailwind CSS classes to all components to match the application's design system.
9.  **Testing:** Write unit tests for the `useProjectDashboard` hook and component tests to verify interactions and rendering based on state.
10. **Final Review:** Ensure all user stories and acceptance criteria are met, and that the implementation is accessible and responsive.
