package adapters

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
)

// NextEmailAdapter implementa EmailSender chamando a API do Next.js
type NextEmailAdapter struct{}

func (a *NextEmailAdapter) SendVerificationEmail(email, name, token string) error {
	nextAppURL := os.Getenv("INTERNAL_WEB_URL")
	if nextAppURL == "" {
		nextAppURL = os.Getenv("NEXT_PUBLIC_APP_URL")
	}
	if nextAppURL == "" {
		nextAppURL = "http://host.docker.internal:3000"
	}

	apiURL := fmt.Sprintf("%s/api/emails/verify", nextAppURL)
	fmt.Printf("[NextEmailAdapter] Enviando e-mail via: %s\n", apiURL)

	payload := map[string]string{
		"email": email,
		"name":  name,
		"token": token,
	}

	body, _ := json.Marshal(payload)
	// #nosec G107 - apiURL is derived from a trusted environment variable
	resp, err := http.Post(apiURL, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("falha ao chamar API de e-mail: %w", err)
	}
	defer func() { _ = resp.Body.Close() }() // Ignored as reading is done or failed

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API de e-mail retornou erro (%d): %s", resp.StatusCode, string(respBody))
	}

	return nil
}
