package models

import (
	"github.com/pgvector/pgvector-go"
	"gorm.io/gorm"
)

// DocumentChunk representa um pedaço (segmento) de texto de um contrato
// processado para busca vetorial (RAG).
type DocumentChunk struct {
	gorm.Model
	ContractID uint            `json:"contract_id" gorm:"index"`
	Contract   Contract        `gorm:"foreignKey:ContractID" json:"-"`
	Content    string          `json:"content"`
	Embedding  pgvector.Vector `json:"embedding" gorm:"type:vector(3072)"`
}
