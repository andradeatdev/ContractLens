package app

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/handlers"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func NewApp() http.Handler {
	// 1. Conexão com DB
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
			os.Getenv("DB_HOST"),
			os.Getenv("DB_USER"),
			os.Getenv("DB_PASSWORD"),
			os.Getenv("DB_NAME"),
			os.Getenv("DB_PORT"),
		)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Não foi possível conectar ao banco de dados:", err)
	}

	// 2. Auto Migração
	db.AutoMigrate(&models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.User{})

	// 3. Injeção de Dependências
	contractRepo := repositories.NewContractRepository(db)
	
	if err := contractRepo.EnsureDefaultUser(); err != nil {
		log.Printf("Erro ao criar usuário padrão: %v", err)
	}

	contractService := services.NewContractService(contractRepo, nil, nil)
	contractHandler := handlers.NewContractHandler(contractService)

	authService := services.NewAuthService(contractRepo)
	authHandler := handlers.NewAuthHandler(authService)

	// 4. Mux
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	})

	// Rotas Públicas de Auth
	mux.HandleFunc("/auth/register", corsMiddleware(authHandler.Register))
	mux.HandleFunc("/auth/login", corsMiddleware(authHandler.Login))
	mux.HandleFunc("/auth/verify", corsMiddleware(authHandler.VerifyEmail))
	mux.HandleFunc("/auth/resend-code", corsMiddleware(authHandler.ResendVerificationCode))

	// Rotas Protegidas
	mux.HandleFunc("/upload", corsMiddleware(handlers.AuthMiddleware(contractHandler.Upload)))
	mux.HandleFunc("/chat", corsMiddleware(handlers.AuthMiddleware(contractHandler.Chat)))
	mux.HandleFunc("/activity", corsMiddleware(handlers.AuthMiddleware(contractHandler.Activity)))
	mux.HandleFunc("/stats", corsMiddleware(handlers.AuthMiddleware(contractHandler.Stats)))
	
	mux.HandleFunc("/user", corsMiddleware(handlers.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			contractHandler.GetUser(w, r)
		} else if r.Method == http.MethodPut || r.Method == http.MethodPost {
			contractHandler.UpdateUser(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))
	
	mux.HandleFunc("/contracts/", corsMiddleware(handlers.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/contracts" || r.URL.Path == "/contracts/" {
			contractHandler.List(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, "/contracts/s/") {
			slug := strings.TrimPrefix(r.URL.Path, "/contracts/s/")
			contractHandler.GetBySlug(w, r, slug)
			return
		}

		var id uint
		if _, err := fmt.Sscanf(r.URL.Path, "/contracts/%d/download", &id); err == nil {
			contractHandler.Download(w, r, id)
			return
		}

		if _, err := fmt.Sscanf(r.URL.Path, "/contracts/%d/reanalyze", &id); err == nil {
			contractHandler.Reanalyze(w, r, id)
			return
		}

		if _, err := fmt.Sscanf(r.URL.Path, "/contracts/%d/export", &id); err == nil {
			contractHandler.ExportAnalysis(w, r, id)
			return
		}

		if _, err := fmt.Sscanf(r.URL.Path, "/contracts/%d", &id); err != nil {
			http.Error(w, "Invalid Contract Path", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			contractHandler.GetByID(w, r, id)
		case http.MethodPut, http.MethodPatch:
			contractHandler.Update(w, r, id)
		case http.MethodDelete:
			contractHandler.Delete(w, r, id)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))

	return handlers.CanonicalLogMiddleware(mux)
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
