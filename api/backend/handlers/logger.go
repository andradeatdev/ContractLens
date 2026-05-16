package handlers

import (
	"log/slog"
	"net/http"
	"os"
	"time"
)

var Logger *slog.Logger

func init() {
	// Configura o logger estruturado (JSON para produção, texto para dev)
	var handler slog.Handler
	if os.Getenv("ENV") == "production" || os.Getenv("VERCEL") == "1" {
		handler = slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo})
	} else {
		handler = slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelDebug})
	}
	Logger = slog.New(handler)
}

type responseWriter struct {
	http.ResponseWriter
	status      int
	wroteHeader bool
}

func (rw *responseWriter) WriteHeader(code int) {
	if rw.wroteHeader {
		return
	}
	rw.status = code
	rw.wroteHeader = true
	rw.ResponseWriter.WriteHeader(code)
}

func (rw *responseWriter) Write(b []byte) (int, error) {
	if !rw.wroteHeader {
		rw.WriteHeader(http.StatusOK)
	}
	return rw.ResponseWriter.Write(b)
}

// CanonicalLogMiddleware implementa o log canônico (uma linha por request com tudo relevante)
func CanonicalLogMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()

		// Wrapper para capturar o status code
		rw := &responseWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(rw, r)

		duration := time.Since(start)

		// Atributos base do log
		attrs := []slog.Attr{
			slog.String("method", r.Method),
			slog.String("path", r.URL.Path),
			slog.Int("status", rw.status),
			slog.Duration("duration", duration),
			slog.String("ip", r.RemoteAddr),
			slog.String("user_agent", r.UserAgent()),
		}

		// Adiciona User ID se presente no context
		if userID, ok := r.Context().Value(UserIDKey).(uint); ok {
			attrs = append(attrs, slog.Uint64("user_id", uint64(userID)))
		}

		// Adiciona Trace ID se presente nos headers (vindo do frontend)
		if traceID := r.Header.Get("X-Trace-ID"); traceID != "" {
			attrs = append(attrs, slog.String("trace_id", traceID))
		}

		level := slog.LevelInfo
		if rw.status >= 500 {
			level = slog.LevelError
		} else if rw.status >= 400 {
			level = slog.LevelWarn
		}

		Logger.LogAttrs(r.Context(), level, "request completed", attrs...)
	})
}
