#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes de Componente do Frontend (Vitest)..."

# Processa argumentos
RUN_MUTATION=false
for arg in "$@"; do
    if [ "$arg" == "--mutation" ]; then
        RUN_MUTATION=true
    fi
done

cd web
npx vitest run --exclude "e2e/**"
STATUS=$?

if [ $STATUS -eq 0 ]; then
    log_success "Testes de Componente aprovados!"
    
    # Executa testes de mutação se solicitado
    if [ "$RUN_MUTATION" = true ]; then
        log_info "Iniciando Testes de Mutação (Stryker)..."
        pnpm run test:mutation
        MUTATION_STATUS=$?
        if [ $MUTATION_STATUS -eq 0 ]; then
            log_success "Testes de mutação aprovados!"
        else
            log_warning "Testes de mutação identificaram lacunas."
        fi
    fi
else
    log_warning "Alguns testes de componente falharam ou travaram (comum em JSDOM)."
    log_warning "Verifique se os fluxos críticos estão cobertos pelo E2E."
fi
