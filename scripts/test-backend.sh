#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes do Backend (Go)..."

cd api
# Executa testes com profile de coverage em todos os pacotes do backend
go test ./backend/... ./pkg/... -v -coverprofile=coverage.out
STATUS=$?

if [ $STATUS -eq 0 ]; then
    log_success "Testes do Backend aprovados!"
    # Exibe o total de cobertura
    go tool cover -func=coverage.out | grep total
else
    log_error "Testes do Backend FALHARAM."
fi

cd ..
exit $STATUS
