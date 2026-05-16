package services

import (
	"encoding/json"
	"log"
	"os"

	"github.com/SherClockHolmes/webpush-go"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
)

type NotificationService struct {
	repo       repositories.Repository
	publicKey  string
	privateKey string
}

type NotificationPayload struct {
	Title string `json:"title"`
	Body  string `json:"body"`
	Icon  string `json:"icon,omitempty"`
	URL   string `json:"url,omitempty"`
}

func NewNotificationService(repo repositories.Repository) *NotificationService {
	return &NotificationService{
		repo:       repo,
		publicKey:  os.Getenv("VAPID_PUBLIC_KEY"),
		privateKey: os.Getenv("VAPID_PRIVATE_KEY"),
	}
}

func (s *NotificationService) SendNotification(userID uint, payload NotificationPayload) {
	subs, err := s.repo.GetPushSubscriptionsByUserID(userID)
	if err != nil {
		log.Printf("Erro ao buscar inscrições de push: %v", err)
		return
	}

	if len(subs) == 0 {
		return
	}

	payloadJSON, _ := json.Marshal(payload)

	for _, sub := range subs {
		s.sendToSubscription(sub, payloadJSON)
	}
}

func (s *NotificationService) sendToSubscription(sub models.PushSubscription, payload []byte) {
	// Decodificar inscrição para o formato do webpush-go
	subscription := &webpush.Subscription{
		Endpoint: sub.Endpoint,
		Keys: webpush.Keys{
			P256dh: sub.P256dh,
			Auth:   sub.Auth,
		},
	}

	// Enviar
	resp, err := webpush.SendNotification(payload, subscription, &webpush.Options{
		VAPIDPublicKey:  s.publicKey,
		VAPIDPrivateKey: s.privateKey,
		Subscriber:      "mailto:gabrielandrade@proton.me", // Requisito do protocolo VAPID
	})

	if err != nil {
		log.Printf("Erro ao enviar push: %v", err)
		return
	}
	defer resp.Body.Close()

	// Se o endpoint for inválido, remover do banco
	if resp.StatusCode == 404 || resp.StatusCode == 410 {
		log.Printf("Inscrição de push expirada: %s. Removendo...", sub.Endpoint)
		s.repo.DeletePushSubscription(sub.Endpoint)
	}
}
