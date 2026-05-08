package services

import (
	"context"
	"testing"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/repositories"
	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/ai"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type mockAI struct {
	result *ai.AnalysisResult
	err    error
}

func (m *mockAI) Analyze(ctx context.Context, text string) (*ai.AnalysisResult, error) {
	return m.result, m.err
}

func (m *mockAI) Chat(ctx context.Context, content string, history []models.ChatMessage, question string) (string, error) {
	return "Resposta mock para: " + question, nil
}

type mockExtractor struct {
	text string
	err  error
}

func (m *mockExtractor) Extract(data []byte) (string, error) {
	return m.text, m.err
}

type mockStorage struct {
	data []byte
	err  error
}

func (m *mockStorage) Upload(ctx context.Context, filename string, data []byte) (string, error) {
	return "mock/path/" + filename, nil
}

func (m *mockStorage) Download(ctx context.Context, path string) ([]byte, error) {
	return m.data, m.err
}

func (m *mockStorage) Delete(ctx context.Context, path string) error {
	return nil
}

func setupContractTestDB() repositories.Repository {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.User{}, &models.Note{})
	return repositories.NewGormRepository(db)
}

func TestAnalyzeContract(t *testing.T) {
	repo := setupContractTestDB()
	
	mockAI := &mockAI{
		result: &ai.AnalysisResult{
			IsContract: true,
			Summary:    "Resumo teste",
			Risks: []struct {
				Title       string `json:"title"`
				Severity    string `json:"severity"`
				Explanation string `json:"explanation"`
				Clause      string `json:"clause"`
			}{
				{Title: "Risco 1", Severity: "high", Explanation: "Explicação 1", Clause: "Cláusula 1"},
			},
		},
	}
	mockExt := &mockExtractor{text: "Conteúdo do contrato"}
	mockStor := &mockStorage{}
	
	service := NewContractService(repo, mockAI, mockExt, mockStor)
	
	// Setup user
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)

	contract, err := service.AnalyzeContract(context.Background(), user.ID, "contrato.pdf", []byte("pdf data"))
	
	assert.NoError(t, err)
	assert.NotNil(t, contract)
	assert.Equal(t, "contrato.pdf", contract.Filename)
	assert.Equal(t, "Resumo teste", contract.Summary)
	assert.Len(t, contract.Risks, 1)
	assert.Equal(t, "Risco 1", contract.Risks[0].Title)
}

func TestAnalyzeNonContract(t *testing.T) {
	repo := setupContractTestDB()
	
	mockAI := &mockAI{
		result: &ai.AnalysisResult{
			IsContract: false,
			Summary:    "Isso não é um contrato",
		},
	}
	mockExt := &mockExtractor{text: "Conteúdo de currículo"}
	mockStor := &mockStorage{}
	
	service := NewContractService(repo, mockAI, mockExt, mockStor)
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)

	_, err := service.AnalyzeContract(context.Background(), user.ID, "curriculo.pdf", []byte("pdf data"))
	
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "não parece ser um contrato válido")
}

func TestReanalyzeContract(t *testing.T) {
	repo := setupContractTestDB()
	
	// 1. Criar contrato inicial
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{
		UserID:   user.ID,
		Filename: "test.pdf",
		FilePath: "mock/path/test.pdf",
		Summary:  "Resumo Antigo",
		Risks: []models.Risk{
			{Title: "Risco Antigo", Severity: "low"},
		},
	}
	repo.Create(contract)

	// 2. Mock Nova Análise
	mockAI := &mockAI{
		result: &ai.AnalysisResult{
			IsContract: true,
			Summary:    "Resumo Novo",
			Risks: []struct {
				Title       string `json:"title"`
				Severity    string `json:"severity"`
				Explanation string `json:"explanation"`
				Clause      string `json:"clause"`
			}{
				{Title: "Risco Novo", Severity: "high", Explanation: "Explicação Nova"},
			},
		},
	}
	mockExt := &mockExtractor{text: "Conteúdo novo"}
	mockStor := &mockStorage{data: []byte("original data")}
	
	service := NewContractService(repo, mockAI, mockExt, mockStor)
	
	updated, err := service.ReanalyzeContract(context.Background(), contract.ID, user.ID)
	
	assert.NoError(t, err)
	assert.Equal(t, "Resumo Novo", updated.Summary)
	assert.Len(t, updated.Risks, 1)
	assert.Equal(t, "Risco Novo", updated.Risks[0].Title)
}

func TestExportAnalysis(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{
		UserID:   user.ID,
		Filename: "test.pdf",
		Slug:     "test-slug",
		Summary:  "Resumo para exportar",
		Risks: []models.Risk{
			{Title: "Risco 1", Severity: "high", Explanation: "Explicação 1"},
		},
	}
	repo.Create(contract)
	
	service := NewContractService(repo, nil, nil, nil)
	
	content, filename, err := service.ExportAnalysis(contract.ID, user.ID)
	
	assert.NoError(t, err)
	assert.Contains(t, filename, "test-slug")
	assert.Contains(t, content, "# Relatório de Análise: test.pdf")
	assert.Contains(t, content, "Resumo para exportar")
	assert.Contains(t, content, "### 1. 🔴 Risco 1")
}

func TestChat(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{
		UserID:   user.ID,
		Filename: "test.pdf",
		Slug:     "test-chat",
		Content:  "Conteúdo do contrato",
	}
	repo.Create(contract)
	
	mockAI := &mockAI{}
	service := NewContractService(repo, mockAI, nil, nil)
	
	answer, err := service.Chat(context.Background(), user.ID, "test-chat", "Qual o prazo?")
	
	assert.NoError(t, err)
	assert.Equal(t, "Resposta mock para: Qual o prazo?", answer)
}

func TestStats(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	repo.Create(&models.Contract{UserID: user.ID, Slug: "c1", Risks: []models.Risk{{Severity: "high"}}})
	repo.Create(&models.Contract{UserID: user.ID, Slug: "c2", Risks: []models.Risk{{Severity: "medium"}}})
	
	service := NewContractService(repo, nil, nil, nil)
	stats, err := service.GetStats(user.ID)
	
	assert.NoError(t, err)
	assert.Equal(t, 2, stats.TotalContracts)
	assert.Equal(t, 2, stats.TotalRisks)
	assert.Equal(t, 1, stats.HighRisks)
}

func TestAddNote(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{UserID: user.ID, Slug: "c1", Filename: "test.pdf"}
	repo.Create(contract)
	
	service := NewContractService(repo, nil, nil, nil)
	note, err := service.AddNote(user.ID, "c1", "Minha nota", "Texto selecionado", "yellow")
	
	assert.NoError(t, err)
	assert.NotNil(t, note)
	assert.Equal(t, "Minha nota", note.Content)
	assert.Equal(t, "yellow", note.Color)
}
