#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes do Backend (Go)..."

# Processa argumentos
RUN_MUTATION=false
for arg in "$@"; do
    if [ "$arg" == "--mutation" ]; then
        RUN_MUTATION=true
    fi
done

cd api
# Executa testes com profile de coverage em todos os pacotes do backend
go test ./backend/... ./pkg/... -v -coverprofile=coverage.out
STATUS=$?

if [ $STATUS -eq 0 ]; then
    log_success "Testes do Backend aprovados!"
    # Exibe o total de cobertura
    go tool cover -func=coverage.out | grep total

    # Executa testes de mutação se solicitado
    if [ "$RUN_MUTATION" = true ]; then
        log_info "Iniciando Testes de Mutação (isso pode demorar)..."
        # Executa mutação nos pacotes principais de lógica
        go-mutesting ./backend/services/...
        MUTATION_STATUS=$?
        if [ $MUTATION_STATUS -eq 0 ]; then
            log_success "Testes de mutação aprovados!"
        else
            log_warning "Testes de mutação identificaram lacunas na cobertura de testes."
        fi
    fi
else
    log_error "Testes do Backend FALHARAM."
fi

cd ..
exit $STATUS
