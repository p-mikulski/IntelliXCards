# IntelliXCards

![Node.js Version](https://img.shields.io/badge/node-22.14.0-green)
![Astro](https://img.shields.io/badge/Astro-5-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-cyan)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-teal)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
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

## Getting Started Locally

### Prerequisites

- Node.js version 22.14.0 or higher
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Create a `.env` file in the root directory and configure the following:
5. Start the development server
6. Open your browser
7. Navigate to `http://localhost:4321` to see the application.

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
