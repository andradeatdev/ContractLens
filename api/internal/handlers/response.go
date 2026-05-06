package handlers

import (
	"encoding/json"
	"net/http"
)

// SendJSONError envia uma resposta de erro formatada em JSON
func SendJSONError(w http.ResponseWriter, message string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// SendJSONResponse envia uma resposta de sucesso formatada em JSON
func SendJSONResponse(w http.ResponseWriter, data interface{}, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(data)
}
