package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
)

// SendJSONError envia uma resposta de erro formatada em JSON estruturado
func SendJSONError(w http.ResponseWriter, message string, code int, errorCode string, details ...models.APIErrorDetail) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)

	resp := models.APIErrorResponse{}
	resp.Error.Code = errorCode
	resp.Error.Message = message
	resp.Error.Details = details

	_ = json.NewEncoder(w).Encode(resp)
}
// SendJSONResponse envia uma resposta de sucesso formatada em JSON
func SendJSONResponse(w http.ResponseWriter, data interface{}, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(data)
}
