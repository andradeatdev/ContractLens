package services

import (
	"testing"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type mockEmailSender struct {
	sent bool
}

func (m *mockEmailSender) SendVerificationEmail(email, name, token string) error {
	m.sent = true
	return nil
}

func setupTestDB(t *testing.T) (*gorm.DB, *AuthService) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("falha ao conectar no banco de testes: %v", err)
	}

	db.AutoMigrate(&models.User{}, &models.Contract{}, &models.Risk{}, &models.ChatMessage{})

	repo := repositories.NewGormRepository(db)
	mockEmail := &mockEmailSender{}
	service := NewAuthService(repo, mockEmail)

	return db, service
}

func TestRegister(t *testing.T) {
	_, service := setupTestDB(t)

	t.Run("Deve registrar um novo usuário com sucesso", func(t *testing.T) {
		user, err := service.Register("Test User", "test@example.com", "Password123!")
		assert.NoError(t, err)
		assert.NotNil(t, user)
		assert.Equal(t, "test@example.com", user.Email)
		assert.False(t, user.EmailVerified)
	})

	t.Run("Deve impedir registro de usuário já verificado", func(t *testing.T) {
		// Mockando usuário verificado
		user, _ := service.Register("Verified User", "verified@example.com", "Password123!")
		user.EmailVerified = true
		service.repo.UpdateUser(user)

		_, err := service.Register("Another", "verified@example.com", "NewPass123!")
		assert.Error(t, err)
		assert.Equal(t, "Usuário já cadastrado com este e-mail", err.Error())
	})
}

func TestRegisterCooldown(t *testing.T) {
	_, service := setupTestDB(t)
	email := "cooldown@example.com"

	t.Run("Deve aplicar cooldown de 60 segundos no re-registro", func(t *testing.T) {
		// Primeiro registro
		_, err := service.Register("User", email, "Pass123!")
		assert.NoError(t, err)

		// Tentativa imediata (deve falhar)
		_, err = service.Register("User", email, "NewPass123!")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Aguarde")

		// Simulando passagem de tempo (voltando o relógio do banco)
		user, _ := service.repo.GetUserByEmail(email)
		user.LastVerificationEmailSentAt = time.Now().Add(-61 * time.Second)
		service.repo.UpdateUser(user)

		// Tentativa após cooldown (deve funcionar)
		updatedUser, err := service.Register("User Updated", email, "NewPass123!")
		assert.NoError(t, err)
		assert.Equal(t, "User Updated", updatedUser.Name)
	})
}

func TestResendCodeCooldown(t *testing.T) {
	_, service := setupTestDB(t)
	email := "resend@example.com"
	service.Register("User", email, "Pass123!")

	t.Run("Deve impedir reenvio de código antes de 60 segundos", func(t *testing.T) {
		err := service.ResendVerificationCode(email)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "Aguarde")
	})

	t.Run("Deve permitir reenvio de código após 60 segundos", func(t *testing.T) {
		user, _ := service.repo.GetUserByEmail(email)
		user.LastVerificationEmailSentAt = time.Now().Add(-61 * time.Second)
		service.repo.UpdateUser(user)

		err := service.ResendVerificationCode(email)
		assert.NoError(t, err)
	})
}

func TestVerifyEmail(t *testing.T) {
	_, service := setupTestDB(t)
	email := "verify@example.com"
	service.Register("User", email, "Pass123!")

	t.Run("Deve falhar com código inválido", func(t *testing.T) {
		_, err := service.VerifyEmail(email, "123456")
		assert.Error(t, err)
	})

	t.Run("Deve falhar se o usuário não existir", func(t *testing.T) {
		_, err := service.VerifyEmail("nonexistent@example.com", "000000")
		assert.Error(t, err)
		assert.Equal(t, "Usuário não encontrado", err.Error())
	})
	
	t.Run("Deve verificar com sucesso usando Master Code em DEV", func(t *testing.T) {
		token, err := service.VerifyEmail(email, "000000")
		assert.NoError(t, err)
		assert.NotEmpty(t, token)
		
		updatedUser, _ := service.repo.GetUserByEmail(email)
		assert.True(t, updatedUser.EmailVerified)
	})
}
