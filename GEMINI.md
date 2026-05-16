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
-   **Authentication:** JWT with email verification, TOTP (2FA), and Web Push Notifications.
-   **Testing:** Vitest & Playwright (Frontend), Go Testing (Backend)
-   **CI/CD:** GitHub Actions (Node.js 24 runtime), CodeQL v4, SARIF reporting.

---

## Architecture & Directory Structure

### Backend (`api/`)
Follows Clean Architecture principles to ensure testability and independence from infrastructure.

-   `backend/handlers/`: HTTP transport layer (REST API endpoints).
-   `backend/services/`: Core business logic and use cases.
-   `backend/repositories/`: Data persistence (GORM implementations).
-   `backend/models/`: Domain entities (User, Contract, Risk, ChatMessage, Note, PushSubscription).
-   `pkg/ai/`: Gemini AI integration logic.
-   `pkg/pdf/`: PDF processing and text extraction.

### Frontend (`web/`)
Uses the Next.js App Router for optimized performance and UX.

-   `src/app/`: File-based routing and Server/Client components.
-   `src/components/`: Reusable UI components (shadcn/ui based).
-   `src/hooks/`: Custom React hooks for state management.
-   `src/lib/`: Utilities, store (Zustand), and validations (Zod).
-   `public/sw.js`: Service Worker for PWA and Push Notifications.

### Observability (`observability/`)
Infrastructure for monitoring and service health.
-   **Dashboards:** API and Web dashboards in JSON format (ready for import).
-   **SLO Framework:** Defined Service Level Objectives for both API and Web layers.
-   **Alerts:** Pre-configured alerting rules for production monitoring.

### Security & Tooling (`scripts/security/`)
The security layer is decoupled from the core application logic.

-   `scripts/security/lib/`: Python-based security scanner, vulnerability assessor, and compliance checker.
-   `scripts/security/references/`: Security standards and compliance requirements documentation.
-   `scripts/test-security.sh`: Main entry point for local and CI security audits.

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
-   `scripts/test-security.sh`: Runs the full security audit suite (SAST, Dependency Check, Compliance).

---

## Development Conventions

### Coding Style
-   **Backend:** Idiomatic Go code. Use functional options pattern where appropriate. Ensure all handlers follow the `CanonicalLogMiddleware` for consistent logging.
-   **Frontend:** React 19 patterns. Prefer Server Components for data fetching. Use `framer-motion` for animations and `lucide-react` for icons.

### Security
-   Never log sensitive data (passwords, tokens).
-   Use `AuthMiddleware` for protected routes.
-   Validate all inputs using Zod (Frontend) and appropriate checks (Backend).
-   **SAST Bypass:** Use `// nosec` comments to bypass false positives in security scans for reviewed and trusted lines (e.g., static JSON-LD or trusted innerHTML).

### AI Integration
-   Gemini model used: `gemini-2.5-flash-lite`.
-   Prompts are structured to return JSON for structured analysis or text for chat.
-   Always sanitize/clean AI JSON responses using `cleanJSONResponse`.

### CI/CD Integration
-   GitHub Actions are configured to use Node.js 24.
-   `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` is required for modern action support.
-   `gosec` results are exported in SARIF format for native GitHub Code Scanning integration.

---

## Operations & Maintenance

### Dependency Management
-   **Dependabot:** Enabled for `npm` (web), `gomod` (api), and `github-actions`.
-   **GH CLI Workflow:** Use `gh pr list` and `gh pr merge --squash` for efficient management of dependency PRs.
-   **Conflicts:** If multiple dependency PRs conflict, use `@dependabot rebase` in the comments to refresh them against the latest `main`.

### Troubleshooting Git/Filesystem Issues
-   **NTFS Artifacts:** When working in WSL/Windows environments, files like `:Zone.Identifier` can corrupt Git references.
    -   *Fix:* `find . -name "*:Zone.Identifier" -delete` and `git gc --prune=now`.
-   **File Mode Permissions:** If Git reports constant mode changes (100755 vs 100644), use `git config core.filemode false`.

---

## Key Files for Reference
-   `api/backend/app/app.go`: Backend initialization and routing.
-   `api/pkg/ai/gemini.go`: AI core integration.
-   `web/src/app/page.tsx`: Frontend landing page.
-   `web/package.json`: Frontend dependencies and scripts.
-   `scripts/test-security.sh`: Security audit orchestration.
-   `.github/workflows/ci.yml`: CI/CD pipeline definition.
-   `observability/slo-framework-api.json`: API service health definitions.
-   `docker-compose.yml`: Infrastructure setup (PostgreSQL).
