# Contract Lens 🔍

[![Go Version](https://img.shields.io/badge/Go-1.26.2-00ADD8?style=flat-square&logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_Pro-blue?style=flat-square)](https://ai.google.dev/)

<!-- README-I18N:START -->

[Português](./README.md) | **English**

<!-- README-I18N:END -->

Intelligent legal contract analysis platform using Artificial Intelligence for risk identification, clause summarization, and an interactive chat.

![Dashboard Preview](https://raw.githubusercontent.com/andradeatdev/ContractLens/main/public/preview.png)

## 🚀 Technologies

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **State & Data:** Zustand, TanStack Query v5
- **Transitions:** React View Transitions API
- **Validation:** Zod, React Hook Form

### Backend
- **Language:** Go 1.26
- **Database:** PostgreSQL / SQLite (GORM)
- **AI:** Google Gemini Pro (Generative AI)
- **Auth:** JWT, TOTP (Two-Factor Authentication)
- **PDF Processing:** Ledongthuc PDF

## ✨ Features

- **Upload & Parsing:** Text extraction from PDF files with asynchronous processing.
- **Risk Analysis:** Automatic identification of abusive or dangerous clauses categorized by severity level.
- **Contextual Chat:** Chat interface to answer specific questions about the contract content.
- **Exporting:** Generation of structured reports and summaries.
- **Security:** Robust authentication with email verification and temporary codes.
- **RESTful v1 API:** Standardized endpoints under `/api/v1`, with structured and highly descriptive JSON error handling.
- **Interactive API Documentation:** OpenAPI specification available natively, with an interactive interface provided by Scalar UI (`/api/docs`).


## 🛠️ Architecture

The project uses Clean Architecture in the backend to ensure testability and infrastructure independence:

```text
api/
├── backend/
│   ├── handlers/    # Transport layer (HTTP)
│   ├── services/    # Business rules and use cases
│   ├── repositories/# Data persistence
│   └── models/      # Domain entities
└── pkg/             # Shared packages (AI, PDF)
```

In the frontend, the structure follows modern Next.js patterns with a focus on performance and user experience (UX):

```text
web/
├── src/
│   ├── app/         # Routes and Server/Client Components
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Custom state logic
│   └── lib/         # Utilities, store, and validations
```

## 🔧 Local Setup

### Prerequisites
- Go 1.26+
- Node.js 20+ (pnpm recommended)
- Docker (optional for PostgreSQL)

### Backend
1. Navigate to the `api/` folder.
2. Rename `.env.example` to `.env` and fill in the keys:
   - `GEMINI_API_KEY`: Your Google AI Studio key.
   - `JWT_SECRET`: A random string for security.
3. Run `go run cmd/app/main.go`.

### Frontend
1. Navigate to the `web/` folder.
2. Install dependencies: `pnpm install`.
3. Run the development server: `pnpm dev`.

## 🧪 Tests

### Backend
```bash
go test ./api/backend/services/...
```

### Frontend
```bash
cd web && pnpm test
```

## 📈 Marketing & SEO Strategy

**Contract Lens** was designed with a strategic foundation focused on accessibility and reliability.

### 🎯 Positioning
- **Brand Voice:** Professional, reliable, and straightforward. We transform "legalese" into clear language for decision-makers.
- **Target Audience:** Small business owners, freelancers, and legal departments seeking agility in document review.
- **Differentiator:** Ultra-fast processing via Gemini 2.5 Flash Lite and an interface focused on visual risk analysis.

### 🔍 Search Engine Optimization (SEO)
We are focused on the following keywords and strategies:
- **Main Keywords:** `AI contract analysis`, `Legal Tech Brazil`, `Automatic contract review`, `Legal PDF data extraction`.
- **Content Strategy:** Focus on solving the pain of "delay in legal review" and "hidden risks in fine print".
- **Accessibility:** Strict compliance with WCAG 2.2 standards to ensure the tool is inclusive.

## 📄 License

This project is under the [MIT](LICENSE) license.

---
Developed by [Gabriel Andrade](https://github.com/andradeatdev).
