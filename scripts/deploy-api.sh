#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Realizando Deploy do Backend (API)..."

cd api
vercel deploy --prod --yes --scope zenstorages-projects
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Deploy da API concluído!"
else
    log_error "Falha no deploy da API."
    exit 1
fi
