# View Implementation Plan: Project Detail

## 1. Overview
This document outlines the implementation plan for the "Project Detail" view. This view serves as the central hub for managing a single project, allowing users to view project details, manage its associated flashcards, and initiate study sessions. It provides core CRUD (Create, Read, Update, Delete) functionalities for flashcards within the context of a specific project.

## 2. View Routing
- **Path:** `/projects/[projectId].astro`
- **Description:** This will be a dynamic Astro page that captures the `projectId` from the URL. The page will render a client-side React component to handle the dynamic aspects of the view.

## 3. Component Structure
The view will be composed of the following React components, rendered by the main Astro page:

```
ProjectDetailView (Container)
├── ProjectHeader
│   ├── Breadcrumbs
│   ├── Button (Study)
│   └── Button (Generate with AI)
├── FlashcardListToolbar
│   └── Button (Create Flashcard)
├── FlashcardList
│   └── FlashcardListItem (repeated)
│       ├── CardContent (Front/Back)
│       └── FlashcardActions
│           ├── Button (Edit)
│           └── Button (Delete)
├── CreateFlashcardDialog
│   └── FlashcardForm
├── EditFlashcardDialog
│   └── FlashcardForm
└── ConfirmDialog (for deletion)
```

## 4. Component Details

### `ProjectDetailView`
- **Description:** The main container component that orchestrates the entire view. It fetches project and flashcard data, manages state, and handles communication between child components.
- **Main Elements:** Renders `ProjectHeader`, `FlashcardListToolbar`, `FlashcardList`, and all dialogs.
- **Handled Interactions:** Manages the opening/closing of `CreateFlashcardDialog`, `EditFlashcardDialog`, and `ConfirmDialog`.
- **Types:** `Project`, `FlashcardListItemDto`, `ProjectDetailViewModel`
- **Props:** `projectId: string`

### `ProjectHeader`
- **Description:** Displays the project's title, description, and tag. It also contains primary actions related to the project, such as starting a study session or generating flashcards with AI.
- **Main Elements:** `h1` for the title, `p` for description, `span` for the tag, and `Button` components for actions. Includes breadcrumb navigation.
- **Handled Interactions:**
  - `onStudyClick`: Navigates to the study session view.
  - `onGenerateAIClick`: Navigates to the AI generation view.
- **Types:** `Project`
- **Props:** `project: Project`

### `FlashcardList`
- **Description:** Renders the list of flashcards associated with the project.
- **Main Elements:** A `div` or `ul` that maps over the flashcard data and renders a `FlashcardListItem` for each.
- **Handled Interactions:** Delegates edit and delete actions to the parent `ProjectDetailView`.
- **Types:** `FlashcardListItemDto[]`
- **Props:** `flashcards: FlashcardListItemDto[]`, `onEdit: (flashcardId) => void`, `onDelete: (flashcardId) => void`

### `FlashcardListItem`
- **Description:** Represents a single flashcard in the list, showing its front and back content and providing action buttons.
- **Main Elements:** Two `div`s for front and back content, and a `FlashcardActions` component.
- **Handled Interactions:** Emits `onEdit` and `onDelete` events to its parent.
- **Types:** `FlashcardListItemDto`
- **Props:** `flashcard: FlashcardListItemDto`, `onEdit: (id) => void`, `onDelete: (id) => void`

### `CreateFlashcardDialog` / `EditFlashcardDialog`
- **Description:** A modal dialog containing a form to create or edit a flashcard.
- **Main Elements:** `Dialog` (Shadcn/ui), `FlashcardForm`.
- **Handled Interactions:** `onSave`: Submits the form data. `onCancel`: Closes the dialog.
- **Validation:**
  - `front`: Required, string, max 200 characters.
  - `back`: Required, string, max 500 characters.
- **Types:** `CreateFlashcardCommand`, `UpdateFlashcardCommand`, `FlashcardFormViewModel`
- **Props:** `isOpen: boolean`, `onClose: () => void`, `onSubmit: (data) => void`, `initialData?: Flashcard`

## 5. Types

### `ProjectDetailViewModel`
A new ViewModel to encapsulate all the state required for the `ProjectDetailView`.
```typescript
interface ProjectDetailViewModel {
  project: Project | null;
  flashcards: FlashcardListItemDto[];
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean; // For form submissions
  dialogs: {
    create: { isOpen: boolean };
    edit: { isOpen: boolean; flashcardId: string | null };
    delete: { isOpen: boolean; flashcardId: string | null };
  };
}
```

### `FlashcardFormViewModel`
A type to represent the data structure for the flashcard creation/editing form.
```typescript
type FlashcardFormViewModel = Pick<Flashcard, "front" | "back">;
```

## 6. State Management
A custom hook, `useProjectDetail`, will be created to manage the view's state and logic. This hook will be responsible for:
- Fetching the project details and the list of flashcards on initial load.
- Exposing the `ProjectDetailViewModel` state.
- Providing handler functions for creating, updating, and deleting flashcards. These handlers will call the respective API endpoints and update the local state optimistically or upon success.
- Managing the state of all dialogs (open/closed, and which item is being edited/deleted).

## 7. API Integration
The `useProjectDetail` hook will interact with the following API endpoints:

- **`GET /api/projects/{projectId}`**: To fetch project details.
  - **Response Type:** `ProjectDto`
- **`GET /api/projects/{projectId}/flashcards`**: To fetch the list of flashcards.
  - **Response Type:** `FlashcardListDto`
- **`POST /api/projects/{projectId}/flashcards`**: To create a new flashcard.
  - **Request Type:** `CreateFlashcardCommand`
  - **Response Type:** `FlashcardDto`
- **`PATCH /api/flashcards/{flashcardId}`**: To update an existing flashcard.
  - **Request Type:** `UpdateFlashcardCommand`
  - **Response Type:** `FlashcardDto`
- **`DELETE /api/flashcards/{flashcardId}`**: To delete a flashcard.
  - **Success Response:** 204 No Content

## 8. User Interactions
- **Create Flashcard:**
  1. User clicks "Create Flashcard".
  2. `CreateFlashcardDialog` opens.
  3. User fills the form and clicks "Save".
  4. `useProjectDetail` hook calls the `POST` endpoint.
  5. On success, the dialog closes and the flashcard list is updated.
- **Edit Flashcard:**
  1. User clicks the "Edit" button on a `FlashcardListItem`.
  2. `EditFlashcardDialog` opens, pre-filled with the flashcard's data.
  3. User modifies the form and clicks "Save".
  4. `useProjectDetail` hook calls the `PATCH` endpoint.
  5. On success, the dialog closes and the list is updated.
- **Delete Flashcard:**
  1. User clicks the "Delete" button on a `FlashcardListItem`.
  2. A `ConfirmDialog` appears.
  3. User clicks "Confirm".
  4. `useProjectDetail` hook calls the `DELETE` endpoint.
  5. On success, the dialog closes and the item is removed from the list.

## 9. Conditions and Validation
- **Authorization:** All API calls are implicitly authorized via the user's session. The frontend should handle 401/403 errors by redirecting to a login or an unauthorized page.
- **Form Validation:** The `FlashcardForm` will validate input fields based on the API constraints (e.g., `front` max 200 chars, `back` max 500 chars). The "Save" button will be disabled until the form is valid. Error messages will be displayed below invalid fields.
- **Loading State:** The UI will display skeleton loaders (`SkeletonLoader`) while the initial project and flashcard data is being fetched. A spinner or disabled state will be shown on buttons during form submissions.

## 10. Error Handling
- **Data Fetching Errors:** If fetching the project or flashcards fails (e.g., 404 Not Found, 500 Server Error), an error message will be displayed in place of the content.
- **Submission Errors:** If a create, update, or delete operation fails, a toast notification will appear with a user-friendly error message (e.g., "Failed to create flashcard. Please try again.").
- **Validation Errors:** If the API returns a 400 validation error, the specific field errors will be displayed on the form.

## 11. Implementation Steps
1.  **Create Page File:** Create the dynamic Astro page at `src/pages/projects/[projectId].astro`.
2.  **Create View Component:** Create the main React component `src/components/project/ProjectDetailView.tsx`. The Astro page will render this component, passing the `projectId` as a prop.
3.  **Develop Custom Hook:** Implement the `useProjectDetail` hook in `src/components/hooks/useProjectDetail.ts`. Start with fetching and displaying project and flashcard data.
4.  **Build Static Components:** Create the `ProjectHeader`, `FlashcardList`, and `FlashcardListItem` components. Wire them up in `ProjectDetailView` to display the data from the hook.
5.  **Implement Create Flow:**
    - Create the `FlashcardForm` component with validation using `zod` and `react-hook-form`.
    - Create the `CreateFlashcardDialog` component.
    - Add state and a handler function to `useProjectDetail` to manage the dialog and the `POST` request.
6.  **Implement Edit Flow:**
    - Create the `EditFlashcardDialog` component, reusing `FlashcardForm`.
    - Add state and a handler function to `useProjectDetail` to manage the dialog and the `PATCH` request.
7.  **Implement Delete Flow:**
    - Use the existing `ConfirmDialog` component.
    - Add state and a handler function to `useProjectDetail` to manage the confirmation dialog and the `DELETE` request.
8.  **Add Loading & Error States:** Implement skeleton loaders for initial data fetching and display user-friendly error messages for failed API calls.
9.  **Refine and Test:** Thoroughly test all user interactions, including edge cases and error conditions. Ensure the UI is responsive and accessible.
