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
	IsContract bool   `json:"is_contract"`
	Summary    string `json:"summary"`
	TotalValue string `json:"total_value"`
	Expiration string `json:"expiration"`
	Parties    string `json:"parties"`
	LegalVenue string `json:"legal_venue"`
	Risks      []struct {
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
	defer func() { _ = client.Close() }()

	model := client.GenerativeModel("gemini-2.5-flash-lite")
	
	prompt := fmt.Sprintf(`Você é um especialista jurídico. Sua tarefa é analisar o documento fornecido.
Primeiro, determine se o documento é um contrato (ex: contrato de aluguel, termos de serviço, NDA, contrato de trabalho, contrato de prestação de serviços, etc.).
Se NÃO for um contrato (ex: currículo, carta pessoal, código de programação, receita, poema), defina "is_contract" como false.

Responda APENAS em formato JSON com a seguinte estrutura:
{
  "is_contract": true|false,
  "summary": "resumo aqui (ou aviso que não é um contrato)",
  "total_value": "valor total do contrato ou 'não especificado'",
  "expiration": "data de vencimento ou vigência ou 'indeterminado'",
  "parties": "nome das partes envolvidas (ex: Empresa A e Empresa B)",
  "legal_venue": "foro de eleição / cidade para disputas judiciais",
  "risks": [
    {
      "title": "título do risco",
      "severity": "low|medium|high",
      "explanation": "explicação detalhada",
      "clause": "trecho da cláusula original"
    }
  ]
}

Se "is_contract" for false, o campo "summary" deve explicar brevemente por que não foi identificado como um contrato e o array "risks" deve ser vazio.

Texto do documento:
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

func GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, err
	}
	defer func() { _ = client.Close() }()

	// Usa o modelo de embedding mais recente e otimizado
	model := client.EmbeddingModel("text-embedding-004")
	res, err := model.EmbedContent(ctx, genai.Text(text))
	if err != nil {
		return nil, err
	}

	return res.Embedding.Values, nil
}

func ChatWithContract(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer func() { _ = client.Close() }()

	model := client.GenerativeModel("gemini-2.5-flash-lite")

	// Adicionar contexto recuperado (RAG)
	contextContent := strings.Join(contextChunks, "\n---\n")
	systemPrompt := fmt.Sprintf(`Você é um assistente jurídico especializado em analisar contratos. 
DIRETRIZES RÍGIDAS DE SEGURANÇA E ESCOPO:
1. Use APENAS os trechos relevantes do contrato abaixo como base para suas respostas.
2. Você deve responder EXCLUSIVAMENTE sobre temas relacionados a este contrato (cláusulas, obrigações, riscos, prazos, etc.).
3. Se o usuário fizer perguntas fora do contexto do contrato (ex: contar números, piadas, conhecimentos gerais, programação, etc.), responda educadamente que você foi projetado apenas para analisar este contrato específico e não pode responder a outros temas.
4. Nunca saia do personagem de assistente de análise contratual.

TRECHOS RELEVANTES DO CONTRATO RECUPERADOS:
%s`, contextContent)

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

func CompareContracts(ctx context.Context, baseText, newText string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer func() { _ = client.Close() }()

	model := client.GenerativeModel("gemini-2.5-flash-lite")

	prompt := fmt.Sprintf(`Você é um especialista em auditoria contratual. Sua tarefa é comparar dois contratos e identificar as diferenças críticas.

CONTRATO BASE (Versão Original):
---
%s
---

NOVO CONTRATO (Versão para Comparação):
---
%s
---

Gere um relatório detalhado em Markdown comparando os dois documentos. Foque em:
1. **Cláusulas Alteradas:** O que mudou significativamente?
2. **Novos Riscos:** Existem novas obrigações ou multas que não estavam no original?
3. **Cláusulas Removidas:** O que foi retirado que pode ser prejudicial?
4. **Veredito:** O novo contrato é mais ou menos arriscado que o original?

Responda em Português do Brasil com um tom profissional e objetivo.`, baseText, newText)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, err
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

func GlobalSearchChat(ctx context.Context, contextChunks []string, question string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("GEMINI_API_KEY not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", err
	}
	defer func() { _ = client.Close() }()

	model := client.GenerativeModel("gemini-2.5-flash-lite")

	contextContent := strings.Join(contextChunks, "\n---\n")
	prompt := fmt.Sprintf(`Você é um assistente inteligente de gestão de contratos. Sua tarefa é responder perguntas baseando-se em TODOS os contratos do usuário.

TRECHOS RELEVANTES DOS CONTRATOS ENCONTRADOS:
---
%s
---

PERGUNTA DO USUÁRIO: %s

Instruções:
1. Responda de forma clara e objetiva.
2. Identifique de qual contrato a informação veio (ex: "No contrato [Nome], a cláusula X diz...").
3. Se a informação não estiver presente nos trechos fornecidos, diga que não encontrou essa informação nos contratos analisados.
4. Use Português do Brasil.`, contextContent, question)

	resp, err := model.GenerateContent(ctx, genai.Text(prompt))
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
