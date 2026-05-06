package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/internal/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/internal/services"
)

type ContractHandler struct {
	service *services.ContractService
}

func NewContractHandler(service *services.ContractService) *ContractHandler {
	return &ContractHandler{service: service}
}

func (h *ContractHandler) Upload(w http.ResponseWriter, r *http.Request) {
	log.Println("Request: Upload")
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Limitar o tamanho do corpo da requisição para um pouco mais que 10MB (ex: 11MB)
	// para permitir o overhead do multipart form.
	r.Body = http.MaxBytesReader(w, r.Body, 11*1024*1024)

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("Error: FormFile: %v", err)
		if err.Error() == "http: request body too large" {
			http.Error(w, "Arquivo muito grande. O limite máximo é 10MB", http.StatusRequestEntityTooLarge)
		} else {
			http.Error(w, "Failed to read file from form", http.StatusBadRequest)
		}
		return
	}
	defer file.Close()

	if header.Size > 10*1024*1024 {
		http.Error(w, "Arquivo muito grande. O limite máximo é 10MB", http.StatusRequestEntityTooLarge)
		return
	}

	fileData, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Error: ReadAll: %v", err)
		http.Error(w, "Failed to read file data", http.StatusInternalServerError)
		return
	}

	contract, err := h.service.AnalyzeContract(r.Context(), userID, header.Filename, fileData)
	if err != nil {
		log.Printf("Error: AnalyzeContract: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contract)
}

func (h *ContractHandler) Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		ContractSlug string `json:"contract_slug"`
		Message      string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	answer, err := h.service.Chat(r.Context(), userID, req.ContractSlug, req.Message)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"answer": answer})
}

func (h *ContractHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	contracts, err := h.service.ListContracts(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contracts)
}

func (h *ContractHandler) GetByID(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		http.Error(w, "Contract not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contract)
}

func (h *ContractHandler) GetBySlug(w http.ResponseWriter, r *http.Request, slug string) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	log.Printf("GetBySlug: Searching for slug='%s' for userID=%d", slug, userID)
	contract, err := h.service.GetContractBySlug(slug, userID)
	if err != nil {
		log.Printf("GetBySlug error: %v", err)
		http.Error(w, "Contract not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(contract)
}

func (h *ContractHandler) Update(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateContract(id, userID, req.Filename); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Delete(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	if err := h.service.DeleteContract(id, userID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Download(w http.ResponseWriter, r *http.Request, id uint) {
	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		http.Error(w, "Contract not found", http.StatusNotFound)
		return
	}

	if contract.FilePath == "" {
		http.Error(w, "Arquivo original não disponível", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+contract.Filename)
	w.Header().Set("Content-Type", "application/pdf")
	http.ServeFile(w, r, contract.FilePath)
}

func (h *ContractHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	user, err := h.service.GetUser(userID)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (h *ContractHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req models.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.ID = userID
	if err := h.service.UpdateUser(&req); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(req)
}

func (h *ContractHandler) Activity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	activity, err := h.service.ListActivity(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(activity)
}

func (h *ContractHandler) Stats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	stats, err := h.service.GetStats(userID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
