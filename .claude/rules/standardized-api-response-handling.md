### Standardized API Responses

All handlers use centralized utility functions to ensure consistent JSON formatting and error reporting.

#### Patterns:
- `SendJSONResponse(w, data, code)`: For successful operations.
- `SendJSONError(w, message, code)`: For errors, ensuring the client always receives an `{"error": "message"}` object.

This standardization simplifies client-side error handling and toast notifications.