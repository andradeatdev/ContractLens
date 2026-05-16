### Client-side UI State Persistence

The application uses `zustand` for state management with the `persist` middleware to automatically sync UI state (like filters, compact view, and chat drafts) to `localStorage`.

#### Usage:
- Use `useUIStore` to access and update UI-related state.
- Drafts are keyed by contract slug to prevent data loss when navigating away from a chat.