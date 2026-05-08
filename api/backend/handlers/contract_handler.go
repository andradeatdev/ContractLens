package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/models"
	"github.com/andradeatdev/ai_contract_analyzer/api/backend/services"
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
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	// Limitar o tamanho do corpo da requisição para um pouco mais que 10MB (ex: 11MB)
	// para permitir o overhead do multipart form.
	r.Body = http.MaxBytesReader(w, r.Body, 11*1024*1024)

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("Error: FormFile: %v", err)
		if err.Error() == "http: request body too large" {
			SendJSONError(w, "Arquivo muito grande. O limite máximo é 10MB", http.StatusRequestEntityTooLarge)
		} else {
			SendJSONError(w, "Falha ao ler arquivo do formulário", http.StatusBadRequest)
		}
		return
	}
	defer file.Close()

	if header.Size > 10*1024*1024 {
		SendJSONError(w, "Arquivo muito grande. O limite máximo é 10MB", http.StatusRequestEntityTooLarge)
		return
	}

	fileData, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Error: ReadAll: %v", err)
		SendJSONError(w, "Falha ao ler dados do arquivo", http.StatusInternalServerError)
		return
	}

	contract, err := h.service.AnalyzeContract(r.Context(), userID, header.Filename, fileData)
	if err != nil {
		log.Printf("Error: AnalyzeContract: %v", err)
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	var req struct {
		ContractSlug string `json:"contract_slug"`
		Message      string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	answer, err := h.service.Chat(r.Context(), userID, req.ContractSlug, req.Message)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, map[string]string{"answer": answer}, http.StatusOK)
}

func (h *ContractHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	contracts, err := h.service.ListContracts(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, contracts, http.StatusOK)
}

func (h *ContractHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	var req struct {
		ContractSlug string `json:"contract_slug"`
		Content      string `json:"content"`
		SelectedText string `json:"selected_text"`
		Color        string `json:"color"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	note, err := h.service.AddNote(userID, req.ContractSlug, req.Content, req.SelectedText, req.Color)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, note, http.StatusOK)
}

func (h *ContractHandler) DeleteNote(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodDelete {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	if err := h.service.RemoveNote(id, userID); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) GetByID(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound)
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Reanalyze(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	contract, err := h.service.ReanalyzeContract(r.Context(), id, userID)
	if err != nil {
		log.Printf("Error: ReanalyzeContract: %v", err)
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) ExportAnalysis(w http.ResponseWriter, r *http.Request, id uint) {
	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	content, filename, err := h.service.ExportAnalysis(id, userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Type", "text/markdown")
	w.Write([]byte(content))
}

func (h *ContractHandler) GetBySlug(w http.ResponseWriter, r *http.Request, slug string) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	log.Printf("GetBySlug: Searching for slug='%s' for userID=%d", slug, userID)
	contract, err := h.service.GetContractBySlug(slug, userID)
	if err != nil {
		log.Printf("GetBySlug error: %v", err)
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound)
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Update(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	if err := h.service.UpdateContract(id, userID, req.Filename); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Delete(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodDelete {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	if err := h.service.DeleteContract(id, userID); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Download(w http.ResponseWriter, r *http.Request, id uint) {
	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound)
		return
	}

	if contract.FilePath == "" {
		SendJSONError(w, "Arquivo original não disponível", http.StatusNotFound)
		return
	}

	// 1. Obter dados usando o adapter via service
	data, err := h.service.DownloadFile(r.Context(), contract.FilePath)
	if err != nil {
		log.Printf("Download error: %v", err)
		SendJSONError(w, "Falha ao baixar arquivo", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+contract.Filename)
	w.Header().Set("Content-Type", "application/pdf")
	w.Write(data)
}

func (h *ContractHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	user, err := h.service.GetUser(userID)
	if err != nil {
		SendJSONError(w, "Usuário não encontrado", http.StatusNotFound)
		return
	}

	SendJSONResponse(w, user, http.StatusOK)
}

func (h *ContractHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	var req models.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest)
		return
	}

	req.ID = userID
	if err := h.service.UpdateUser(&req); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, req, http.StatusOK)
}

func (h *ContractHandler) Activity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	activity, err := h.service.ListActivity(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, activity, http.StatusOK)
}

func (h *ContractHandler) Stats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Método não permitido", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Não autorizado", http.StatusUnauthorized)
		return
	}

	stats, err := h.service.GetStats(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	SendJSONResponse(w, stats, http.StatusOK)
}
