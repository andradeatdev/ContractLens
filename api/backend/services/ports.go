package services

import (
	"context"

	"github.com/andradeatdev/ContractLens/api/backend/models"
)

// FileStorage é o Port para persistência de arquivos (Arquitetura Hexagonal)
type FileStorage interface {
	Upload(ctx context.Context, filename string, data []byte) (string, error)
	Download(ctx context.Context, path string) ([]byte, error)
	Delete(ctx context.Context, path string) error
}

type AIAnalysisResult struct {
	IsContract bool     `json:"is_contract"`
	Summary    string   `json:"summary"`
	TotalValue string   `json:"total_value"`
	Category   string   `json:"category"`
	Expiration string   `json:"expiration"`
	Parties    string   `json:"parties"`
	LegalVenue string   `json:"legal_venue"`
	Risks      []AIRisk `json:"risks"`
}

type AIRisk struct {
	Title       string `json:"title"`
	Severity    string `json:"severity"`
	Explanation string `json:"explanation"`
	Clause      string `json:"clause"`
}

type AIClauseResult struct {
	Severity    string `json:"severity"`
	Title       string `json:"title"`
	Explanation string `json:"explanation"`
	Suggestion  string `json:"suggestion"`
}

type AIProvider interface {
	AnalyzeContract(ctx context.Context, text string) (*AIAnalysisResult, error)
	AnalyzeClause(ctx context.Context, text string) (*AIClauseResult, error)
	GenerateEmbedding(ctx context.Context, text string) ([]float32, error)
	Chat(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error)
	GlobalSearch(ctx context.Context, contextChunks []string, question string) (string, error)
	Compare(ctx context.Context, baseText, newText string) (string, error)
}

