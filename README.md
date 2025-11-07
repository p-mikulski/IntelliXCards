# IntelliXCards

![Node.js Version](https://img.shields.io/badge/node-22.14.0-green)
![Astro](https://img.shields.io/badge/Astro-5-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-cyan)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-teal)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

IntelliXCards is a web-based learning tool designed to streamline the creation of flashcards using Artificial Intelligence. The application enables users to automatically generate high-quality flashcards from pasted text, significantly reducing the manual effort required for content creation.

By integrating with a simple spaced repetition algorithm, IntelliXCards helps users leverage an effective study method without the typical time investment. The Minimum Viable Product (MVP) focuses on the core workflow: text input, AI-driven generation, manual refinement, and a basic study mode.

### The Problem

Many learners understand the value of spaced repetition for long-term knowledge retention, but the time-consuming process of manually creating effective flashcards often discourages adoption. IntelliXCards solves this by automating the most labor-intensive part of the process.

## Tech Stack

- **Framework**: Astro 5 - Static site generator with component islands
- **Language**: TypeScript 5 - Type-safe JavaScript
- **UI Library**: React 19 - Component-based user interfaces
- **Styling**: Tailwind CSS 4 - Utility-first CSS framework
- **UI Components**: Radix UI - Accessible component primitives
- **Icons**: Lucide React - Beautiful icon library
- **Database/Auth**: Supabase - Backend-as-a-Service
- **Build Tool**: Vite - Fast build tool and dev server
- **Testing**: Vitest with React Testing Library - Unit and integration tests
- **E2E Testing**: Playwright - End-to-end browser automation

## Project Structure

When introducing changes to the project, always follow the directory structure below:

- `./src` - source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints
- `./src/middleware/index.ts` - Astro middleware
- `./src/db` - Supabase clients and types
- `./src/types.ts` - Shared types for backend and frontend (Entities, DTOs)
- `./src/components` - Client-side components written in Astro (static) and React (dynamic)
- `./src/components/ui` - Client-side components from Shadcn/ui
- `./src/lib` - Services and helpers
- `./src/assets` - static internal assets
- `./public` - public assets

## Getting Started Locally

### Prerequisites

- Node.js version 22.14.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Create a `.env` file in the root directory and configure the following:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon/public key
5. Start the development server
6. Open your browser
7. Navigate to `http://localhost:3000` to see the application.

## Available Scripts

| Script             | Description                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Start the development server with hot reload |
| `npm run build`    | Build the project for production             |
| `npm run preview`  | Preview the production build locally         |
| `npm run astro`    | Run Astro CLI commands                       |
| `npm run lint`     | Run ESLint to check code quality             |
| `npm run lint:fix` | Automatically fix ESLint issues              |
| `npm run format`   | Format code using Prettier                   |
| `npm test`         | Run unit and integration tests with Vitest   |
| `npm run test:e2e` | Run end-to-end tests with Playwright         |

## Testing

IntelliXCards employs a comprehensive multi-layered testing strategy to ensure functionality, reliability, and security:

### Testing Framework

- **Unit & Integration Tests**: Vitest with React Testing Library
  - Tests individual functions, React components, and custom hooks
  - Validates business logic within services and UI components
  - Target: 80% code coverage on critical business logic
  
- **End-to-End Tests**: Playwright
  - Simulates real user scenarios from start to finish
  - Tests critical flows: registration, project creation, AI flashcard generation, study sessions
  - Runs on staging environment before production deployment

### Test Coverage

The application tests all key functionalities:
- User authentication (registration, login, password recovery)
- Project management (CRUD operations)
- AI flashcard generation workflow (input validation, error handling)
- Flashcard management (CRUD operations)
- Study session functionality
- API endpoints and security (RLS policies)

### Quality Standards

- **Continuous Testing**: Automated tests run on every pull request via GitHub Actions
- **Acceptance Criteria**: 100% of automated tests must pass before deployment
- **Security**: Authentication middleware and Supabase RLS policies are thoroughly tested
- **No Critical Bugs**: Zero critical or high-severity bugs in production releases

## Deployment

IntelliXCards is deployed using a modern CI/CD pipeline with Cloudflare Pages for hosting and edge computing.

### Hosting Platform
- **Cloudflare Pages** - Global CDN with edge computing capabilities
- **GitHub Actions** - Automated CI/CD pipeline
- **Supabase** - Backend services (database and authentication)

### Deployment Process

The application uses automated deployment via GitHub Actions. Every push to the `master` branch triggers:

1. **Linting** - Code quality checks with ESLint
2. **Unit Testing** - Vitest tests with coverage reporting
3. **Build** - Optimized production build for Cloudflare Pages
4. **Deploy** - Automatic deployment to Cloudflare Pages
5. **Status Notification** - Deployment status reporting

### Prerequisites for Deployment

- GitHub repository with Actions enabled
- Cloudflare account with Pages access
- Supabase project configured

### Environment Configuration

#### Required GitHub Secrets (Production Environment)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon/public key
- `CLOUDFLARE_API_TOKEN` - API token with Pages:Edit permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID
- `CLOUDFLARE_PROJECT_NAME` - Name of your Pages project

#### Cloudflare Pages Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_KEY` - Supabase anon key

### Build Commands

```bash
# Local development
npm run dev

# Production build for Cloudflare
npm run build:cloudflare

# Preview production build
npm run preview
```

### Deployment Scripts

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run build:cloudflare` | Build optimized for Cloudflare Pages |

For detailed deployment instructions, see the [Complete Deployment Guide](.ai/hosting/deployment.md).

## Project Scope

### ✅ MVP Features (In Scope)

- User Authentication: Account creation, login, logout via Supabase
- Project Management: Create, view, rename, and delete flashcard decks/projects
- AI Flashcard Generation: Generate flashcards from plain text input (up to 10,000 characters)
- Flashcard CRUD: Full create, read, update, delete operations for flashcards
- Study Mode: Basic spaced repetition integration with session summaries
- Web Application: Responsive web app built with modern frontend technologies

### ❌ Future Features (Out of Scope for MVP)

- Proprietary spaced repetition algorithms (using pre-built solution)
- File import support (PDF, DOCX, etc.)
- Project sharing between users
- Third-party integrations (LMS, note-taking apps)
- Native mobile applications
- Flashcard version history

## Project Status

**Status**: MVP Development Phase

The project is currently in active development with a target MVP delivery within a 4-week timeline. Key success metrics include:

- **AI Acceptance Rate**: Target of 75% of AI-generated flashcards receiving "thumbs up" feedback
- **AI Generation Adoption**: Target of 75% of saved flashcards being created via AI generation
- **Core Features**: All essential functionality outlined in the MVP scope is being implemented

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
