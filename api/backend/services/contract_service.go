package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/ai"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/pdf"
	"github.com/pgvector/pgvector-go"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type AIAnalyzer interface {
	Analyze(ctx context.Context, text string) (*ai.AnalysisResult, error)
	Chat(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error)
	GenerateEmbedding(ctx context.Context, text string) ([]float32, error)
	Compare(ctx context.Context, baseText, newText string) (string, error)
	GlobalSearch(ctx context.Context, contextChunks []string, question string) (string, error)
}

type GeminiAnalyzer struct{}

func (g *GeminiAnalyzer) Analyze(ctx context.Context, text string) (*ai.AnalysisResult, error) {
	return ai.AnalyzeContract(ctx, text)
}

func (g *GeminiAnalyzer) Chat(ctx context.Context, contextChunks []string, history []models.ChatMessage, question string) (string, error) {
	return ai.ChatWithContract(ctx, contextChunks, history, question)
}

func (g *GeminiAnalyzer) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	return ai.GenerateEmbedding(ctx, text)
}

func (g *GeminiAnalyzer) Compare(ctx context.Context, baseText, newText string) (string, error) {
	return ai.CompareContracts(ctx, baseText, newText)
}

func (g *GeminiAnalyzer) GlobalSearch(ctx context.Context, contextChunks []string, question string) (string, error) {
	return ai.GlobalSearchChat(ctx, contextChunks, question)
}

type FileStorage interface {
	Extract(data []byte) (string, error)
}

type PDFExtractor struct{}

func (p *PDFExtractor) Extract(data []byte) (string, error) {
	return pdf.ExtractText(data)
}

type ContractService struct {
	repo      repositories.Repository
	ai        AIAnalyzer
	extractor TextExtractor
	storage   FileStorage
}

func NewContractService(repo repositories.Repository, analyzer AIAnalyzer, extractor TextExtractor, storage FileStorage) *ContractService {
	if analyzer == nil {
		analyzer = &GeminiAnalyzer{}
	}
	if extractor == nil {
		extractor = &PDFExtractor{}
	}
	if storage == nil {
		storage = &LocalStorageAdapter{UploadDir: "uploads"}
	}
	return &ContractService{repo: repo, ai: analyzer, extractor: extractor, storage: storage}
}

func (s *ContractService) GenerateSlugPublic(filename string) string {
	// Remove extensao
	name := strings.TrimSuffix(filename, filepath.Ext(filename))

	// Lowercase e remove caracteres especiais
	reg, _ := regexp.Compile("[^a-zA-Z0-9]+")
	slug := reg.ReplaceAllString(strings.ToLower(name), "-")
	slug = strings.Trim(slug, "-")

	// Gerar sufixo aleatorio de 4 chars
	b := make([]byte, 2)
	if _, err := rand.Read(b); err != nil {
		// Fallback para timestamp se rand falhar (improvável)
		suffix := fmt.Sprintf("%x", time.Now().UnixNano())
		if len(suffix) > 4 {
			suffix = suffix[len(suffix)-4:]
		}
		return fmt.Sprintf("%s-%s", slug, suffix)
	}
	suffix := hex.EncodeToString(b)

	finalSlug := fmt.Sprintf("%s-%s", slug, suffix)

	// Garante que é único (recursivo se necessário, embora improvável com 4 chars)
	if s.repo.IsSlugTaken(finalSlug) {
		return s.GenerateSlugPublic(filename)
	}

	return finalSlug
}

func (s *ContractService) AnalyzeContract(ctx context.Context, userID uint, filename string, pdfData []byte) (*models.Contract, error) {
	// 1. Extração de Texto
	text, err := s.extractor.Extract(pdfData)
	if err != nil {
		return nil, fmt.Errorf("Erro ao extrair texto do PDF: %w", err)
	}

	// 2. Análise de IA
	analysis, err := s.ai.Analyze(ctx, text)
	if err != nil {
		return nil, fmt.Errorf("Erro na análise da IA: %w", err)
	}

	// 2.1 Verificar se é um contrato
	if !analysis.IsContract {
		return nil, fmt.Errorf("O documento enviado não parece ser um contrato válido. %s", analysis.Summary)
	}

	// 3. Salvar PDF usando o Adapter (Arquitetura Hexagonal)
	filePath, err := s.storage.Upload(ctx, filename, pdfData)
	if err != nil {
		return nil, fmt.Errorf("Falha ao salvar PDF: %w", err)
	}

	// 4. Montar Modelo
	contract := &models.Contract{
		UserID:   userID,
		Slug:     s.GenerateSlugPublic(filename),
		Filename: filename,
		FilePath: filePath,
		Content:  text,
		Summary:  analysis.Summary,
		TotalValue: analysis.TotalValue,
		Expiration: analysis.Expiration,
		Parties:    analysis.Parties,
		LegalVenue: analysis.LegalVenue,
	}

	for _, r := range analysis.Risks {
		contract.Risks = append(contract.Risks, models.Risk{
			Title:       r.Title,
			Severity:    r.Severity,
			Explanation: r.Explanation,
			Clause:      r.Clause,
		})
	}

	// 5. Salvar no Banco
	if err := s.repo.Create(contract); err != nil {
		return nil, fmt.Errorf("Erro no repositório: %w", err)
	}

	// 6. Processar Chunks para RAG
	go s.processChunks(context.Background(), contract.ID, text)

	return contract, nil
}

func (s *ContractService) processChunks(ctx context.Context, contractID uint, text string) {
	chunks := s.chunkText(text, 1000, 200)
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

	if err := s.repo.CreateChunks(documentChunks); err != nil {
		log.Printf("Error: Falha ao salvar chunks no banco: %v", err)
	}
}

func (s *ContractService) chunkText(text string, chunkSize int, overlap int) []string {
	var chunks []string
	if len(text) == 0 {
		return chunks
	}

	// Simplificação: quebra por caracteres (em produção, tokens seriam ideais)
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

func (s *ContractService) ReanalyzeContract(ctx context.Context, id uint, userID uint) (*models.Contract, error) {
	// 1. Buscar contrato
	contract, err := s.repo.GetByID(id, userID)
	if err != nil {
		return nil, fmt.Errorf("Contrato não encontrado: %w", err)
	}

	// 2. Ler arquivo original usando o adapter
	pdfData, err := s.storage.Download(ctx, contract.FilePath)
	if err != nil {
		return nil, fmt.Errorf("Falha ao ler arquivo original: %w", err)
	}

	// 3. Extração de Texto
	text, err := s.extractor.Extract(pdfData)
	if err != nil {
		return nil, fmt.Errorf("Erro ao extrair texto do PDF: %w", err)
	}

	// 4. Análise de IA
	analysis, err := s.ai.Analyze(ctx, text)
	if err != nil {
		return nil, fmt.Errorf("Erro na análise da IA: %w", err)
	}

	// 4.1 Verificar se é um contrato
	if !analysis.IsContract {
		return nil, fmt.Errorf("O documento não foi reconhecido como um contrato na reanálise.")
	}

	// 5. Limpar riscos e chunks antigos
	if err := s.repo.DeleteRisksByContractID(contract.ID); err != nil {
		return nil, fmt.Errorf("Erro ao limpar riscos antigos: %w", err)
	}
	if err := s.repo.DeleteChunksByContractID(contract.ID); err != nil {
		log.Printf("Warning: Falha ao limpar chunks antigos: %v", err)
	}

	// 6. Atualizar Modelo
	contract.Summary = analysis.Summary
	contract.Content = text
	contract.Risks = []models.Risk{} // Reset para o GORM salvar os novos

	for _, r := range analysis.Risks {
		contract.Risks = append(contract.Risks, models.Risk{
			ContractID:  contract.ID,
			Title:       r.Title,
			Severity:    r.Severity,
			Explanation: r.Explanation,
			Clause:      r.Clause,
		})
	}

	// 7. Salvar no Banco
	if err := s.repo.Update(contract); err != nil {
		return nil, fmt.Errorf("Erro ao salvar atualização: %w", err)
	}

	// 8. Processar novos Chunks para RAG
	go s.processChunks(context.Background(), contract.ID, text)

	return contract, nil
}

func (s *ContractService) ExportAnalysis(id uint, userID uint) (string, string, error) {
	contract, err := s.repo.GetByID(id, userID)
	if err != nil {
		return "", "", fmt.Errorf("Contrato não encontrado: %w", err)
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("# Relatório de Análise: %s\n\n", contract.Filename))
	sb.WriteString(fmt.Sprintf("**Data da Análise:** %s\n\n", contract.UpdatedAt.Format("02/01/2006 15:04")))
	
	sb.WriteString("## Resumo Executivo\n")
	sb.WriteString(contract.Summary + "\n\n")

	sb.WriteString("## Pontos de Atenção Identificados\n\n")
	if len(contract.Risks) == 0 {
		sb.WriteString("Nenhum risco crítico foi identificado nesta análise.\n")
	} else {
		for i, r := range contract.Risks {
			severityEmoji := "🟢"
			if r.Severity == "high" {
				severityEmoji = "🔴"
			} else if r.Severity == "medium" {
				severityEmoji = "🟡"
			}
			
			sb.WriteString(fmt.Sprintf("### %d. %s %s\n", i+1, severityEmoji, r.Title))
			sb.WriteString(fmt.Sprintf("**Gravidade:** %s\n\n", cases.Title(language.BrazilianPortuguese).String(r.Severity)))
			sb.WriteString(fmt.Sprintf("**Explicação:** %s\n\n", r.Explanation))
			if r.Clause != "" {
				sb.WriteString("**Cláusula de referência:**\n")
				sb.WriteString(fmt.Sprintf("> \"%s\"\n\n", r.Clause))
			}
			sb.WriteString("---\n\n")
		}
	}

	sb.WriteString("\n*Relatório gerado automaticamente por Contract Lens AI.*")

	return sb.String(), fmt.Sprintf("analise_%s.md", contract.Slug), nil
}

func (s *ContractService) Chat(ctx context.Context, userID uint, contractSlug string, question string) (string, error) {
	// 1. Buscar contrato pelo slug (verificando dono)
	contract, err := s.repo.GetBySlug(contractSlug, userID)
	if err != nil {
		return "", fmt.Errorf("Contrato não encontrado: %w", err)
	}

	// 2. Buscar histórico de mensagens (verificando dono)
	history, err := s.repo.GetMessagesByContractID(contract.ID, userID)
	if err != nil {
		return "", fmt.Errorf("Falha ao buscar histórico: %w", err)
	}

	// 3. Salvar pergunta do usuário
	userMsg := &models.ChatMessage{
		ContractID: contract.ID,
		Role:       "user",
		Message:    question,
	}
	if err := s.repo.CreateMessage(userMsg); err != nil {
		log.Printf("Warning: Falha ao salvar mensagem do usuário: %v", err)
	}

	// 4. RAG: Gerar embedding da pergunta e buscar trechos relevantes
	questionEmbedding, err := s.ai.GenerateEmbedding(ctx, question)
	if err != nil {
		return "", fmt.Errorf("Erro ao gerar embedding da pergunta: %w", err)
	}

	similarChunks, err := s.repo.SearchSimilarChunks(contract.ID, questionEmbedding, 5)
	if err != nil {
		log.Printf("Warning: Falha na busca semântica, usando conteúdo total como fallback: %v", err)
	}

	var contextChunks []string
	if len(similarChunks) > 0 {
		for _, chunk := range similarChunks {
			contextChunks = append(contextChunks, chunk.Content)
		}
	} else {
		// Fallback se não houver chunks (contrato pequeno ou erro no processamento anterior)
		contextChunks = []string{contract.Content}
	}

	// 5. Chamar IA com o contexto recuperado
	answer, err := s.ai.Chat(ctx, contextChunks, history, question)
	if err != nil {
		return "", fmt.Errorf("Erro no chat com IA: %w", err)
	}

	// 6. Salvar resposta da IA
	aiMsg := &models.ChatMessage{
		ContractID: contract.ID,
		Role:       "assistant",
		Message:    answer,
	}
	if err := s.repo.CreateMessage(aiMsg); err != nil {
		log.Printf("Warning: Falha ao salvar mensagem da IA: %v", err)
	}

	return answer, nil
}

func (s *ContractService) AddNote(userID uint, contractSlug string, content string, selectedText string, color string) (*models.Note, error) {
	// 1. Buscar contrato pelo slug (verificando dono)
	contract, err := s.repo.GetBySlug(contractSlug, userID)
	if err != nil {
		return nil, fmt.Errorf("Contrato não encontrado: %w", err)
	}

	// 2. Criar nota
	note := &models.Note{
		ContractID:   contract.ID,
		Content:      content,
		SelectedText: selectedText,
		Color:        color,
	}

	if err := s.repo.CreateNote(note); err != nil {
		return nil, fmt.Errorf("Falha ao salvar nota: %w", err)
	}

	return note, nil
}

func (s *ContractService) RemoveNote(id uint, userID uint) error {
	return s.repo.DeleteNote(id, userID)
}

func (s *ContractService) ListContracts(userID uint) ([]models.Contract, error) {
	return s.repo.List(userID)
}

func (s *ContractService) GetContractByID(id uint, userID uint) (*models.Contract, error) {
	return s.repo.GetByID(id, userID)
}

func (s *ContractService) GetContractBySlug(slug string, userID uint) (*models.Contract, error) {
	return s.repo.GetBySlug(slug, userID)
}

func (s *ContractService) UpdateContract(id uint, userID uint, filename string) error {
	contract, err := s.repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	contract.Filename = filename
	return s.repo.Update(contract)
}

func (s *ContractService) DownloadFile(ctx context.Context, path string) ([]byte, error) {
	return s.storage.Download(ctx, path)
}

func (s *ContractService) DeleteContract(id uint, userID uint) error {
	contract, err := s.repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	if contract.FilePath != "" {
		// Remover arquivo usando o adapter
		if err := s.storage.Delete(context.Background(), contract.FilePath); err != nil {
			// Log error but continue as DB record is already deleted
			fmt.Printf("erro ao deletar arquivo: %v\n", err)
		}
	}
	return s.repo.Delete(id, userID)
}

func (s *ContractService) GetUser(id uint) (*models.User, error) {
	return s.repo.GetUser(id)
}

func (s *ContractService) UpdateUser(user *models.User) error {
	return s.repo.UpdateUser(user)
}

type DashboardStats struct {
	TotalContracts int `json:"total_contracts"`
	TotalRisks     int `json:"total_risks"`
	HighRisks      int `json:"high_risks"`
}

func (s *ContractService) GetStats(userID uint) (*DashboardStats, error) {
	contracts, err := s.repo.List(userID)
	if err != nil {
		return nil, err
	}

	stats := &DashboardStats{
		TotalContracts: len(contracts),
	}

	for _, c := range contracts {
		stats.TotalRisks += len(c.Risks)
		for _, r := range c.Risks {
			if r.Severity == "high" {
				stats.HighRisks++
			}
		}
	}

	return stats, nil
}

type ActivityItem struct {
	ID           uint      `json:"id"`
	ContractID   uint      `json:"contract_id"`
	ContractSlug string    `json:"contract_slug"`
	Action       string    `json:"action"`
	Target       string    `json:"target"`
	Time         time.Time `json:"time"`
}

func (s *ContractService) ListActivity(userID uint) ([]ActivityItem, error) {
	contracts, err := s.repo.List(userID)
	if err != nil {
		return nil, err
	}

	messages, err := s.repo.GetLatestMessages(userID, 20)
	if err != nil {
		return nil, err
	}

	items := []ActivityItem{}

	for _, c := range contracts {
		items = append(items, ActivityItem{
			ID:           c.ID,
			ContractID:   c.ID,
			ContractSlug: c.Slug,
			Action:       "Análise concluída",
			Target:       c.Filename,
			Time:         c.CreatedAt,
		})
	}

	for _, m := range messages {
		if m.Role == "user" {
			target := m.Message
			if len(target) > 50 {
				target = target[:47] + "..."
			}

			// Localizar o slug do contrato correspondente
			var contractSlug string
			for _, c := range contracts {
				if c.ID == m.ContractID {
					contractSlug = c.Slug
					break
				}
			}

			items = append(items, ActivityItem{
				ID:           m.ID,
				ContractID:   m.ContractID,
				ContractSlug: contractSlug,
				Action:       "Pergunta via chat",
				Target:       target,
				Time:         m.CreatedAt,
			})
		}
	}


	sort.Slice(items, func(i, j int) bool {
		return items[i].Time.After(items[j].Time)
	})

	if len(items) > 20 {
		items = items[:20]
	}

	return items, nil
}

func (s *ContractService) CompareContracts(ctx context.Context, userID uint, baseContractID uint, newPDFData []byte) (string, error) {
	// 1. Obter contrato base
	baseContract, err := s.repo.GetByID(baseContractID, userID)
	if err != nil {
		return "", fmt.Errorf("contrato base não encontrado: %w", err)
	}

	// 2. Extrair texto do novo PDF
	newText, err := s.extractor.Extract(newPDFData)
	if err != nil {
		return "", fmt.Errorf("erro ao extrair texto do novo PDF: %w", err)
	}

	// 3. Chamar IA para comparação
	report, err := s.ai.Compare(ctx, baseContract.Content, newText)
	if err != nil {
		return "", fmt.Errorf("erro na comparação da IA: %w", err)
	}

	return report, nil
}

func (s *ContractService) SearchGlobal(ctx context.Context, userID uint, question string) (string, error) {
	// 1. Gerar embedding da pergunta
	questionEmbedding, err := s.ai.GenerateEmbedding(ctx, question)
	if err != nil {
		return "", fmt.Errorf("erro ao gerar embedding da pergunta: %w", err)
	}

	// 2. Busca vetorial global (cross-contract)
	similarChunks, err := s.repo.SearchSimilarChunksGlobal(userID, questionEmbedding, 8)
	if err != nil {
		return "", fmt.Errorf("erro na busca semântica global: %w", err)
	}

	// 3. Preparar contexto com identificação da fonte
	var contextChunks []string
	for _, chunk := range similarChunks {
		filename := "Contrato Desconhecido"
		if chunk.Contract.Filename != "" {
			filename = chunk.Contract.Filename
		}
		contextChunks = append(contextChunks, fmt.Sprintf("[Fonte: %s]\n%s", filename, chunk.Content))
	}

	if len(contextChunks) == 0 {
		return "Não encontrei nenhuma informação relevante nos seus contratos para responder a essa pergunta.", nil
	}

	// 4. Chamar IA para consolidar resposta
	answer, err := s.ai.GlobalSearch(ctx, contextChunks, question)
	if err != nil {
		return "", fmt.Errorf("erro ao processar busca global com IA: %w", err)
	}

	return answer, nil
}
