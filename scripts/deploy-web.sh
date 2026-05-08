#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Realizando Deploy do Frontend (Web)..."

cd web
vercel deploy --prod --yes --scope zenstorages-projects
STATUS=$?
cd ..

if [ $STATUS -eq 0 ]; then
    log_success "Deploy da Web concluído!"
else
    log_error "Falha no deploy da Web."
    exit 1
fi
