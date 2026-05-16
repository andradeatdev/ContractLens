package services

import (
	"context"
	"fmt"
	"log"
	"strings"

	"github.com/andradeatdev/ContractLens/api/backend/models"
	"github.com/andradeatdev/ContractLens/api/backend/repositories"
	"github.com/andradeatdev/ContractLens/api/pkg/utils"
	"github.com/pgvector/pgvector-go"
	"github.com/pkoukk/tiktoken-go"
)

type RAGService struct {
	repo         repositories.Repository
	ai           AIProvider
	notification *NotificationService
}

func NewRAGService(repo repositories.Repository, ai AIProvider, notification *NotificationService) *RAGService {
	return &RAGService{
		repo:         repo,
		ai:           ai,
		notification: notification,
	}
}

// ProcessChunks quebra o texto em pedaços baseados em tokens, gera embeddings e salva no banco.
func (s *RAGService) ProcessChunks(ctx context.Context, contractID uint, text string) {
	// 1. Limpeza inicial
	text = utils.NormalizeText(text)
	if text == "" {
		return
	}

	// 2. Tokenização e Chunking (800 tokens com 150 de overlap)
	chunks, err := s.chunkByTokens(text, 800, 150)
	if err != nil {
		log.Printf("Error: Falha no chunking por tokens: %v", err)
		// Fallback para chunking simples se falhar
		chunks = s.fallbackChunking(text, 2000, 400)
	}

	var documentChunks []models.DocumentChunk
	for _, content := range chunks {
		embedding, err := s.ai.GenerateEmbedding(ctx, content)
		if err != nil {
			log.Printf("Warning: Falha ao gerar embedding para chunk: %v", err)
			continue
		}

		documentChunks = append(documentChunks, models.DocumentChunk{
			ContractID: contractID,
			Content:    content,
			Embedding:  pgvector.NewVector(embedding),
		})
	}

	// 3. Salvar no Banco
	if len(documentChunks) > 0 {
		if err := s.repo.CreateChunks(documentChunks); err != nil {
			log.Printf("Error: Falha ao salvar chunks no banco: %v", err)
			return
		}
	}

	// 4. Notificação de Conclusão
	s.notifyCompletion(contractID)
}

func (s *RAGService) chunkByTokens(text string, chunkSize int, overlap int) ([]string, error) {
	tkm, err := tiktoken.GetEncoding("cl100k_base")
	if err != nil {
		return nil, err
	}

	tokens := tkm.Encode(text, nil, nil)
	var chunks []string

	for i := 0; i < len(tokens); i += chunkSize - overlap {
		end := i + chunkSize
		if end > len(tokens) {
			end = len(tokens)
		}

		chunkTokens := tokens[i:end]
		chunks = append(chunks, tkm.Decode(chunkTokens))

		if end == len(tokens) {
			break
		}
	}

	return chunks, nil
}

func (s *RAGService) fallbackChunking(text string, chunkSize int, overlap int) []string {
	var chunks []string
	for i := 0; i < len(text); i += chunkSize - overlap {
		end := i + chunkSize
		if end > len(text) {
			end = len(text)
		}
		chunks = append(chunks, text[i:end])
		if end == len(text) {
			break
		}
	}
	return chunks
}

func (s *RAGService) notifyCompletion(contractID uint) {
	if s.notification == nil {
		return
	}

	contract, err := s.repo.GetByID(contractID, 0)
	if err != nil {
		return
	}

	title := "Análise Concluída 🔍"
	body := fmt.Sprintf("O contrato \"%s\" foi processado.", contract.Filename)

	highRisks := 0
	for _, r := range contract.Risks {
		sev := strings.ToLower(r.Severity)
		if sev == "high" || sev == "critico" || sev == "crítico" {
			highRisks++
		}
	}

	if highRisks > 0 {
		title = "Riscos Críticos Detectados! ⚠️"
		body = fmt.Sprintf("A análise de \"%s\" revelou %d riscos graves que requerem atenção.", contract.Filename, highRisks)
	}

	s.notification.SendNotification(contract.UserID, NotificationPayload{
		Title: title,
		Body:  body,
		URL:   fmt.Sprintf("/dashboard/contracts/s/%s", contract.Slug),
	})
}
