package services

import (
	"context"
)

// FileStorage é o Port para persistência de arquivos (Arquitetura Hexagonal)
type FileStorage interface {
	Upload(ctx context.Context, filename string, data []byte) (string, error)
	Download(ctx context.Context, path string) ([]byte, error)
	Delete(ctx context.Context, path string) error
}
