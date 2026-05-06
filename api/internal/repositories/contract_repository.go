package repositories

import (
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/models"
	"gorm.io/gorm"
)

type ContractRepository struct {
	db *gorm.DB
}

func NewContractRepository(db *gorm.DB) *ContractRepository {
	return &ContractRepository{db: db}
}

func (r *ContractRepository) Create(contract *models.Contract) error {
	return r.db.Create(contract).Error
}

func (r *ContractRepository) GetByID(id uint, userID uint) (*models.Contract, error) {
	var contract models.Contract
	err := r.db.Preload("Risks").Preload("Messages").Where("id = ? AND user_id = ?", id, userID).First(&contract).Error
	return &contract, err
}

func (r *ContractRepository) GetBySlug(slug string, userID uint) (*models.Contract, error) {
	var contract models.Contract
	err := r.db.Preload("Risks").Preload("Messages").Where("slug = ? AND user_id = ?", slug, userID).First(&contract).Error
	return &contract, err
}

func (r *ContractRepository) IsSlugTaken(slug string) bool {
	var count int64
	r.db.Model(&models.Contract{}).Where("slug = ?", slug).Count(&count)
	return count > 0
}

func (r *ContractRepository) CreateMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *ContractRepository) GetMessagesByContractID(contractID uint, userID uint) ([]models.ChatMessage, error) {
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

func (r *ContractRepository) List(userID uint) ([]models.Contract, error) {
	var contracts []models.Contract
	err := r.db.Preload("Risks").Where("user_id = ?", userID).Order("created_at desc").Find(&contracts).Error
	return contracts, err
}

func (r *ContractRepository) GetLatestMessages(userID uint, limit int) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.Joins("JOIN contracts ON contracts.id = chat_messages.contract_id").
		Where("contracts.user_id = ?", userID).
		Order("chat_messages.created_at desc").
		Limit(limit).
		Find(&messages).Error
	return messages, err
}

func (r *ContractRepository) GetUser(id uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, id).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *ContractRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *ContractRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *ContractRepository) Update(contract *models.Contract) error {
	// O Update assume que o objeto já foi verificado (GetByID com userID)
	return r.db.Save(contract).Error
}

func (r *ContractRepository) Delete(id uint, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Contract{}).Error
}

func (r *ContractRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *ContractRepository) GetUserByVerificationToken(token string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("verification_token = ?", token).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *ContractRepository) EnsureDefaultUser() error {
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
