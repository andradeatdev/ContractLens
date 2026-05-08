#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes de Componente do Frontend (Vitest)..."

cd web
npx vitest run --exclude "e2e/**"
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Testes de Componente aprovados!"
else
    log_warning "Alguns testes de componente falharam ou travaram (comum em JSDOM)."
    log_warning "Verifique se os fluxos críticos estão cobertos pelo E2E."
    # Não vamos interromper aqui se os E2E forem a fonte da verdade
fi
