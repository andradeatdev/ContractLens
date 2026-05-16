package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupContractTest(t *testing.T) (*ContractHandler, repositories.Repository, *gorm.DB) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	_ = db.AutoMigrate(&models.User{}, &models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.Note{})

	repo := repositories.NewGormRepository(db)
	service := services.NewContractService(repo, nil, nil, nil, nil)
	handler := NewContractHandler(service)

	return handler, repo, db
}

func TestListContracts(t *testing.T) {
	handler, repo, _ := setupContractTest(t)
	userID := uint(1)

	// Create some contracts
	_ = repo.Create(&models.Contract{UserID: userID, Filename: "contract1.pdf", Slug: "c1"})
	_ = repo.Create(&models.Contract{UserID: userID, Filename: "contract2.pdf", Slug: "c2"})

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/contracts", nil)
		ctx := context.WithValue(req.Context(), UserIDKey, userID)
		req = req.WithContext(ctx)
		rr := httptest.NewRecorder()

		handler.List(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var contracts []models.Contract
		json.NewDecoder(rr.Body).Decode(&contracts)
		assert.Equal(t, 2, len(contracts))
	})

	t.Run("Unauthorized", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/contracts", nil)
		rr := httptest.NewRecorder()

		handler.List(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code)
	})
}

func TestActivityHandler(t *testing.T) {
	handler, repo, _ := setupContractTest(t)
	userID := uint(1)

	// Create activity (contract)
	_ = repo.Create(&models.Contract{UserID: userID, Filename: "contract1.pdf", Slug: "c1"})

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/activity", nil)
		ctx := context.WithValue(req.Context(), UserIDKey, userID)
		req = req.WithContext(ctx)
		rr := httptest.NewRecorder()

		handler.Activity(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var activity []services.ActivityItem
		json.NewDecoder(rr.Body).Decode(&activity)
		assert.NotEmpty(t, activity)
		assert.Equal(t, "Análise concluída", activity[0].Action)
	})
}

func TestStatsHandler(t *testing.T) {
	handler, repo, _ := setupContractTest(t)
	userID := uint(1)

	// Create data for stats
	contract := &models.Contract{
		UserID:   userID,
		Filename: "contract.pdf",
		Slug:     "c1",
		Risks: []models.Risk{
			{Title: "Risk 1", Severity: "high"},
			{Title: "Risk 2", Severity: "medium"},
		},
	}
	_ = repo.Create(contract)

	t.Run("Success", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/stats", nil)
		ctx := context.WithValue(req.Context(), UserIDKey, userID)
		req = req.WithContext(ctx)
		rr := httptest.NewRecorder()

		handler.Stats(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var stats services.DashboardStats
		json.NewDecoder(rr.Body).Decode(&stats)
		assert.Equal(t, 1, stats.TotalContracts)
		assert.Equal(t, 2, stats.TotalRisks)
		assert.Equal(t, 1, stats.HighRisks)
	})
}
