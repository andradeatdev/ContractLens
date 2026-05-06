package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/internal/handlers"
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/services"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// 1. Conexão com DB (com retry para aguardar o banco subir no Docker)
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	var db *gorm.DB
	var err error
	maxRetries := 15

	for i := 1; i <= maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("Tentativa de conexão com o banco %d/%d falhou. Aguardando... (%v)", i, maxRetries, err)
		time.Sleep(3 * time.Second)
	}

	if err != nil {
		log.Fatal("Não foi possível conectar ao banco de dados após várias tentativas:", err)
	}
	log.Println("Conexão com o banco de dados estabelecida com sucesso.")

	// 2. Auto Migração
	db.AutoMigrate(&models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.User{})
	fmt.Println("Database migration completed.")

	// Fix-up: Garantir que todos os contratos tenham Slugs (para contratos legados)
	var legacyContracts []models.Contract
	db.Where("slug = ? OR slug IS NULL", "").Find(&legacyContracts)
	if len(legacyContracts) > 0 {
		fmt.Printf("Encontrados %d contratos sem slug. Gerando agora...\n", len(legacyContracts))
		// Precisamos do service para usar a lógica de geração
		tempRepo := repositories.NewContractRepository(db)
		tempService := services.NewContractService(tempRepo)
		for _, c := range legacyContracts {
			newSlug := tempService.GenerateSlugPublic(c.Filename) // Vou precisar expor esse método
			db.Model(&c).Update("slug", newSlug)
		}
	}

	// 3. Injeção de Dependências
	contractRepo := repositories.NewContractRepository(db)
	
	// Garantir que existe o usuário padrão (apenas para transição, idealmente remover depois)
	if err := contractRepo.EnsureDefaultUser(); err != nil {
		log.Printf("Erro ao criar usuário padrão: %v", err)
	}

	contractService := services.NewContractService(contractRepo)
	contractHandler := handlers.NewContractHandler(contractService)

	authService := services.NewAuthService(contractRepo)
	authHandler := handlers.NewAuthHandler(authService)

	// 4. Rotas
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "OK")
	})

	// Rotas Públicas de Auth
	http.HandleFunc("/auth/register", corsMiddleware(authHandler.Register))
	http.HandleFunc("/auth/login", corsMiddleware(authHandler.Login))
	http.HandleFunc("/auth/verify", corsMiddleware(authHandler.VerifyEmail))

	// Rotas Protegidas
	http.HandleFunc("/upload", corsMiddleware(handlers.AuthMiddleware(contractHandler.Upload)))
	http.HandleFunc("/chat", corsMiddleware(handlers.AuthMiddleware(contractHandler.Chat)))
	http.HandleFunc("/activity", corsMiddleware(handlers.AuthMiddleware(contractHandler.Activity)))
	http.HandleFunc("/stats", corsMiddleware(handlers.AuthMiddleware(contractHandler.Stats)))
	
	http.HandleFunc("/user", corsMiddleware(handlers.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			contractHandler.GetUser(w, r)
		} else if r.Method == http.MethodPut || r.Method == http.MethodPost {
			contractHandler.UpdateUser(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})))
	
	http.HandleFunc("/contracts/", corsMiddleware(handlers.AuthMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/contracts" || r.URL.Path == "/contracts/" {
			contractHandler.List(w, r)
			return
		}

		// Handle /contracts/s/:slug
		if strings.HasPrefix(r.URL.Path, "/contracts/s/") {
			slug := strings.TrimPrefix(r.URL.Path, "/contracts/s/")
			contractHandler.GetBySlug(w, r, slug)
			return
		}


		// Handle /contracts/:id/download
		var id uint
		if _, err := fmt.Sscanf(r.URL.Path, "/contracts/%d/download", &id); err == nil {
			contractHandler.Download(w, r, id)
			return
		}

		// Handle /contracts/:id
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

	// 5. Servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Server starting on :%s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
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
