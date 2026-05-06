package ai

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AnalysisResult struct {
	Summary string `json:"summary"`
	Risks   []struct {
		Title       string `json:"title"`
		Severity    string `json:"severity"`
		Explanation string `json:"explanation"`
		Clause      string `json:"clause"`
	} `json:"risks"`
}

func AnalyzeContract(ctx context.Context, contractText string) (*AnalysisResult, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash-lite")
	
	prompt := fmt.Sprintf(`Analise o seguinte contrato e forneça um resumo em linguagem simples e uma lista de riscos potenciais (cláusulas abusivas, multas altas, obrigações críticas).
Responda APENAS em formato JSON com a seguinte estrutura:
{
  "summary": "resumo aqui",
  "risks": [
    {
      "title": "título do risco",
      "severity": "low|medium|high",
      "explanation": "explicação detalhada",
      "clause": "trecho da cláusula original"
    }
  ]
}

Texto do contrato:
%s`, contractText)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
	}

	if len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil {
		return nil, fmt.Errorf("empty response from AI")
	}

	var jsonStr string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			jsonStr += string(text)
		}
	}

	cleanedJSON := cleanJSONResponse(jsonStr)
	log.Printf("Cleaned AI JSON: %s", cleanedJSON)

	var analysis AnalysisResult
	if err := json.Unmarshal([]byte(cleanedJSON), &analysis); err != nil {
		log.Printf("Unmarshal error: %v. AI output was: %s", err, jsonStr)
		return nil, fmt.Errorf("failed to parse AI response: %v", err)
	}

	return &analysis, nil
}

func ChatWithContract(ctx context.Context, contractContent string, history []models.ChatMessage, question string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.5-flash-lite")

	// Adicionar contexto do contrato como instrução de sistema ou mensagem inicial
	systemPrompt := fmt.Sprintf(`Você é um assistente jurídico especializado em analisar contratos. 
DIRETRIZES RÍGIDAS DE SEGURANÇA E ESCOPO:
1. Use APENAS o conteúdo do contrato abaixo como base para suas respostas.
2. Você deve responder EXCLUSIVAMENTE sobre temas relacionados a este contrato (cláusulas, obrigações, riscos, prazos, etc.).
3. Se o usuário fizer perguntas fora do contexto do contrato (ex: contar números, piadas, conhecimentos gerais, programação, etc.), responda educadamente que você foi projetado apenas para analisar este contrato específico e não pode responder a outros temas.
4. Nunca saia do personagem de assistente de análise contratual.

CONTEÚDO DO CONTRATO:
%s`, contractContent)

	finalPrompt := fmt.Sprintf("%s\n\nHistórico de conversa:\n", systemPrompt)
	for _, msg := range history {
		finalPrompt += fmt.Sprintf("%s: %s\n", msg.Role, msg.Message)
	}
	finalPrompt += fmt.Sprintf("Usuário: %s\nAssistente:", question)

	resp, err := model.GenerateContent(ctx, genai.Text(finalPrompt))
	if err != nil {
		return "", err
	}

	if len(resp.Candidates) == 0 || resp.Candidates[0].Content == nil {
		return "", fmt.Errorf("empty response from AI")
	}

	var responseText string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			responseText += string(text)
		}
	}

	return responseText, nil
}

func cleanJSONResponse(s string) string {
	s = strings.TrimSpace(s)
	// Handle markdown blocks
	if i := strings.Index(s, "```json"); i != -1 {
		s = s[i+7:]
		if j := strings.Index(s, "```"); j != -1 {
			s = s[:j]
		}
	} else if i := strings.Index(s, "```"); i != -1 {
		s = s[i+3:]
		if j := strings.Index(s, "```"); j != -1 {
			s = s[:j]
		}
	}

	start := strings.Index(s, "{")
	end := strings.LastIndex(s, "}")
	
	if start == -1 || end == -1 || start >= end {
		return strings.TrimSpace(s)
	}
	return strings.TrimSpace(s[start : end+1])
}
