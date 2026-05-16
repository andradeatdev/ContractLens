package services

import (
	"context"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
)

// FileStorage é o Port para persistência de arquivos (Arquitetura Hexagonal)
type FileStorage interface {
	Upload(ctx context.Context, filename string, data []byte) (string, error)
	Download(ctx context.Context, path string) ([]byte, error)
	Delete(ctx context.Context, path string) error
}

type AIAnalysisResult struct {
	IsContract bool
	Summary    string
	TotalValue string
	Expiration string
	Parties    string
	LegalVenue string
	Risks      []AIRisk
}

type AIRisk struct {
	Title       string
	Severity    string
	Explanation string
	Clause      string
}

type AIClauseResult struct {
	Severity    string
	Title       string
	Explanation string
	Suggestion  string
}

type AIProvider interface {
	AnalyzeContract(ctx context.Context, text string) (*AIAnalysisResult, error)
	AnalyzeClause(ctx context.Context, text string) (*AIClauseResult, error)
	GenerateEmbedding(ctx context.Context, text string) ([]float32, error)
	Chat(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error)
	GlobalSearch(ctx context.Context, contextChunks []string, question string) (string, error)
	Compare(ctx context.Context, baseText, newText string) (string, error)
}

