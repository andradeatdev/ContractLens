package models

import (
	"time"

	"gorm.io/gorm"
)

type Contract struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index" json:"user_id"`
	Slug      string         `gorm:"uniqueIndex" json:"slug"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`
	Filename  string         `json:"filename"`
	FilePath  string         `json:"file_path"` // Caminho para o PDF no disco
	Content   string         `gorm:"type:text" json:"content"`
	Summary   string         `gorm:"type:text" json:"summary"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
	Risks     []Risk         `json:"risks"`
	Messages  []ChatMessage  `json:"messages"`
	Notes     []Note         `json:"notes"`
	// Metadados extraídos
	TotalValue string `json:"total_value"`
	Expiration string `json:"expiration"`
	Parties    string `json:"parties"`
	LegalVenue string `json:"legal_venue"`
}

type Note struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ContractID   uint      `gorm:"index" json:"contract_id"`
	Content      string    `gorm:"type:text" json:"content"`
	SelectedText string    `gorm:"type:text" json:"selected_text"`
	Color        string    `json:"color"` // yellow, red, green, blue
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type Risk struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	ContractID  uint   `json:"contract_id"`
	Title       string `json:"title"`
	Severity    string `json:"severity"` // low, medium, high
	Clause      string `gorm:"type:text" json:"clause"`
	Explanation string `gorm:"type:text" json:"explanation"`
}

type ChatMessage struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ContractID uint      `json:"contract_id"`
	Contract   Contract  `gorm:"foreignKey:ContractID" json:"-"`
	Role       string    `json:"role"` // user, assistant
	Message    string    `gorm:"type:text" json:"message"`
	CreatedAt  time.Time `json:"created_at"`
}

type User struct {
	ID                          uint      `gorm:"primaryKey" json:"id"`
	Name                        string    `json:"name"`
	Email                       string    `gorm:"unique" json:"email"`
	PasswordHash                string    `json:"-"` // Nunca expor a hash no JSON
	EmailVerified               bool      `gorm:"default:false" json:"email_verified"`
	VerificationToken           string    `gorm:"index" json:"-"`
	TokenExpiresAt              time.Time `json:"-"`
	LastVerificationEmailSentAt time.Time `json:"-"`
	CreatedAt                   time.Time `json:"created_at"`
	UpdatedAt                   time.Time `json:"updated_at"`
}
