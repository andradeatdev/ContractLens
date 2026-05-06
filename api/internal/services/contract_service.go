package services

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"github.com/andradeatdev/ai_contract_analyzer/api/internal/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/ai"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/pdf"
)

type ContractService struct {
	repo *repositories.ContractRepository
}

func NewContractService(repo *repositories.ContractRepository) *ContractService {
	return &ContractService{repo: repo}
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
	rand.Read(b)
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
	text, err := pdf.ExtractText(pdfData)
	if err != nil {
		return nil, fmt.Errorf("pdf extraction error: %w", err)
	}

	// 2. Análise de IA
	analysis, err := ai.AnalyzeContract(ctx, text)
	if err != nil {
		return nil, fmt.Errorf("ai analysis error: %w", err)
	}

	// 3. Salvar PDF no Disco (Abordagem Profissional)
	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create uploads directory: %w", err)
	}

	// Gerar nome único para evitar sobrescrita
	uniqueFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filename)
	filePath := filepath.Join(uploadDir, uniqueFilename)

	if err := os.WriteFile(filePath, pdfData, 0644); err != nil {
		return nil, fmt.Errorf("failed to save pdf to disk: %w", err)
	}

	// 4. Montar Modelo
	contract := &models.Contract{
		UserID:   userID,
		Slug:     s.GenerateSlugPublic(filename),
		Filename: filename,
		FilePath: filePath,
		Content:  text,
		Summary:  analysis.Summary,
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
		return nil, fmt.Errorf("repository error: %w", err)
	}

	return contract, nil
}

func (s *ContractService) Chat(ctx context.Context, userID uint, contractSlug string, question string) (string, error) {
	// 1. Buscar contrato pelo slug (verificando dono)
	contract, err := s.repo.GetBySlug(contractSlug, userID)
	if err != nil {
		return "", fmt.Errorf("contract not found: %w", err)
	}

	// 2. Buscar histórico de mensagens (verificando dono)
	history, err := s.repo.GetMessagesByContractID(contract.ID, userID)
	if err != nil {
		return "", fmt.Errorf("failed to get history: %w", err)
	}

	// 3. Salvar pergunta do usuário
	userMsg := &models.ChatMessage{
		ContractID: contract.ID,
		Role:       "user",
		Message:    question,
	}
	s.repo.CreateMessage(userMsg)

	// 4. Chamar IA
	answer, err := ai.ChatWithContract(ctx, contract.Content, history, question)
	if err != nil {
		return "", fmt.Errorf("ai chat error: %w", err)
	}

	// 5. Salvar resposta da IA
	aiMsg := &models.ChatMessage{
		ContractID: contract.ID,
		Role:       "assistant",
		Message:    answer,
	}
	s.repo.CreateMessage(aiMsg)

	return answer, nil
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

func (s *ContractService) DeleteContract(id uint, userID uint) error {
	contract, err := s.repo.GetByID(id, userID)
	if err != nil {
		return err
	}
	if contract.FilePath != "" {
		// Remover arquivo físico ao excluir do banco
		os.Remove(contract.FilePath)
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
