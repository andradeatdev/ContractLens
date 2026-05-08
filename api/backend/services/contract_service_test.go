package services

import (
	"context"
	"os"
	"path/filepath"
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

func setupContractTestDB() *repositories.ContractRepository {
	db, _ := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	db.AutoMigrate(&models.Contract{}, &models.Risk{}, &models.ChatMessage{}, &models.User{}, &models.Note{})
	return repositories.NewContractRepository(db)
}

func TestAnalyzeContract(t *testing.T) {
	repo := setupContractTestDB()
	
	mockAI := &mockAI{
		result: &ai.AnalysisResult{
			Summary: "Resumo teste",
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
	
	service := NewContractService(repo, mockAI, mockExt)
	
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
	
	// Limpeza do arquivo de teste
	if contract.FilePath != "" {
		os.Remove(contract.FilePath)
	}
}

func TestReanalyzeContract(t *testing.T) {
	repo := setupContractTestDB()
	
	// 1. Criar contrato inicial
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	// Simular arquivo no disco
	tmpDir := t.TempDir()
	filePath := filepath.Join(tmpDir, "test.pdf")
	os.WriteFile(filePath, []byte("original data"), 0644)
	
	contract := &models.Contract{
		UserID: user.ID,
		Filename: "test.pdf",
		FilePath: filePath,
		Summary: "Resumo Antigo",
		Risks: []models.Risk{
			{Title: "Risco Antigo", Severity: "low"},
		},
	}
	repo.Create(contract)

	// 2. Mock Nova Análise
	mockAI := &mockAI{
		result: &ai.AnalysisResult{
			Summary: "Resumo Novo",
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
	
	service := NewContractService(repo, mockAI, mockExt)
	
	updated, err := service.ReanalyzeContract(context.Background(), contract.ID, user.ID)
	
	assert.NoError(t, err)
	assert.Equal(t, "Resumo Novo", updated.Summary)
	assert.Len(t, updated.Risks, 1)
	assert.Equal(t, "Risco Novo", updated.Risks[0].Title)
	
	// Verificar se o risco antigo foi removido do banco
	repo.GetByID(contract.ID, user.ID) // Recarrega
}

func TestExportAnalysis(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{
		UserID: user.ID,
		Filename: "test.pdf",
		Slug: "test-slug",
		Summary: "Resumo para exportar",
		Risks: []models.Risk{
			{Title: "Risco 1", Severity: "high", Explanation: "Explicação 1"},
		},
	}
	repo.Create(contract)
	
	service := NewContractService(repo, nil, nil)
	
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
		UserID: user.ID,
		Filename: "test.pdf",
		Slug: "test-chat",
		Content: "Conteúdo do contrato",
	}
	repo.Create(contract)
	
	mockAI := &mockAI{}
	service := NewContractService(repo, mockAI, nil)
	
	answer, err := service.Chat(context.Background(), user.ID, "test-chat", "Qual o prazo?")
	
	assert.NoError(t, err)
	assert.Equal(t, "Resposta mock para: Qual o prazo?", answer)
	
	// Verificar se as mensagens foram salvas
	messages, err := repo.GetMessagesByContractID(contract.ID, user.ID)
	assert.NoError(t, err)
	assert.Len(t, messages, 2)
	assert.Equal(t, "user", messages[0].Role)
	assert.Equal(t, "assistant", messages[1].Role)
}

func TestStats(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	// Criar contratos com diferentes riscos
	repo.Create(&models.Contract{UserID: user.ID, Slug: "c1", Risks: []models.Risk{{Severity: "high"}}})
	repo.Create(&models.Contract{UserID: user.ID, Slug: "c2", Risks: []models.Risk{{Severity: "medium"}}})
	
	service := NewContractService(repo, nil, nil)
	stats, err := service.GetStats(user.ID)
	
	assert.NoError(t, err)
	assert.Equal(t, 2, stats.TotalContracts)
	assert.Equal(t, 2, stats.TotalRisks)
	assert.Equal(t, 1, stats.HighRisks)
}

func TestActivity(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{UserID: user.ID, Slug: "c1", Filename: "test.pdf"}
	repo.Create(contract)
	repo.CreateMessage(&models.ChatMessage{ContractID: contract.ID, Role: "user", Message: "Oi"})
	
	service := NewContractService(repo, nil, nil)
	activities, err := service.ListActivity(user.ID)
	
	assert.NoError(t, err)
	// Deve ter o upload do contrato e a mensagem no chat
	assert.GreaterOrEqual(t, len(activities), 2)
}

func TestAddNote(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{UserID: user.ID, Slug: "c1", Filename: "test.pdf"}
	repo.Create(contract)
	
	service := NewContractService(repo, nil, nil)
	note, err := service.AddNote(user.ID, "c1", "Minha nota", "Texto selecionado", "yellow")
	
	assert.NoError(t, err)
	assert.NotNil(t, note)
	assert.Equal(t, "Minha nota", note.Content)
	assert.Equal(t, "yellow", note.Color)
	
	// Verificar se foi preloada no contrato
	c, _ := repo.GetBySlug("c1", user.ID)
	assert.Len(t, c.Notes, 1)
}

func TestRemoveNote(t *testing.T) {
	repo := setupContractTestDB()
	user := &models.User{Name: "Test User", Email: "test@example.com"}
	repo.CreateUser(user)
	
	contract := &models.Contract{UserID: user.ID, Slug: "c1", Filename: "test.pdf"}
	repo.Create(contract)
	
	note := &models.Note{ContractID: contract.ID, Content: "Nota para deletar"}
	repo.CreateNote(note)
	
	service := NewContractService(repo, nil, nil)
	err := service.RemoveNote(note.ID, user.ID)
	
	assert.NoError(t, err)
	
	// Verificar se sumiu
	c, _ := repo.GetBySlug("c1", user.ID)
	assert.Len(t, c.Notes, 0)
}
