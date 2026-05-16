package repositories

import (
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type GormRepository struct {
	db *gorm.DB
}

func NewGormRepository(db *gorm.DB) *GormRepository {
	return &GormRepository{db: db}
}

func (r *GormRepository) Create(contract *models.Contract) error {
	return r.db.Create(contract).Error
}

func (r *GormRepository) GetByID(id uint, userID uint) (*models.Contract, error) {
	var contract models.Contract
	query := r.db.Preload("Risks").Preload("Messages").Preload("Notes").Where("id = ?", id)
	if userID != 0 {
		query = query.Where("user_id = ?", userID)
	}
	err := query.First(&contract).Error
	return &contract, err
}

func (r *GormRepository) GetBySlug(slug string, userID uint) (*models.Contract, error) {
	var contract models.Contract
	err := r.db.Preload("Risks").Preload("Messages").Preload("Notes").Where("slug = ? AND user_id = ?", slug, userID).First(&contract).Error
	return &contract, err
}

func (r *GormRepository) CreateNote(note *models.Note) error {
	return r.db.Create(note).Error
}

func (r *GormRepository) DeleteNote(id uint, userID uint) error {
	// Verifica se a nota pertence a um contrato do usuário
	var note models.Note
	err := r.db.Joins("JOIN contracts ON contracts.id = notes.contract_id").
		Where("notes.id = ? AND contracts.user_id = ?", id, userID).
		First(&note).Error
	if err != nil {
		return err
	}
	return r.db.Delete(&note).Error
}

func (r *GormRepository) IsSlugTaken(slug string) bool {
	var count int64
	r.db.Model(&models.Contract{}).Where("slug = ?", slug).Count(&count)
	return count > 0
}

func (r *GormRepository) CreateMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *GormRepository) GetMessagesByContractID(contractID uint, userID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	// Primeiro verifica se o contrato pertence ao usuário
	var count int64
	r.db.Model(&models.Contract{}).Where("id = ? AND user_id = ?", contractID, userID).Count(&count)
	if count == 0 {
		return nil, gorm.ErrRecordNotFound
	}

	err := r.db.Where("contract_id = ?", contractID).Order("created_at asc").Find(&messages).Error
	return messages, err
}

func (r *GormRepository) List(userID uint) ([]models.Contract, error) {
	var contracts []models.Contract
	err := r.db.Preload("Risks").Where("user_id = ?", userID).Order("created_at desc").Find(&contracts).Error
	return contracts, err
}

func (r *GormRepository) GetLatestMessages(userID uint, limit int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.Joins("JOIN contracts ON contracts.id = chat_messages.contract_id").
		Where("contracts.user_id = ?", userID).
		Order("chat_messages.created_at desc").
		Limit(limit).
		Find(&messages).Error
	return messages, err
}

func (r *GormRepository) GetUser(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *GormRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *GormRepository) Update(contract *models.Contract) error {
	// O Update assume que o objeto já foi verificado (GetByID com userID)
	return r.db.Save(contract).Error
}

func (r *GormRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Contract{}).Error
}

func (r *GormRepository) DeleteRisksByContractID(contractID uint) error {
	return r.db.Where("contract_id = ?", contractID).Delete(&models.Risk{}).Error
}

func (r *GormRepository) CreateChunks(chunks []models.DocumentChunk) error {
	if len(chunks) == 0 {
		return nil
	}
	return r.db.Create(&chunks).Error
}

func (r *GormRepository) DeleteChunksByContractID(contractID uint) error {
	return r.db.Where("contract_id = ?", contractID).Delete(&models.DocumentChunk{}).Error
}

func (r *GormRepository) SearchSimilarChunks(contractID uint, embedding []float32, limit int) ([]models.DocumentChunk, error) {
	var chunks []models.DocumentChunk
	
	// Busca vetorial usando distância de cosseno (oposto de similaridade)
	// O operador '<=>' no pgvector representa a distância de cosseno.
	err := r.db.Where("contract_id = ?", contractID).
		Clauses(clause.OrderBy{
			Expression: clause.Expr{SQL: "embedding <=> ?", Vars: []interface{}{pgvector.NewVector(embedding)}},
		}).
		Limit(limit).
		Find(&chunks).Error
		
	return chunks, err
}

func (r *GormRepository) SearchSimilarChunksGlobal(userID uint, embedding []float32, limit int) ([]models.DocumentChunk, error) {
	var chunks []models.DocumentChunk
	
	err := r.db.Preload("Contract").
		Joins("JOIN contracts ON contracts.id = document_chunks.contract_id").
		Where("contracts.user_id = ?", userID).
		Clauses(clause.OrderBy{
			Expression: clause.Expr{SQL: "document_chunks.embedding <=> ?", Vars: []interface{}{pgvector.NewVector(embedding)}},
		}).
		Limit(limit).
		Find(&chunks).Error
		
	return chunks, err
}

func (r *GormRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormRepository) GetUserByVerificationToken(token string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("verification_token = ?", token).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *GormRepository) EnsureDefaultUser() error {
	var count int64
	r.db.Model(&models.User{}).Count(&count)
	if count == 0 {
		user := &models.User{
			Name:  "João Silva",
			Email: "joao@exemplo.com",
		}
		return r.db.Create(user).Error
	}
	return nil
}

// Push Notifications
func (r *GormRepository) CreatePushSubscription(sub *models.PushSubscription) error {
	// Upsert por endpoint
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "endpoint"}},
		DoUpdates: clause.AssignmentColumns([]string{"user_id", "p256dh", "auth"}),
	}).Create(sub).Error
}

func (r *GormRepository) DeletePushSubscription(endpoint string) error {
	return r.db.Where("endpoint = ?", endpoint).Delete(&models.PushSubscription{}).Error
}

func (r *GormRepository) GetPushSubscriptionsByUserID(userID uint) ([]models.PushSubscription, error) {
	var subs []models.PushSubscription
	err := r.db.Where("user_id = ?", userID).Find(&subs).Error
	return subs, err
}
