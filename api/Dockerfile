# Stage 1: Base image with shared configurations
FROM golang:1.26.2-alpine AS base
WORKDIR /app
# Install build dependencies
RUN apk add --no-cache build-base

# Stage 2: Development with hot-reload (air)
FROM base AS dev
# Install air for hot-reloading
RUN go install github.com/air-verse/air@latest
# Copy dependency files first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download
# Copy the rest of the source code
COPY . .
EXPOSE 8080
CMD ["air", "-c", ".air.toml"]

# Stage 3: Builder for production
FROM base AS builder
# Copy dependency files
COPY go.mod go.sum ./
RUN go mod download
# Copy source code
COPY . .
# Build a static binary for a minimal runtime image
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o /app/main ./cmd/app/main.go

# Stage 4: Minimal production runtime
FROM alpine:3.21 AS prod
# Install wget for healthcheck
RUN apk add --no-cache wget
# Add security hardening: use a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
# Copy only the compiled binary from the builder stage
COPY --from=builder /app/main .
# Use the non-root user
USER appuser
# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
# Expose the application port
EXPOSE 8080
# Set the entrypoint to the compiled binary
ENTRYPOINT ["./main"]
