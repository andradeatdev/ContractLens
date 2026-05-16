package app

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/adapters"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/handlers"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewApp() http.Handler {
	db := initDB()
	storage := initStorage()
	emailSender := &adapters.NextEmailAdapter{}

	contractRepo := repositories.NewGormRepository(db)
	if err := contractRepo.EnsureDefaultUser(); err != nil {
		log.Printf("Erro ao criar usuário padrão: %v", err)
	}

	notificationService := services.NewNotificationService(contractRepo)
	notificationHandler := handlers.NewNotificationHandler(contractRepo)

	aiAdapter := &adapters.GeminiAdapter{}
	pdfAdapter := &adapters.PDFAdapter{}
	ragService := services.NewRAGService(contractRepo, aiAdapter, notificationService)

	contractService := services.NewContractService(contractRepo, aiAdapter, pdfAdapter, storage, ragService)
	contractService.SetNotificationService(notificationService)
	contractHandler := handlers.NewContractHandler(contractService)

	authService := services.NewAuthService(contractRepo, emailSender)
	authHandler := handlers.NewAuthHandler(authService)

	mux := http.NewServeMux()
	registerRoutes(mux, authHandler, contractHandler, notificationHandler, contractRepo)

	return handlers.CanonicalLogMiddleware(mux)
}

func initDB() *gorm.DB {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = os.Getenv("POSTGRES_URL")
	}

	if dsn == "" {
		sslmode := os.Getenv("DB_SSLMODE")
		if sslmode == "" {
			sslmode = "disable"
		}
		maskedDSN := fmt.Sprintf("host=%s user=%s password=**** dbname=%s port=%s sslmode=%s",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
			sslmode,
		)
		log.Printf("Conectando ao banco: %s", maskedDSN)

		// #nosec G101 - Credentials are retrieved from environment variables, not hardcoded.
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
			sslmode,
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Não foi possível conectar ao banco de dados:", err)
	}

	// Habilita a extensão pgvector se estiver usando Postgres
	if os.Getenv("DB_HOST") != "" {
		db.Exec("CREATE EXTENSION IF NOT EXISTS vector")
	}

	err = db.AutoMigrate(
		&models.User{},
		&models.Contract{},
		&models.Risk{},
		&models.ChatMessage{},
		&models.Note{},
		&models.DocumentChunk{},
		&models.PushSubscription{},
	)
	if err != nil {
		log.Printf("ERRO na migração do banco: %v", err)
	}

	// Cria índice HNSW para busca vetorial se o pgvector estiver ativo
	if os.Getenv("DB_HOST") != "" {
		// O índice HNSW é mais performático para grandes volumes que o IVFFlat
		// Usamos vector_cosine_ops pois o RAG usa similaridade de cosseno (<=>)
		db.Exec("CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding_hnsw ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64)")
	}

	return db
}

func initStorage() services.FileStorage {
	blobToken := os.Getenv("BLOB_READ_WRITE_TOKEN")
	if blobToken != "" {
		log.Println("Usando Vercel Blob para armazenamento")
		return &services.VercelBlobAdapter{Token: blobToken}
	}

	uploadDir := "uploads"
	if os.Getenv("VERCEL") == "1" {
		uploadDir = "/tmp/uploads"
	}
	log.Println("Usando armazenamento local em:", uploadDir)
	return &services.LocalStorageAdapter{UploadDir: uploadDir}
}

func registerRoutes(mux *http.ServeMux, auth *handlers.AuthHandler, contract *handlers.ContractHandler, notification *handlers.NotificationHandler, contractRepo repositories.Repository) {
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		_, _ = fmt.Fprintf(w, "OK")
	})

	// Documentation
	mux.HandleFunc("/openapi.json", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "../docs/api/openapi.json")
	})

	mux.HandleFunc("/api/docs", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprint(w, `
<!doctype html>
<html>
  <head>
    <title>API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
		`)
	})

	// API v1 prefix
	v1 := "/api/v1"

	// Auth
	mux.HandleFunc(v1+"/auth/register", corsMiddleware(auth.Register))
	mux.HandleFunc(v1+"/auth/login", corsMiddleware(auth.Login))
	mux.HandleFunc(v1+"/auth/verify", corsMiddleware(auth.VerifyEmail))
	mux.HandleFunc(v1+"/auth/resend-code", corsMiddleware(auth.ResendVerificationCode))

	// Push Notifications
	mux.HandleFunc(v1+"/push/subscribe", corsMiddleware(handlers.AuthMiddleware(contractRepo, notification.Subscribe)))
	mux.HandleFunc(v1+"/push/unsubscribe", corsMiddleware(handlers.AuthMiddleware(contractRepo, notification.Unsubscribe)))

	// Public Tools
	mux.HandleFunc(v1+"/analysis/clauses", corsMiddleware(handlers.RateLimitMiddleware(contract.AnalyzeClause)))

	// Protegidas
	// POST /contracts -> Upload
	// GET /contracts -> List
	mux.HandleFunc(v1+"/contracts", corsMiddleware(handlers.AuthMiddleware(contractRepo, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			contract.Upload(w, r)
		} else if r.Method == http.MethodGet {
			contract.List(w, r)
		} else {
			handlers.SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		}
	})))

	mux.HandleFunc(v1+"/contracts/compare", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Compare)))
	mux.HandleFunc(v1+"/contracts/search", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Search)))
	mux.HandleFunc(v1+"/chat", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Chat)))

	// User stats/activity
	mux.HandleFunc(v1+"/users/me/activity", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Activity)))
	mux.HandleFunc(v1+"/users/me/stats", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Stats)))

	mux.HandleFunc(v1+"/users/me", corsMiddleware(handlers.AuthMiddleware(contractRepo, func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			contract.GetUser(w, r)
		} else if r.Method == http.MethodPut || r.Method == http.MethodPost {
			contract.UpdateUser(w, r)
		} else {
			handlers.SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		}
	})))

	mux.HandleFunc(v1+"/contracts/", corsMiddleware(handlers.AuthMiddleware(contractRepo, func(w http.ResponseWriter, r *http.Request) {
		handleContractsRoute(w, r, contract, v1)
	})))
}

func handleContractsRoute(w http.ResponseWriter, r *http.Request, h *handlers.ContractHandler, prefix string) {
	path := r.URL.Path

	if strings.HasPrefix(path, prefix+"/contracts/s/") {
		slug := strings.TrimPrefix(path, prefix+"/contracts/s/")
		h.GetBySlug(w, r, slug)
		return
	}

	if path == prefix+"/contracts/notes" && r.Method == http.MethodPost {
		h.CreateNote(w, r)
		return
	}

	var id uint
	if _, err := fmt.Sscanf(path, prefix+"/contracts/notes/%d", &id); err == nil {
		h.DeleteNote(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, prefix+"/contracts/%d/download", &id); err == nil {
		h.Download(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, prefix+"/contracts/%d/reanalyze", &id); err == nil {
		h.Reanalyze(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, prefix+"/contracts/%d/export", &id); err == nil {
		h.ExportAnalysis(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, prefix+"/contracts/%d", &id); err != nil {
		handlers.SendJSONError(w, "Caminho de contrato inválido", http.StatusBadRequest, "INVALID_PATH")
		return
	}

	switch r.Method {
	case http.MethodGet:
		h.GetByID(w, r, id)
	case http.MethodPut, http.MethodPatch:
		h.Update(w, r, id)
	case http.MethodDelete:
		h.Delete(w, r, id)
	default:
		handlers.SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, PUT, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}
