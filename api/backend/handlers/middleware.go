package handlers

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	jwt "github.com/golang-jwt/jwt/v5"
)

var requestCounts = sync.Map{}

func RateLimitMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ip, _, err := net.SplitHostPort(r.RemoteAddr)
		if err != nil {
			ip = r.RemoteAddr
		}
		now := time.Now()

		// Max 5 requests per 10 seconds
		val, _ := requestCounts.LoadOrStore(ip, []time.Time{})
		timestamps := val.([]time.Time)

		var valid []time.Time
		for _, t := range timestamps {
			if now.Sub(t) < 10*time.Second {
				valid = append(valid, t)
			}
		}

		if len(valid) >= 5 {
			SendJSONError(w, "Muitas requisições. Tente novamente mais tarde.", http.StatusTooManyRequests)
			return
		}

		valid = append(valid, now)
		requestCounts.Store(ip, valid)

		next(w, r)
	}
}

type contextKey string

const UserIDKey contextKey = "user_id"

func AuthMiddleware(repo repositories.Repository, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			SendJSONError(w, "Token de autorização ausente", http.StatusUnauthorized)
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			SendJSONError(w, "Formato de token inválido", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]
		jwtSecret := os.Getenv("JWT_SECRET")
		if jwtSecret == "" {
			jwtSecret = "secret-key-provisoria"
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("Método de assinatura inesperado: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			SendJSONError(w, "Token inválido ou expirado", http.StatusUnauthorized)
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			SendJSONError(w, "Falha ao processar as informações do token", http.StatusUnauthorized)
			return
		}

		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			SendJSONError(w, "ID de usuário ausente no token", http.StatusUnauthorized)
			return
		}

		userID := uint(userIDFloat)

		// Verificar se o usuário ainda existe no banco de dados
		_, err = repo.GetUser(userID)
		if err != nil {
			SendJSONError(w, "Usuário não encontrado ou sessão inválida", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		next(w, r.WithContext(ctx))
	}
}
