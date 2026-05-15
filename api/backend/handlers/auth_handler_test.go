package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type mockEmailSender struct{}

func (m *mockEmailSender) SendVerificationEmail(email, name, token string) error {
	return nil
}

func setupAuthTest(t *testing.T) (*AuthHandler, *services.AuthService, repositories.Repository) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to connect to test database: %v", err)
	}

	_ = db.AutoMigrate(&models.User{}, &models.Contract{}, &models.Risk{}, &models.ChatMessage{})

	repo := repositories.NewGormRepository(db)
	mockEmail := &mockEmailSender{}
	service := services.NewAuthService(repo, mockEmail)
	handler := NewAuthHandler(service)

	return handler, service, repo
}

func TestRegister(t *testing.T) {
	handler, _, _ := setupAuthTest(t)

	t.Run("Success", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"name":     "Test User",
			"email":    "test@example.com",
			"password": "Password123!",
		})
		req, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.Register(rr, req)

		assert.Equal(t, http.StatusCreated, rr.Code)
		var user models.User
		json.NewDecoder(rr.Body).Decode(&user)
		assert.Equal(t, "test@example.com", user.Email)
	})

	t.Run("Missing Fields", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"name": "Test User",
		})
		req, _ := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.Register(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})

	t.Run("Method Not Allowed", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/register", nil)
		rr := httptest.NewRecorder()

		handler.Register(rr, req)

		assert.Equal(t, http.StatusMethodNotAllowed, rr.Code)
	})
}

func TestLogin(t *testing.T) {
	handler, service, _ := setupAuthTest(t)

	// Create a verified user for login
	_, _ = service.Register("Login User", "login@example.com", "Password123!")
	_, _ = service.VerifyEmail("login@example.com", "000000")

	t.Run("Success", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"email":    "login@example.com",
			"password": "Password123!",
		})
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.Login(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var resp map[string]string
		json.NewDecoder(rr.Body).Decode(&resp)
		assert.NotEmpty(t, resp["token"])
	})

	t.Run("Unauthorized", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"email":    "login@example.com",
			"password": "WrongPassword",
		})
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.Login(rr, req)

		assert.Equal(t, http.StatusUnauthorized, rr.Code)
	})

	t.Run("Bad Request", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer([]byte("invalid json")))
		rr := httptest.NewRecorder()

		handler.Login(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})
}

func TestVerifyEmailHandler(t *testing.T) {
	handler, service, _ := setupAuthTest(t)
	_, _ = service.Register("Verify User", "verify_h@example.com", "Password123!")

	t.Run("Success", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"email": "verify_h@example.com",
			"code":  "000000",
		})
		req, _ := http.NewRequest(http.MethodPost, "/verify-email", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.VerifyEmail(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var resp map[string]string
		json.NewDecoder(rr.Body).Decode(&resp)
		assert.Equal(t, "E-mail verificado com sucesso", resp["message"])
		assert.NotEmpty(t, resp["token"])
	})

	t.Run("Bad Request - Missing Fields", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{
			"email": "verify_h@example.com",
		})
		req, _ := http.NewRequest(http.MethodPost, "/verify-email", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.VerifyEmail(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})
}

func TestResendCodeHandler(t *testing.T) {
	handler, service, repo := setupAuthTest(t)
	_, _ = service.Register("Resend User", "resend_h@example.com", "Password123!")

	t.Run("Success", func(t *testing.T) {
		// Mock cooldown by manually updating the user in repo
		user, _ := repo.GetUserByEmail("resend_h@example.com")
		user.LastVerificationEmailSentAt = time.Now().Add(-61 * time.Second)
		_ = repo.UpdateUser(user)

		payload, _ := json.Marshal(map[string]string{
			"email": "resend_h@example.com",
		})
		req, _ := http.NewRequest(http.MethodPost, "/resend-code", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.ResendVerificationCode(rr, req)

		assert.Equal(t, http.StatusOK, rr.Code)
		var resp map[string]string
		json.NewDecoder(rr.Body).Decode(&resp)
		assert.Equal(t, "Código reenviado com sucesso", resp["message"])
	})

	t.Run("Bad Request - Missing Email", func(t *testing.T) {
		payload, _ := json.Marshal(map[string]string{})
		req, _ := http.NewRequest(http.MethodPost, "/resend-code", bytes.NewBuffer(payload))
		rr := httptest.NewRecorder()

		handler.ResendVerificationCode(rr, req)

		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})
}
