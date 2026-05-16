package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
)

type NotificationHandler struct {
	repo repositories.Repository
}

func NewNotificationHandler(repo repositories.Repository) *NotificationHandler {
	return &NotificationHandler{repo: repo}
}

func (h *NotificationHandler) Subscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID := r.Context().Value("user_id").(uint)

	var req struct {
		Endpoint string `json:"endpoint"`
		Keys     struct {
			P256dh string `json:"p256dh"`
			Auth   string `json:"auth"`
		} `json:"keys"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Inscrição inválida", http.StatusBadRequest)
		return
	}

	sub := &models.PushSubscription{
		UserID:   userID,
		Endpoint: req.Endpoint,
		P256dh:   req.Keys.P256dh,
		Auth:     req.Keys.Auth,
	}

	if err := h.repo.CreatePushSubscription(sub); err != nil {
		SendJSONError(w, "Erro ao salvar inscrição", http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, map[string]string{"message": "Inscrito com sucesso"}, http.StatusCreated)
}

func (h *NotificationHandler) Unsubscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Endpoint string `json:"endpoint"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Dados inválidos", http.StatusBadRequest)
		return
	}

	if err := h.repo.DeletePushSubscription(req.Endpoint); err != nil {
		SendJSONError(w, "Erro ao remover inscrição", http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, map[string]string{"message": "Removido com sucesso"}, http.StatusOK)
}
