package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/golang-jwt/jwt/v5"
	"github.com/pquerna/otp"
	"github.com/pquerna/otp/totp"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo *repositories.ContractRepository
}

func NewAuthService(repo *repositories.ContractRepository) *AuthService {
	return &AuthService{repo: repo}
}

func (s *AuthService) Register(name, email, password string) (*models.User, error) {
	// Verificar se usuário já existe
	existing, _ := s.repo.GetUserByEmail(email)
	if existing != nil {
		return nil, errors.New("usuário já cadastrado com este email")
	}

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Gerar um segredo TOTP único para o usuário
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "ContractLens",
		AccountName: email,
	})
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Name:              name,
		Email:             email,
		PasswordHash:      string(hashedPassword),
		VerificationToken: key.Secret(), // Salvamos o Secret em vez do código direto
		TokenExpiresAt:    time.Now().Add(24 * time.Hour),
		EmailVerified:     false,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	// Gerar o código de 6 dígitos atual para enviar por e-mail
	otpCode, err := totp.GenerateCode(user.VerificationToken, time.Now())
	if err != nil {
		return nil, err
	}

	// Disparar envio de e-mail (não bloqueante para o registro, mas importante)
	go s.sendVerificationEmail(user.Email, user.Name, otpCode)

	return user, nil
}

func (s *AuthService) sendVerificationEmail(email, name, token string) {
	// Chamada para a API interna do Next.js
	nextAppURL := os.Getenv("NEXT_PUBLIC_APP_URL")
	if nextAppURL == "" {
		nextAppURL = "http://host.docker.internal:3000"
	}

	apiURL := fmt.Sprintf("%s/api/emails/verify", nextAppURL)
	payload := map[string]string{
		"email": email,
		"name":  name,
		"token": token,
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		fmt.Printf("Erro ao chamar API de e-mail: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		fmt.Printf("API de e-mail retornou status: %d\n", resp.StatusCode)
	}
}

func (s *AuthService) VerifyEmail(email, code string) (string, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return "", errors.New("usuário não encontrado")
	}

	// Lógica de "Master Code" para ambiente de desenvolvimento
	if code == "000000" {
		fmt.Printf("[DEV] Usando código mestre para o e-mail: %s\n", email)
	} else {
		// Validar usando TOTP com uma janela de tempo generosa (Skew)
		// O Skew 20 permite códigos de até 10 minutos atrás (cada unidade = 30s)
		isValid, err := totp.ValidateCustom(code, user.VerificationToken, time.Now(), totp.ValidateOpts{
			Period:    30,
			Skew:      20,
			Digits:    otp.DigitsSix,
			Algorithm: otp.AlgorithmSHA1,
		})

		if err != nil || !isValid {
			return "", errors.New("código de verificação inválido ou expirado")
		}
	}

	if time.Now().After(user.TokenExpiresAt) {
		return "", errors.New("prazo de verificação expirado")
	}

	user.EmailVerified = true
	user.VerificationToken = "" // Limpa o segredo após a verificação bem-sucedida

	if err := s.repo.UpdateUser(user); err != nil {
		return "", err
	}

	// Gerar JWT para login automático
	return s.generateToken(user)
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	// Gerar JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // 24 horas
	})

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "secret-key-provisoria" // Fallback para desenvolvimento
	}

	return token.SignedString([]byte(jwtSecret))
}

func (s *AuthService) Login(email, password string) (string, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return "", errors.New("credenciais inválidas")
	}

	// Verificar se o e-mail foi verificado
	if !user.EmailVerified {
		return "", errors.New("por favor, verifique seu e-mail antes de fazer login")
	}

	// Verificar senha
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("credenciais inválidas")
	}

	return s.generateToken(user)
}
