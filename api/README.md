# AI Contract Analyzer API

Go backend for analyzing contracts using Gemini AI.

## Quality & Testing

### Running Tests
```bash
./scripts/test-backend.sh
```

### Running Linter (SAST & Complexity)
Requires `golangci-lint`.
```bash
./scripts/lint-backend.sh
```

### Mutation Testing
We recommend using [Gremlins](https://github.com/go-gremlins/gremlins) for mutation testing in Go.

To install:
```bash
go install github.com/go-gremlins/gremlins/cmd/gremlins@latest
```

To run:
```bash
cd api
gremlins unleash
```
