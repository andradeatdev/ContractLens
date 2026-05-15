# GEMINI.md - AI Contract Analyzer (Contract Lens)

This file provides architectural context, development conventions, and operational guidance for the **Contract Lens** project.

## Project Overview

**Contract Lens** is an intelligent legal contract analysis platform. It uses Google Gemini AI to extract text from PDF contracts, identify hidden risks, summarize clauses in plain language, and provide a contextual chat interface for users to ask questions about their documents.

### Tech Stack

-   **Backend:** Go 1.26 (Clean Architecture / Hexagonal Architecture)
-   **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI
-   **AI:** Google Gemini Pro (via `gemini-2.5-flash-lite` model)
-   **Database:** PostgreSQL (Production) / SQLite (Testing/Development) with GORM
-   **Storage:** Vercel Blob (Cloud) / Local Storage (Development)
-   **Authentication:** JWT with email verification and TOTP (Two-Factor Authentication)
-   **Testing:** Vitest & Playwright (Frontend), Go Testing (Backend)

---

## Architecture & Directory Structure

### Backend (`api/`)
Follows Clean Architecture principles to ensure testability and independence from infrastructure.

-   `backend/handlers/`: HTTP transport layer (REST API endpoints).
-   `backend/services/`: Core business logic and use cases.
-   `backend/repositories/`: Data persistence (GORM implementations).
-   `backend/models/`: Domain entities (User, Contract, Risk, ChatMessage, Note).
-   `pkg/ai/`: Gemini AI integration logic.
-   `pkg/pdf/`: PDF processing and text extraction.

### Frontend (`web/`)
Uses the Next.js App Router for optimized performance and UX.

-   `src/app/`: File-based routing and Server/Client components.
-   `src/components/`: Reusable UI components (shadcn/ui based).
-   `src/hooks/`: Custom React hooks for state management.
-   `src/lib/`: Utilities, store (Zustand), and validations (Zod).

---

## Building and Running

### Backend
1.  Navigate to `api/`.
2.  Setup `.env` (copy from `.env.example` if available).
3.  Run the server: `go run cmd/app/main.go`
4.  Run tests: `go test ./backend/services/...`

### Frontend
1.  Navigate to `web/`.
2.  Install dependencies: `pnpm install`
3.  Run development server: `pnpm dev`
4.  Build for production: `pnpm build`
5.  Run component tests: `pnpm test`
6.  Run E2E tests: `pnpm exec playwright test`

### Utility Scripts
Located in the root `scripts/` directory:
-   `scripts/test-backend.sh`: Runs backend tests.
-   `scripts/test-frontend.sh`: Runs frontend vitest tests.
-   `scripts/test-e2e.sh`: Runs Playwright E2E tests.

---

## Development Conventions

### Coding Style
-   **Backend:** Idiomatic Go code. Use functional options pattern where appropriate. Ensure all handlers follow the `CanonicalLogMiddleware` for consistent logging.
-   **Frontend:** React 19 patterns. Prefer Server Components for data fetching. Use `framer-motion` for animations and `lucide-react` for icons.

### Security
-   Never log sensitive data (passwords, tokens).
-   Use `AuthMiddleware` for protected routes.
-   Validate all inputs using Zod (Frontend) and appropriate checks (Backend).

### AI Integration
-   Gemini model used: `gemini-2.5-flash-lite`.
-   Prompts are structured to return JSON for structured analysis or text for chat.
-   Always sanitize/clean AI JSON responses using `cleanJSONResponse`.

---

## Key Files for Reference
-   `api/backend/app/app.go`: Backend initialization and routing.
-   `api/pkg/ai/gemini.go`: AI core integration.
-   `web/src/app/page.tsx`: Frontend landing page.
-   `web/package.json`: Frontend dependencies and scripts.
-   `docker-compose.yml`: Infrastructure setup (PostgreSQL).
