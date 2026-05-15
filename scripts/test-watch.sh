#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Iniciando modo TDD (Watch)..."

# Detecta se é para rodar backend, frontend ou ambos
TARGET=${1:-"both"}

run_backend() {
    log_info "Monitorando Backend (Go)..."
    cd api
    # Usa 'gotests' ou apenas um loop de watch simples se não houver ferramenta específica
    if command -v air &> /dev/null; then
        # Air pode ser usado para rodar testes no save
        air -c .air.toml
    else
        log_warning "Instale 'air' para um watch de backend mais robusto."
        go test ./backend/... ./pkg/... -v
    fi
}

run_frontend() {
    log_info "Monitorando Frontend (Vitest)..."
    cd web
    pnpm run test:tdd
}

if [ "$TARGET" == "backend" ]; then
    run_backend
elif [ "$TARGET" == "frontend" ]; then
    run_frontend
else
    log_info "Para rodar ambos em paralelo, recomenda-se usar terminais separados."
    log_info "Dica: ./scripts/test-watch.sh backend  OU  ./scripts/test-watch.sh frontend"
    exit 0
fi
