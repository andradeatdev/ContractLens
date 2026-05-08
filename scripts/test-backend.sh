#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes do Backend (Go)..."

cd api
/home/gabriel/go/bin/go test ./backend/services/... -v
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Testes do Backend aprovados!"
else
    log_error "Testes do Backend FALHARAM."
    exit 1
fi
