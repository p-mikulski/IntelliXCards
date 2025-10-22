# UI Architecture for IntelliXCards

## 1. UI Structure Overview

IntelliXCards features a responsive, accessible interface organized around three primary flows: authentication, project management, and flashcard creation/study. The architecture adopts a mobile-first approach with a clear hierarchy of information and task-focused views. The UI is designed to minimize friction in the AI-assisted flashcard creation process while ensuring a smooth learning experience through the spaced repetition system.

Key architectural principles include:
- Progressive disclosure of complexity
- Context-aware navigation
- Consistent feedback mechanisms
- Accessibility-first design
- Clear visual hierarchy for primary actions

## 2. View List

### Landing Page
- **View Path:** `/`
- **Main Purpose:** Introduce the product to new users and provide entry points to authentication
- **Key Information:**
  - Value proposition
  - Feature highlights
  - Benefits of AI-generated flashcards
  - Call-to-action for signup/login
- **Key View Components:**
  - Hero section with primary CTA
  - Feature showcase
  - Login/Register buttons
- **UX/Accessibility/Security:**
  - High contrast for call-to-action elements
  - Keyboard-accessible navigation
  - Public-facing view (no authentication required)

### Registration View
- **View Path:** `/register`
- **Main Purpose:** Allow new users to create an account
- **Key Information:**
  - Registration form
  - Password requirements
  - Terms of service
- **Key View Components:**
  - Email input with validation
  - Password input with strength indicator
  - Registration button
  - Link to login view
- **UX/Accessibility/Security:**
  - Clear form validation feedback
  - Password strength visual indicator
  - ARIA-labeled form fields
  - SSL/TLS encrypted connection

### Login View
- **View Path:** `/login`
- **Main Purpose:** Allow returning users to authenticate
- **Key Information:**
  - Login form
  - Password recovery option
- **Key View Components:**
  - Email input
  - Password input
  - Remember me checkbox
  - Forgot password link
  - Login button
  - Link to registration
- **UX/Accessibility/Security:**
  - Clear error messaging for invalid credentials
  - Rate limiting for failed attempts
  - ARIA-labeled form fields
  - Automatic session timeout

### Dashboard (Projects List)
- **View Path:** `/dashboard`
- **Main Purpose:** Display all user projects and provide entry points to project management
- **Key Information:**
  - Project cards/list (title, creation date, tag)
  - Project counts/statistics
- **Key View Components:**
  - Create Project button (primary CTA)
  - Project cards/list with sort/filter options
  - Empty state for new users with guided first steps
  - Pagination controls
- **UX/Accessibility/Security:**
  - Skeleton loader during data fetching
  - Sortable columns with accessible controls
  - Protected route (authentication required)
  - Optimistic UI updates for project actions

### Project Detail View
- **View Path:** `/projects/:projectId`
- **Main Purpose:** Display project information and associated flashcards
- **Key Information:**
  - Project title, description, tag
  - Flashcard list with previews
  - Study statistics
- **Key View Components:**
  - Project header with metadata and actions
  - Tabs for different sections (Flashcards, Study History)
  - Generate with AI button (prominent CTA)
  - Study button (secondary CTA)
  - Create Flashcard button
  - Flashcard list with actions (edit, delete)
- **UX/Accessibility/Security:**
  - Breadcrumb navigation
  - Confirmation dialogs for destructive actions
  - Resource-based authorization
  - Focus management for modal interactions

### AI Flashcard Generation View
- **View Path:** `/projects/:projectId/generate`
- **Main Purpose:** Facilitate creation of AI-generated flashcards from text
- **Key Information:**
  - Text input instructions
  - Character limits
  - Generation options
- **Key View Components:**
  - Text area with character counter (10,000 max)
  - Number input for desired flashcard count
  - Generation options (if applicable)
  - Generate button with loading state
  - Cancel button
- **UX/Accessibility/Security:**
  - Progressive loading indicators
  - Auto-save of input text
  - Clear error handling for API failures
  - Keyboard shortcuts for common actions

### Flashcard Draft Review View
- **View Path:** `/projects/:projectId/review-drafts`
- **Main Purpose:** Review, edit, and save AI-generated flashcard drafts
- **Key Information:**
  - Draft flashcards (front/back content)
  - Editing capabilities
  - Feedback options
- **Key View Components:**
  - Editable draft cards with character counters
  - Thumbs up/down feedback buttons
  - Regenerate button per card
  - Delete option per card
  - Save All button (primary CTA)
  - Discard All option
- **UX/Accessibility/Security:**
  - Inline validation for character limits
  - Keyboard navigation between cards
  - Auto-save of edits
  - Confirmation for discarding changes

### Flashcard Creation/Edit View
- **View Path:** `/projects/:projectId/flashcards/new` or `/flashcards/:flashcardId/edit`
- **Main Purpose:** Create or edit individual flashcards manually
- **Key Information:**
  - Flashcard front/back content fields
  - Character limits
- **Key View Components:**
  - Front content textarea with character counter (200 max)
  - Back content textarea with character counter (500 max)
  - Save button
  - Cancel button
- **UX/Accessibility/Security:**
  - Live character counting
  - Form validation feedback
  - Auto-save draft functionality
  - Keyboard shortcuts for formatting

### Study Session View
- **View Path:** `/projects/:projectId/study`
- **Main Purpose:** Present flashcards for study using spaced repetition
- **Key Information:**
  - Current flashcard (front/back)
  - Study progress
  - Recall feedback options
- **Key View Components:**
  - Flashcard display with flip animation
  - Reveal button for answer
  - Recall feedback buttons (Easy, Good, Hard)
  - Progress indicator
  - Exit Study button
- **UX/Accessibility/Security:**
  - Keyboard shortcuts for common actions
  - Confirmation before exiting session
  - Session persistence across page reloads
  - Focus management for card interactions

### Study Session Summary View
- **View Path:** `/projects/:projectId/study/:sessionId/summary`
- **Main Purpose:** Display performance metrics after study session
- **Key Information:**
  - Cards reviewed count
  - Performance by category
  - Time spent studying
- **Key View Components:**
  - Performance statistics
  - Category breakdown (done, new, upcoming, to learn)
  - Visual charts/graphs
  - Return to Project button
  - Study Again button
- **UX/Accessibility/Security:**
  - Accessible data visualization
  - Screen reader friendly statistics
  - Shareable session results (optional)
  - Progress tracking over time

### Account Settings View
- **View Path:** `/settings`
- **Main Purpose:** Manage user profile and preferences
- **Key Information:**
  - Account details
  - Preference options
  - Account management actions
- **Key View Components:**
  - Profile information form
  - Password change form
  - Dark mode toggle
  - Account deletion option
- **UX/Accessibility/Security:**
  - Confirmation for sensitive actions
  - Password confirmation for critical changes
  - Clear success/error notifications
  - Session invalidation on password change

### Error View
- **View Path:** Various (404, 500, etc.)
- **Main Purpose:** Display user-friendly error messages
- **Key Information:**
  - Error type
  - Suggested resolution
  - Navigation options
- **Key View Components:**
  - Error description
  - Back button
  - Home button
  - Support contact information
- **UX/Accessibility/Security:**
  - Clear, non-technical error messaging
  - Automatic error reporting (optional)
  - No sensitive information in error details
  - Focus management for screen readers

## 3. User Journey Map

### Primary Journey: AI Flashcard Creation and Study
1. **User Registration and Onboarding**
   - User lands on Landing Page
   - User completes registration form
   - User is redirected to Dashboard with empty state
   - Guided first steps are presented

2. **Project Creation**
   - User clicks "Create Project" on Dashboard
   - Project creation modal appears
   - User enters project details and submits
   - New project appears in Dashboard
   - User clicks on project to enter Project Detail View

3. **AI Flashcard Generation**
   - User clicks "Generate with AI" button in Project Detail View
   - User is directed to AI Flashcard Generation View
   - User pastes text, sets desired card count
   - User clicks "Generate" button
   - System shows loading state during processing
   - User is directed to Flashcard Draft Review View

4. **Review and Save Flashcards**
   - User reviews generated flashcard drafts
   - User edits content as needed
   - User provides feedback (thumbs up/down)
   - User regenerates unsatisfactory cards
   - User clicks "Save All" button
   - System saves cards and shows success notification
   - User is returned to Project Detail View with new cards

5. **Study Session**
   - User clicks "Study" button in Project Detail View
   - Study Session View loads with first flashcard
   - User views front, clicks to reveal back
   - User provides recall feedback (Easy/Good/Hard)
   - System presents next card based on algorithm
   - Process repeats until session completion
   - System presents Study Session Summary View
   - User returns to Project Detail View

### Secondary Journeys

**Manual Flashcard Creation:**
1. User clicks "Create Flashcard" in Project Detail View
2. User completes flashcard form with front/back content
3. User saves flashcard
4. New flashcard appears in Project Detail View

**Project Management:**
1. User navigates to Dashboard
2. User locates project and clicks edit/delete
3. User confirms action
4. Dashboard updates to reflect changes

**Account Management:**
1. User clicks account icon in navigation
2. User selects "Settings" from dropdown
3. User modifies account settings as needed
4. User saves changes

## 4. Layout and Navigation Structure

### Global Navigation
- **Top Header (Desktop and Tablet)**
  - Logo/product name (links to Dashboard)
  - Account dropdown menu (Settings, Logout)
  - Dark mode toggle
  
- **Bottom Navigation Bar (Mobile)**
  - Dashboard icon
  - Recent projects icon
  - Account icon
  - Menu icon (for additional options)

### Contextual Navigation
- **Dashboard**
  - Create Project button
  - Sort/Filter controls
  - Search bar
  
- **Project Detail View**
  - Breadcrumb navigation (Dashboard > Project Name)
  - Tab navigation (Flashcards, Study History)
  - Action buttons (Generate with AI, Study, Create Flashcard)
  
- **Study Session View**
  - Minimalist navigation to reduce distraction
  - Exit button
  - Progress indicator
  - Card navigation controls

### Navigation Patterns
- **Hierarchical Navigation**
  - Dashboard → Project → Flashcards → Individual Flashcard
  - Settings → Specific Setting Category
  
- **Task-Based Navigation**
  - Direct action buttons for primary workflows
  - Context-specific options in secondary menus
  
- **State-Based Navigation**
  - Different options based on authentication state
  - Different options based on project content (empty vs. populated)

### Responsive Considerations
- **Desktop**
  - Sidebar navigation with expanded labels
  - Multi-column layouts for data-dense views
  - Hover states for interactive elements
  
- **Tablet**
  - Collapsible sidebar or top navigation
  - Adapted grid layouts
  - Touch-friendly target sizes
  
- **Mobile**
  - Bottom navigation bar for primary actions
  - Stack layouts for forms and content
  - Swipe gestures for card interaction
  - Minimized text input fields with expand on focus

## 5. Key Components

### Flashcard Component
- **Purpose:** Display and interact with flashcard content
- **Variants:** 
  - Study mode (flippable)
  - Edit mode (editable fields)
  - Preview mode (front only with expand option)
- **Features:**
  - Front/back content display
  - Flip animation
  - Character counters for editing
  - Action buttons (contextual)
- **Accessibility:** 
  - Keyboard flipping with Space/Enter
  - ARIA live regions for dynamic content
  - Focus management during interactions

### Project Card Component
- **Purpose:** Display project summary in Dashboard
- **Features:**
  - Title, description, tag display
  - Flashcard count badge
  - Last studied indicator
  - Action menu (edit, delete)
- **Accessibility:**
  - Keyboard navigation between cards
  - Clear focus indicators
  - ARIA labels for interactive elements

### Form Components
- **Purpose:** Handle user input consistently across views
- **Variants:**
  - Text input with validation
  - Text area with character counter
  - Number input with constraints
  - Toggle switches
- **Features:**
  - Real-time validation
  - Clear error messaging
  - Consistent styling
- **Accessibility:**
  - Associated labels
  - Error announcement for screen readers
  - Keyboard accessible controls

### Action Button Component
- **Purpose:** Provide consistent interaction points
- **Variants:**
  - Primary action (high emphasis)
  - Secondary action (medium emphasis)
  - Tertiary action (low emphasis)
  - Destructive action (delete, remove)
- **Features:**
  - Loading states
  - Disabled states
  - Icon + text combinations
- **Accessibility:**
  - High contrast options
  - Keyboard focus states
  - ARIA roles and states

### Notification Component
- **Purpose:** Provide feedback on system events
- **Variants:**
  - Success
  - Error
  - Warning
  - Information
- **Features:**
  - Timed auto-dismissal
  - Action buttons
  - Stacking capability
- **Accessibility:**
  - Screen reader announcements
  - Sufficient color contrast
  - Keyboard dismissal

### Modal Dialog Component
- **Purpose:** Focus user attention on specific tasks
- **Variants:**
  - Form modal
  - Confirmation modal
  - Information modal
- **Features:**
  - Backdrop overlay
  - Close button
  - Escape key dismissal
- **Accessibility:**
  - Focus trapping
  - ARIA role="dialog"
  - Return focus on close

### Progress Indicator Components
- **Purpose:** Show system status and user progress
- **Variants:**
  - Linear progress bar
  - Circular spinner
  - Skeleton loader
  - Step indicator
- **Features:**
  - Determinate/indeterminate states
  - Percentage display option
  - Animated transitions
- **Accessibility:**
  - ARIA live regions
  - Non-animation dependent indicators
  - Screen reader text alternatives

### Navigation Components
- **Purpose:** Enable movement between views
- **Variants:**
  - Top navigation bar
  - Sidebar navigation
  - Bottom navigation bar (mobile)
  - Breadcrumb trail
- **Features:**
  - Active state indication
  - Dropdown menus
  - Collapsible sections
- **Accessibility:**
  - Keyboard navigation
  - Skip navigation link
  - ARIA current for active items