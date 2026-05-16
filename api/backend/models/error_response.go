package models

type APIErrorDetail struct {
	Field   string `json:"field,omitempty"`
	Code    string `json:"code"`
	Message string `json:"message"`
}

type APIErrorResponse struct {
	Error struct {
		Code      string           `json:"code"`
		Message   string           `json:"message"`
		Details   []APIErrorDetail `json:"details,omitempty"`
		RequestID string           `json:"requestId,omitempty"`
	} `json:"error"`
}
