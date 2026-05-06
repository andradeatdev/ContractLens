package handler

import (
	"net/http"

	"github.com/andradeatdev/ai_contract_analyzer/api/backend/app"
)


var handler http.Handler

func init() {
	handler = app.NewApp()
}

func Handler(w http.ResponseWriter, r *http.Request) {
	handler.ServeHTTP(w, r)
}
