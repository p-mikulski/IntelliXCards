# View Implementation Plan: AI Flashcard Generation

## 1. Overview
This document outlines the implementation plan for the AI Flashcard Generation and Draft Review views. This feature allows users to input a block of text, specify the desired number of flashcards, and receive AI-generated drafts. Users can then review, edit, delete, and finally save these drafts as new flashcards within a project. The implementation will consist of a single, stateful page that transitions from a generation form to a draft review interface.

## 2. View Routing
- **Path**: `/projects/[projectId]/generate`
- **File**: `src/pages/projects/[projectId]/generate.astro`
- This page will be responsible for rendering the main React component and passing the `projectId` as a prop.

## 3. Component Structure
The view will be built using a parent container component that manages the overall state and renders one of two main child components based on the current workflow step (generation or review).

```
- AIGenerationView (React) - Main container
  - Props: projectId
  - State: viewMode ('form' | 'review'), isLoading, drafts, error
  - Renders either AIGenerationForm or AIGenerationReview based on viewMode.

  - AIGenerationForm (React)
    - Props: onGenerate, isGenerating
    - Displays the form for text input and flashcard count.

  - AIGenerationReview (React)
    - Props: drafts, onSaveAll, onUpdateDraft, onDeleteDraft, onDiscardAll
    - Displays the list of generated draft flashcards for user review and action.

    - DraftFlashcardItem (React)
      - Props: draft, onUpdate, onDelete, onFeedback
      - Represents a single editable flashcard in the review list.
```

## 4. Component Details

### `AIGenerationView`
- **Component Description**: The main container component that orchestrates the entire AI generation workflow. It manages the application state, handles API calls, and conditionally renders the appropriate child component (`AIGenerationForm` or `AIGenerationReview`).
- **Main Elements**: A container `div` that wraps the currently active child component. It will also display global loading indicators or error messages (e.g., via a toast notification).
- **Handled Interactions**:
  - Initiates the API call to generate flashcards when the form is submitted.
  - Receives generated drafts and switches the view to review mode.
  - Handles the final "Save All" action to persist the drafts.
  - Handles the "Discard All" action to return to the form view.
- **Types**: `AIGenerationViewProps`, `FlashcardDraftViewModel`, `GenerateFlashcardsCommand`, `GenerateFlashcardsResponseDto`.
- **Props**: `{ projectId: string }`.

### `AIGenerationForm`
- **Component Description**: A form that allows users to input text and specify the number of flashcards to generate. It includes validation and provides feedback on input constraints.
- **Main Elements**:
  - `form` element wrapping all inputs.
  - `textarea` for text input with a character counter.
  - `input type="number"` for the desired flashcard count.
  - `button type="submit"` for "Generate", which shows a loading state.
  - `button type="button"` for "Cancel" to navigate away.
- **Handled Interactions**:
  - Updates parent component's state on input changes.
  - Calls the `onGenerate` prop function upon form submission.
- **Handled Validation**:
  - Text area input must not be empty.
  - Text area input must not exceed 10,000 characters.
  - Desired count must be a positive number (e.g., > 0).
- **Types**: `AIGenerationFormProps`.
- **Props**: `{ onGenerate: (command: GenerateFlashcardsCommand) => void; isGenerating: boolean; }`.

### `AIGenerationReview`
- **Component Description**: Displays a list of AI-generated flashcard drafts, allowing the user to review, edit, and manage them before saving.
- **Main Elements**:
  - A list container (`div` or `ul`) to hold `DraftFlashcardItem` components.
  - A header section with "Save All" and "Discard All" buttons.
- **Handled Interactions**:
  - Renders a `DraftFlashcardItem` for each draft.
  - Calls `onSaveAll` when the "Save All" button is clicked.
  - Calls `onDiscardAll` when the "Discard All" button is clicked, likely after a confirmation dialog.
- **Types**: `AIGenerationReviewProps`, `FlashcardDraftViewModel`.
- **Props**: `{ drafts: FlashcardDraftViewModel[]; onSaveAll: () => void; onUpdateDraft: (id: string, updates: Partial<FlashcardDraft>) => void; onDeleteDraft: (id: string) => void; onDiscardAll: () => void; }`.

### `DraftFlashcardItem`
- **Component Description**: An individual, editable flashcard item within the review list. It contains form fields for the front and back content, along with action buttons.
- **Main Elements**:
  - `div` or `li` as the root card element.
  - `textarea` for the "front" content with a character counter.
  - `textarea` for the "back" content with a character counter.
  - Action buttons: "Delete".
  - Feedback buttons: "Thumbs Up", "Thumbs Down".
- **Handled Interactions**:
  - Calls `onUpdate` prop when front or back content is changed.
  - Calls `onDelete` prop when the delete button is clicked.
  - Calls `onFeedback` prop when a feedback button is clicked.
- **Handled Validation**:
  - Front content must not exceed 200 characters.
  - Back content must not exceed 500 characters.
- **Types**: `DraftFlashcardItemProps`, `FlashcardDraftViewModel`.
- **Props**: `{ draft: FlashcardDraftViewModel; onUpdate: (id: string, updates: Partial<FlashcardDraft>) => void; onDelete: (id: string) => void; onFeedback: (id: string, feedback: 'up' | 'down') => void; }`.

## 5. Types

### `FlashcardDraftViewModel`
This new ViewModel extends the `FlashcardDraft` DTO to include a client-side unique identifier and feedback state, which are essential for state management in React.

```typescript
import { FlashcardDraft } from "../../types"; // Assuming DTO is in a shared types file

/**
 * ViewModel for a flashcard draft in the review UI.
 * Includes a client-side ID and feedback state for UI management.
 */
export type FlashcardDraftViewModel = FlashcardDraft & {
  id: string; // A unique client-side identifier (e.g., generated with crypto.randomUUID())
  feedback?: 'up' | 'down'; // UI state for the feedback buttons
};
```

### Component Props
```typescript
// For AIGenerationView
export interface AIGenerationViewProps {
  projectId: string;
}

// For AIGenerationForm
export interface AIGenerationFormProps {
  onGenerate: (command: GenerateFlashcardsCommand) => void;
  isGenerating: boolean;
}

// For AIGenerationReview
export interface AIGenerationReviewProps {
  drafts: FlashcardDraftViewModel[];
  onSaveAll: () => void;
  onUpdateDraft: (id: string, updates: Partial<FlashcardDraft>) => void;
  onDeleteDraft: (id: string) => void;
  onDiscardAll: () => void;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
}

// For DraftFlashcardItem
export interface DraftFlashcardItemProps {
  draft: FlashcardDraftViewModel;
  onUpdate: (id:string, updates: Partial<FlashcardDraft>) => void;
  onDelete: (id: string) => void;
  onFeedback: (id: string, feedback: 'up' | 'down') => void;
}
```

## 6. State Management
A custom hook, `useAIGeneration`, will be created to encapsulate the state and logic for the entire feature. This hook will be used by the `AIGenerationView` component.

### `useAIGeneration` Hook (`src/components/hooks/useAIGeneration.ts`)
- **Purpose**: To manage the view's state, handle user actions, and interact with the API.
- **State Variables**:
  - `viewMode: 'form' | 'review'`: Controls which component to display.
  - `isLoading: boolean`: Indicates when an API call (generation or saving) is in progress.
  - `drafts: FlashcardDraftViewModel[]`: Stores the list of generated drafts.
  - `error: string | null`: Stores any error messages from API calls.
- **Returned Functions**:
  - `generateFlashcards(command: GenerateFlashcardsCommand)`: Calls the AI generation API and updates state with the response.
  - `updateDraft(id: string, updates: Partial<FlashcardDraft>)`: Updates a specific draft in the `drafts` array.
  - `deleteDraft(id: string)`: Removes a draft from the `drafts` array.
  - `updateFeedback(id: string, feedback: 'up' | 'down')`: Updates the feedback for a specific draft.
  - `saveAllDrafts()`: Calls the API to save all current drafts as new flashcards.
  - `discardAllDrafts()`: Resets the state to return to the form view.

## 7. API Integration

- **AI Flashcard Generation**:
  - **Action**: User submits the generation form.
  - **Endpoint**: `POST /api/projects/{projectId}/flashcards/ai-generate`
  - **Request Type**: `GenerateFlashcardsCommand` (`{ text: string; desired_count: number; }`)
  - **Response Type**: `GenerateFlashcardsResponseDto` (`{ drafts: FlashcardDraft[] }`)
  - **Implementation**: The `generateFlashcards` function in the `useAIGeneration` hook will make this API call. On success, it will map the `FlashcardDraft[]` response to `FlashcardDraftViewModel[]` (adding client-side IDs) and switch the `viewMode` to `'review'`.

- **Save All Drafts**:
  - **Action**: User clicks the "Save All" button in the review view.
  - **Endpoint**: `POST /api/projects/{projectId}/flashcards` (called for each draft)
  - **Request Type**: `CreateFlashcardCommand` (`{ front: string; back: string; }`)
  - **Implementation**: This will be a batch operation. The `saveAllDrafts` function will iterate through the `drafts` array and use `Promise.allSettled` to make a `fetch` call for each draft. The UI should show progress and handle any partial failures.

## 8. User Interactions
- **Text/Count Input**: As the user types, the form state is updated. The character counter provides real-time feedback.
- **Generate Button**: When clicked, the button enters a disabled/loading state. The view shows a global loading indicator. On success, the view transitions to the draft review list. On failure, an error message is displayed.
- **Editing Drafts**: Users can type directly into the `textarea` fields for each draft. Changes are saved to the component's state automatically via the `onUpdate` handler.
- **Delete Draft**: Clicking the delete button on a card removes it from the list immediately.
- **Feedback Buttons**: Clicking "thumbs up" or "thumbs down" updates the UI and the draft's state via the `onFeedback` handler.
- **Save All Button**: Clicking this initiates the process of saving all visible drafts. A loading indicator is shown. On success, the user is redirected to the project detail page.
- **Discard All Button**: Clicking this will trigger a confirmation dialog. If confirmed, the `drafts` state is cleared, and the view returns to the initial generation form.

## 9. Conditions and Validation
- **Form Validation**:
  - The "Generate" button will be disabled if the text area is empty or if the desired count is not a positive number.
  - A validation message will appear if the text area exceeds 10,000 characters.
- **Draft Validation**:
  - The `textarea` for the front content will show a validation message if the text exceeds 200 characters.
  - The `textarea` for the back content will show a validation message if the text exceeds 500 characters.
  - The "Save All" button's logic should prevent saving cards that violate these limits, or the invalid fields should be clearly marked.

## 10. Error Handling
- **API Generation Failure**: If the `POST /api/projects/{projectId}/flashcards/ai-generate` call fails, the `useAIGeneration` hook will set an error message in its state. The `AIGenerationView` will display this error prominently (e.g., using a toast notification).
- **API Save Failure**: If saving one or more flashcards fails during the "Save All" process, the UI should provide feedback about which cards failed to save and allow the user to retry. The successfully saved cards should be removed from the list.
- **Network Errors**: All `fetch` calls should be wrapped in `try...catch` blocks to handle network issues gracefully, displaying a generic "Network error" message.
- **Regenerate Feature**: The "Regenerate" feature for drafts is deferred due to a mismatch with the available API endpoint. It will not be implemented in this iteration.

## 11. Implementation Steps
1.  **Create Page File**: Create `src/pages/projects/[projectId]/generate.astro`. Import and render the main React component, passing the `projectId`.
2.  **Create View Components**: Create the file structure for the React components: `src/components/project/ai-generation/AIGenerationView.tsx`, `AIGenerationForm.tsx`, `AIGenerationReview.tsx`, and `DraftFlashcardItem.tsx`.
3.  **Define Types**: Add the `FlashcardDraftViewModel` and component prop types to `src/components/project/ai-generation/types.ts`.
4.  **Implement `useAIGeneration` Hook**: Create `src/components/hooks/useAIGeneration.ts`. Implement the state variables and the core logic for `generateFlashcards`, `updateDraft`, `deleteDraft`, `updateFeedback`, `saveAllDrafts`, and `discardAllDrafts`.
5.  **Build `AIGenerationForm`**: Implement the form UI with controlled components, validation logic, and character counters. Connect its `onGenerate` prop to the hook.
6.  **Build `AIGenerationReview` and `DraftFlashcardItem`**: Implement the review list. `DraftFlashcardItem` should contain the editable text areas and action buttons. Wire up the `onUpdate`, `onDelete`, and `onFeedback` props to the corresponding functions in the `useAIGeneration` hook.
7.  **Implement `AIGenerationView`**: Use the `useAIGeneration` hook to get state and handlers. Implement the conditional rendering logic based on `viewMode`.
8.  **API Integration**: Implement the `fetch` calls within the `useAIGeneration` hook, ensuring correct request/response handling and error management.
9.  **Styling and UX**: Apply Tailwind CSS for styling. Add loading spinners, disabled states, and toast notifications (e.g., using `sonner`) for a polished user experience.
10. **Testing**: Manually test the full workflow: form validation, successful generation, draft editing/deleting, error scenarios, and final saving.
