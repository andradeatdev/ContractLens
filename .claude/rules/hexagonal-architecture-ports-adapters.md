### Hexagonal Architecture in Go

The project uses Hexagonal Architecture (Ports & Adapters) to ensure the core business logic is independent of external dependencies like databases, file storage, or AI providers.

#### Guidelines:
- **Define Ports**: Use interfaces in the `services` or `models` package to define requirements (e.g., `FileStorage`, `AIAnalyzer`).
- **Implement Adapters**: Place concrete implementations in `adapters` or within the service package if they are internal (e.g., `LocalStorageAdapter`, `GeminiAnalyzer`).
- **Dependency Injection**: Inject implementations into services via constructors (e.g., `NewContractService`).

```go
// Port
type FileStorage interface {
	Upload(ctx context.Context, filename string, data []byte) (string, error)
}

// Adapter
type LocalStorageAdapter struct { ... }
func (a *LocalStorageAdapter) Upload(...) { ... }
```