package adapters

import (
	"context"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/ai"
)

type GeminiAdapter struct{}

func (g *GeminiAdapter) AnalyzeContract(ctx context.Context, text string) (*services.AIAnalysisResult, error) {
	res, err := ai.AnalyzeContract(ctx, text)
	if err != nil {
		return nil, err
	}

	result := &services.AIAnalysisResult{
		IsContract: res.IsContract,
		Summary:    res.Summary,
		TotalValue: res.TotalValue,
		Expiration: res.Expiration,
		Parties:    res.Parties,
		LegalVenue: res.LegalVenue,
	}

	for _, r := range res.Risks {
		result.Risks = append(result.Risks, services.AIRisk{
			Title:       r.Title,
			Severity:    r.Severity,
			Explanation: r.Explanation,
			Clause:      r.Clause,
		})
	}

	return result, nil
}

func (g *GeminiAdapter) AnalyzeClause(ctx context.Context, text string) (*services.AIClauseResult, error) {
	res, err := ai.AnalyzeClause(ctx, text)
	if err != nil {
		return nil, err
	}

	return &services.AIClauseResult{
		Severity:    res.Severity,
		Title:       res.Title,
		Explanation: res.Explanation,
		Suggestion:  res.Suggestion,
	}, nil
}

func (g *GeminiAdapter) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	return ai.GenerateEmbedding(ctx, text)
}

func (g *GeminiAdapter) Compare(ctx context.Context, baseText, newText string) (string, error) {
	return ai.CompareContracts(ctx, baseText, newText)
}

func (g *GeminiAdapter) Chat(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error) {
	return ai.ChatWithContract(ctx, contextChunks, history, question)
}

func (g *GeminiAdapter) GlobalSearch(ctx context.Context, contextChunks []string, question string) (string, error) {
	return ai.GlobalSearchChat(ctx, contextChunks, question)
}
