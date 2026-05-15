# Backend Architecture (Clean Architecture)

The backend is implemented in Go and follows **Clean Architecture** (Hexagonal Architecture) principles. This ensures that the core business logic is independent of frameworks, UI, and databases.

```mermaid
graph TD
    subgraph Presentation_Layer [Presentation Layer]
        handlers["handlers/ (HTTP Handlers)"]
        middleware["middleware.go"]
    end

    subgraph Application_Layer [Application Layer]
        services["services/ (Business Logic / Use Cases)"]
    end

    subgraph Domain_Layer [Domain Layer]
        models["models/ (Entities)"]
        ports["ports.go (Interfaces)"]
    end

    subgraph Infrastructure_Layer [Infrastructure Layer]
        repositories["repositories/ (GORM Persistence)"]
        adapters["adapters/ (External Integrations)"]
        pkg_ai["pkg/ai/ (AI Implementation)"]
        pkg_pdf["pkg/pdf/ (PDF Extraction)"]
    end

    handlers --> services
    services --> models
    services --> ports
    repositories -.-> ports
    adapters -.-> ports
    pkg_ai -.-> ports
    pkg_pdf -.-> ports
```

## Layer Mapping
- **Presentation Layer (`handlers/`)**: Responsible for handling HTTP requests, parsing parameters, and returning JSON responses.
- **Application Layer (`services/`)**: Contains the core logic and use cases of the application (e.g., analyzing a contract, managing auth).
- **Domain Layer (`models/`, `ports.go`)**: Defines the fundamental entities (User, Contract) and the interfaces (Ports) that the infrastructure must implement.
- **Infrastructure Layer**: Implements the technical details like database access (`repositories/`), email sending (`adapters/`), and AI service communication (`pkg/ai/`).
