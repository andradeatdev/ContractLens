package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/andradeatdev/ContractLens/api/backend/models"
	"github.com/andradeatdev/ContractLens/api/backend/services"
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
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	// Limitar o tamanho do corpo da requisição para um pouco mais que 10MB (ex: 11MB)
	// para permitir o overhead do multipart form.
	r.Body = http.MaxBytesReader(w, r.Body, 11*1024*1024)

	file, header, err := r.FormFile("file")
	if err != nil {
		log.Printf("Error: FormFile: %v", err)
		if err.Error() == "http: request body too large" {
			SendJSONError(w, "Ops! Este arquivo é grande demais. O limite é de 10MB.", http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE")
		} else {
			SendJSONError(w, "Falha ao ler arquivo do formulário", http.StatusBadRequest, "INVALID_REQUEST")
		}
		return
	}
	defer func() { _ = file.Close() }()

	if header.Size > 10*1024*1024 {
		SendJSONError(w, "Ops! Este arquivo é grande demais. O limite é de 10MB.", http.StatusRequestEntityTooLarge, "FILE_TOO_LARGE")
		return
	}

	fileData, err := io.ReadAll(file)
	if err != nil {
		log.Printf("Error: ReadAll: %v", err)
		SendJSONError(w, "Falha ao ler dados do arquivo", http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	contract, err := h.service.AnalyzeContract(r.Context(), userID, header.Filename, fileData)
	if err != nil {
		log.Printf("Error: AnalyzeContract: %v", err)
		status := http.StatusInternalServerError
		errorCode := "ANALYSIS_FAILED"
		if strings.Contains(strings.ToLower(err.Error()), "não parece ser um contrato válido") {
			status = http.StatusBadRequest
			errorCode = "INVALID_CONTRACT"
		}
		SendJSONError(w, err.Error(), status, errorCode)
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Compare(w http.ResponseWriter, r *http.Request) {
	log.Println("Request: Compare")
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	// Ler ID do contrato base do form
	baseIDStr := r.FormValue("base_id")
	if baseIDStr == "" {
		SendJSONError(w, "ID do contrato base é obrigatório", http.StatusBadRequest, "MISSING_FIELDS")
		return
	}

	var baseID uint
	if _, err := fmt.Sscanf(baseIDStr, "%d", &baseID); err != nil {
		SendJSONError(w, "ID do contrato base inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	// Ler o novo arquivo PDF
	file, _, err := r.FormFile("file")
	if err != nil {
		SendJSONError(w, "Falha ao ler arquivo do formulário", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}
	defer func() { _ = file.Close() }()

	fileData, err := io.ReadAll(file)
	if err != nil {
		SendJSONError(w, "Falha ao ler dados do arquivo", http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	report, err := h.service.CompareContracts(r.Context(), userID, baseID, fileData)
	if err != nil {
		log.Printf("Error: CompareContracts: %v", err)
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "COMPARISON_FAILED")
		return
	}

	SendJSONResponse(w, map[string]string{"report": report}, http.StatusOK)
}

func (h *ContractHandler) Chat(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	var req struct {
		ContractSlug string `json:"contract_slug"`
		Message      string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	answer, err := h.service.Chat(r.Context(), userID, req.ContractSlug, req.Message)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "CHAT_FAILED")
		return
	}

	SendJSONResponse(w, map[string]string{"answer": answer}, http.StatusOK)
}

func (h *ContractHandler) AnalyzeClause(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	// Limitar corpo da requisição para 1MB (segurança para endpoint público)
	r.Body = http.MaxBytesReader(w, r.Body, 1024*1024)

	var req struct {
		Clause string `json:"clause"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	result, err := h.service.AnalyzeClause(r.Context(), req.Clause)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "CLAUSE_ANALYSIS_FAILED")
		return
	}

	SendJSONResponse(w, result, http.StatusOK)
}

func (h *ContractHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	contracts, err := h.service.ListContracts(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, contracts, http.StatusOK)
}

func (h *ContractHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	var req struct {
		ContractSlug string `json:"contract_slug"`
		Content      string `json:"content"`
		SelectedText string `json:"selected_text"`
		Color        string `json:"color"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	note, err := h.service.AddNote(userID, req.ContractSlug, req.Content, req.SelectedText, req.Color)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, note, http.StatusOK)
}

func (h *ContractHandler) DeleteNote(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodDelete {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	if err := h.service.RemoveNote(id, userID); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) GetByID(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound, "NOT_FOUND")
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Reanalyze(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	contract, err := h.service.ReanalyzeContract(r.Context(), id, userID)
	if err != nil {
		log.Printf("Error: ReanalyzeContract: %v", err)
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "ANALYSIS_FAILED")
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) ExportAnalysis(w http.ResponseWriter, r *http.Request, id uint) {
	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	content, filename, err := h.service.ExportAnalysis(id, userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusNotFound, "NOT_FOUND")
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+filename)
	w.Header().Set("Content-Type", "text/markdown")
	_, _ = w.Write([]byte(content))
}

func (h *ContractHandler) GetBySlug(w http.ResponseWriter, r *http.Request, slug string) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	log.Printf("GetBySlug: Searching for slug='%s' for userID=%d", slug, userID)
	contract, err := h.service.GetContractBySlug(slug, userID)
	if err != nil {
		log.Printf("GetBySlug error: %v", err)
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound, "NOT_FOUND")
		return
	}

	SendJSONResponse(w, contract, http.StatusOK)
}

func (h *ContractHandler) Update(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodPut && r.Method != http.MethodPatch {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	var req struct {
		Filename string `json:"filename"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	if err := h.service.UpdateContract(id, userID, req.Filename); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Delete(w http.ResponseWriter, r *http.Request, id uint) {
	if r.Method != http.MethodDelete {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	if err := h.service.DeleteContract(id, userID); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *ContractHandler) Download(w http.ResponseWriter, r *http.Request, id uint) {
	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	contract, err := h.service.GetContractByID(id, userID)
	if err != nil {
		SendJSONError(w, "Contrato não encontrado", http.StatusNotFound, "NOT_FOUND")
		return
	}

	if contract.FilePath == "" {
		SendJSONError(w, "Arquivo original não disponível", http.StatusNotFound, "NOT_FOUND")
		return
	}

	// 1. Obter dados usando o adapter via service
	data, err := h.service.DownloadFile(r.Context(), contract.FilePath)
	if err != nil {
		log.Printf("Download error: %v", err)
		SendJSONError(w, "Falha ao baixar arquivo", http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	w.Header().Set("Content-Disposition", "attachment; filename="+contract.Filename)
	w.Header().Set("Content-Type", "application/pdf")
	_, _ = w.Write(data)
}

func (h *ContractHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	user, err := h.service.GetUser(userID)
	if err != nil {
		SendJSONError(w, "Usuário não encontrado", http.StatusNotFound, "NOT_FOUND")
		return
	}

	SendJSONResponse(w, user, http.StatusOK)
}

func (h *ContractHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	var req models.User
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	req.ID = userID
	if err := h.service.UpdateUser(&req); err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, req, http.StatusOK)
}

func (h *ContractHandler) Activity(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	activity, err := h.service.ListActivity(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, activity, http.StatusOK)
}

func (h *ContractHandler) Stats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	stats, err := h.service.GetStats(userID)
	if err != nil {
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, stats, http.StatusOK)
}

func (h *ContractHandler) Search(w http.ResponseWriter, r *http.Request) {
	log.Println("Request: Search Global")
	if r.Method != http.MethodPost {
		SendJSONError(w, "Essa ação não é permitida por este caminho.", http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED")
		return
	}

	userID, ok := r.Context().Value(UserIDKey).(uint)
	if !ok {
		SendJSONError(w, "Você precisa estar logado para acessar este recurso.", http.StatusUnauthorized, "AUTH_REQUIRED")
		return
	}

	var req struct {
		Query string `json:"query"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		SendJSONError(w, "Corpo da requisição inválido", http.StatusBadRequest, "INVALID_REQUEST")
		return
	}

	if req.Query == "" {
		SendJSONError(w, "A consulta não pode estar vazia", http.StatusBadRequest, "MISSING_FIELDS")
		return
	}

	answer, err := h.service.SearchGlobal(r.Context(), userID, req.Query)
	if err != nil {
		log.Printf("Error: SearchGlobal: %v", err)
		SendJSONError(w, err.Error(), http.StatusInternalServerError, "INTERNAL_ERROR")
		return
	}

	SendJSONResponse(w, map[string]string{"answer": answer}, http.StatusOK)
}
