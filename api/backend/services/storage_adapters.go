package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// LocalStorageAdapter implementa FileStorage usando o sistema de arquivos local
type LocalStorageAdapter struct {
	UploadDir string
}

func (a *LocalStorageAdapter) Upload(ctx context.Context, filename string, data []byte) (string, error) {
	if err := os.MkdirAll(a.UploadDir, 0750); err != nil {
		return "", err
	}

	uniqueFilename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filename)
	filePath := filepath.Join(a.UploadDir, uniqueFilename)

	if err := os.WriteFile(filePath, data, 0600); err != nil {
		return "", err
	}

	return filePath, nil
}

func (a *LocalStorageAdapter) Download(ctx context.Context, path string) ([]byte, error) {
	// #nosec G304 - path is retrieved from DB and represents an uploaded contract
	return os.ReadFile(filepath.Clean(path))
}

func (a *LocalStorageAdapter) Delete(ctx context.Context, path string) error {
	return os.Remove(path)
}

// VercelBlobAdapter implementa FileStorage usando a API REST do Vercel Blob
type VercelBlobAdapter struct {
	Token string
}

func (a *VercelBlobAdapter) Upload(ctx context.Context, filename string, data []byte) (string, error) {
	// A API do Vercel Blob via HTTP PUT
	// URL: https://blob.vercel-storage.com/v1/objects/[filename]
	url := fmt.Sprintf("https://blob.vercel-storage.com/%d_%s", time.Now().UnixNano(), filename)

	req, err := http.NewRequestWithContext(ctx, "PUT", url, bytes.NewReader(data))
	if err != nil {
		return "", err
	}

	req.Header.Set("Authorization", "Bearer "+a.Token)
	req.Header.Set("x-api-version", "1")
	req.Header.Set("x-vercel-blob-access", "private")
	req.Header.Set("Content-Type", http.DetectContentType(data))

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer func() { _ = resp.Body.Close() }() // Ignored as reading is done or failed

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("vercel blob error (%d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to parse vercel blob response: %w", err)
	}

	return result.URL, nil
}

func (a *VercelBlobAdapter) Download(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+a.Token)
	req.Header.Set("x-api-version", "1")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer func() { _ = resp.Body.Close() }() // Ignored as reading is done or failed

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("failed to download from blob: %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}

func (a *VercelBlobAdapter) Delete(ctx context.Context, url string) error {
	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+a.Token)
	req.Header.Set("x-api-version", "1")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer func() { _ = resp.Body.Close() }() // Ignored as operation is complete or failed

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("failed to delete from blob: %d", resp.StatusCode)
	}

	return nil
}
