#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Executando Testes E2E (Playwright)..."
log_warning "Nota: Certifique-se de que o servidor local está rodando em http://localhost:3000"

cd web
npx playwright test
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Testes E2E aprovados!"
else
    log_error "Testes E2E FALHARAM."
    exit 1
fi
