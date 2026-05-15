# Frontend Architecture

The frontend is a **Next.js 16** application utilizing the App Router and modern React 19 patterns.

```mermaid
graph TD
    subgraph Routing_and_Pages [Routing & Pages]
        app_router["src/app/ (File-based Routing)"]
        server_components["Server Components (Data Fetching)"]
        client_components["Client Components (Interactivity)"]
    end

    subgraph UI_Components [UI Components]
        shadcn["src/components/ui/ (Primitives)"]
        business_components["src/components/ (Domain Components)"]
    end

    subgraph State_and_Logic [State & Logic]
        hooks["src/hooks/ (Custom Hooks)"]
        store["src/lib/store.ts (Zustand)"]
        query["React Query (Server State)"]
    end

    subgraph Utilities [Utilities]
        lib["src/lib/ (Utils, Validations)"]
        types["src/types/ (TypeScript Definitions)"]
    end

    app_router --> server_components
    app_router --> client_components
    client_components --> business_components
    business_components --> shadcn
    client_components --> hooks
    hooks --> store
    hooks --> query
```

## Architecture Details
- **Next.js App Router**: Optimized for performance with Server Components for initial data fetching and Client Components for rich interactivity.
- **Component Strategy**: Built on top of `shadcn/ui` (Radix UI + Tailwind CSS) for accessible and consistent UI primitives.
- **State Management**:
    - **Server State**: Managed by `@tanstack/react-query` for caching and synchronization with the Go API.
    - **Global Client State**: Managed by `Zustand` for lightweight, predictable client-side state.
- **Animations**: Orchestrated with `Framer Motion` for smooth transitions and interactive feedback.
