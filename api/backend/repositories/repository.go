package repositories

import "github.com/andradeatdev/ai_contract_analyzer/api/backend/models"

// Repository define a interface para persistência de dados (Port)
type Repository interface {
	// Contratos
	Create(contract *models.Contract) error
	GetByID(id uint, userID uint) (*models.Contract, error)
	GetBySlug(slug string, userID uint) (*models.Contract, error)
	List(userID uint) ([]models.Contract, error)
	Update(contract *models.Contract) error
	Delete(id uint, userID uint) error
	IsSlugTaken(slug string) bool

	// Riscos
	DeleteRisksByContractID(contractID uint) error

	// Chunks (RAG)
	CreateChunks(chunks []models.DocumentChunk) error
	DeleteChunksByContractID(contractID uint) error
	SearchSimilarChunks(contractID uint, embedding []float32, limit int) ([]models.DocumentChunk, error)
	SearchSimilarChunksGlobal(userID uint, embedding []float32, limit int) ([]models.DocumentChunk, error)

	// Notas
	CreateNote(note *models.Note) error
	DeleteNote(id uint, userID uint) error

	// Mensagens
	CreateMessage(message *models.ChatMessage) error
	GetMessagesByContractID(contractID uint, userID uint) ([]models.ChatMessage, error)
	GetLatestMessages(userID uint, limit int) ([]models.ChatMessage, error)

	// Usuários
	GetUser(id uint) (*models.User, error)
	UpdateUser(user *models.User) error
	CreateUser(user *models.User) error
	GetUserByEmail(email string) (*models.User, error)
	GetUserByVerificationToken(token string) (*models.User, error)
	EnsureDefaultUser() error
}
