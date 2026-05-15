#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Lint do Backend (Go)..."

if ! command -v golangci-lint &> /dev/null; then
    log_error "golangci-lint não está instalado. Instale com: curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin v1.56.2"
    exit 1
fi

cd api
golangci-lint run ./...
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Lint do Backend aprovado!"
else
    log_error "Lint do Backend encontrou problemas."
    exit 1
fi
