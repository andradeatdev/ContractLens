### Canonical Logging & Observability

The system implements a 'Canonical Log Line' pattern where every HTTP request results in a single, high-cardinality log entry containing all relevant metadata (status, duration, user_id, trace_id).

#### Implementation Details:
- **Trace ID**: The frontend generates a unique UUID for each session/request and sends it via the `X-Trace-ID` header.
- **Structured Logs**: Uses Go's `slog` with JSON output in production and human-readable text in development.
- **Middleware**: `CanonicalLogMiddleware` captures the response status and duration to log the final result of each request.