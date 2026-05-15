# System Architecture

This diagram illustrates the high-level relationship between the main components of the **Contract Lens** platform.

```mermaid
graph TD
    subgraph Client
        web["web (Next.js Frontend)"]
    end

    subgraph Server
        api["api (Go Backend)"]
    end

    subgraph Data
        db[(PostgreSQL / SQLite)]
        storage["Vercel Blob / Local Storage"]
    end

    subgraph AI_Services
        gemini[[Gemini AI (Flash 2.5 Lite)]]
    end

    web -->|REST API / JSON| api
    api -->|GORM| db
    api -->|File Uploads| storage
    api -->|SDK / Prompts| gemini
```

## Component Overview
- **Next.js Frontend**: A modern React 19 application using the App Router, Tailwind CSS 4, and Framer Motion for a polished user experience.
- **Go Backend**: A high-performance REST API built with Go 1.26, following Clean Architecture principles.
- **Database**: PostgreSQL is used in production for persistent storage, with SQLite supported for development and testing.
- **AI Engine**: Google Gemini AI is integrated for contract text extraction, risk analysis, and interactive chat.
