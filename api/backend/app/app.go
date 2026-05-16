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

	contractService := services.NewContractService(contractRepo, nil, nil, storage)
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

	// Auth
	mux.HandleFunc("/auth/register", corsMiddleware(auth.Register))
	mux.HandleFunc("/auth/login", corsMiddleware(auth.Login))
	mux.HandleFunc("/auth/verify", corsMiddleware(auth.VerifyEmail))
	mux.HandleFunc("/auth/resend-code", corsMiddleware(auth.ResendVerificationCode))

	// Push Notifications
	mux.HandleFunc("/push/subscribe", corsMiddleware(handlers.AuthMiddleware(contractRepo, notification.Subscribe)))
	mux.HandleFunc("/push/unsubscribe", corsMiddleware(handlers.AuthMiddleware(contractRepo, notification.Unsubscribe)))

	// Protegidas
	mux.HandleFunc("/upload", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Upload)))
	mux.HandleFunc("/contracts/compare", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Compare)))
	mux.HandleFunc("/search", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Search)))
	mux.HandleFunc("/chat", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Chat)))
	mux.HandleFunc("/activity", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Activity)))
	mux.HandleFunc("/stats", corsMiddleware(handlers.AuthMiddleware(contractRepo, contract.Stats)))
	
	mux.HandleFunc("/user", corsMiddleware(handlers.AuthMiddleware(contractRepo, func(w http.ResponseWriter, r *http.Request) {
		handleUserRoute(w, r, contract)
	})))
	
	mux.HandleFunc("/contracts/", corsMiddleware(handlers.AuthMiddleware(contractRepo, func(w http.ResponseWriter, r *http.Request) {
		handleContractsRoute(w, r, contract)
	})))
}

func handleUserRoute(w http.ResponseWriter, r *http.Request, h *handlers.ContractHandler) {
	if r.Method == http.MethodGet {
		h.GetUser(w, r)
	} else if r.Method == http.MethodPut || r.Method == http.MethodPost {
		h.UpdateUser(w, r)
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleContractsRoute(w http.ResponseWriter, r *http.Request, h *handlers.ContractHandler) {
	path := r.URL.Path
	if path == "/contracts" || path == "/contracts/" {
		h.List(w, r)
		return
	}

	if strings.HasPrefix(path, "/contracts/s/") {
		slug := strings.TrimPrefix(path, "/contracts/s/")
		h.GetBySlug(w, r, slug)
		return
	}

	if path == "/contracts/notes" && r.Method == http.MethodPost {
		h.CreateNote(w, r)
		return
	}

	var id uint
	if _, err := fmt.Sscanf(path, "/contracts/notes/%d", &id); err == nil {
		h.DeleteNote(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, "/contracts/%d/download", &id); err == nil {
		h.Download(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, "/contracts/%d/reanalyze", &id); err == nil {
		h.Reanalyze(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, "/contracts/%d/export", &id); err == nil {
		h.ExportAnalysis(w, r, id)
		return
	}

	if _, err := fmt.Sscanf(path, "/contracts/%d", &id); err != nil {
		http.Error(w, "Invalid Contract Path", http.StatusBadRequest)
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
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
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
