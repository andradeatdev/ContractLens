package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
)

type AuthHandler struct {
	service *services.AuthService
}

func NewAuthHandler(service *services.AuthService) *AuthHandler {
	return &AuthHandler{service: service}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		SendJSONError(w, "Nome, e-mail e senha são obrigatórios", http.StatusBadRequest)
		return
	}

	user, err := h.service.Register(req.Name, req.Email, req.Password)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	SendJSONResponse(w, user, http.StatusCreated)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	token, err := h.service.Login(req.Email, req.Password)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusUnauthorized)
		return
	}

	SendJSONResponse(w, map[string]string{"token": token}, http.StatusOK)
}

func (h *AuthHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Code == "" {
		SendJSONError(w, "E-mail e código são obrigatórios", http.StatusBadRequest)
		return
	}

	token, err := h.service.VerifyEmail(req.Email, req.Code)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusBadRequest)
		return
	}

	SendJSONResponse(w, map[string]string{"message": "E-mail verificado com sucesso", "token": token}, http.StatusOK)
}
