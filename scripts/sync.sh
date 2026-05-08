#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Iniciando Sincronização Contract Lens..."

# 1. Verificar se há alterações para commitar
if [[ -n $(git status -s) ]]; then
    log_warning "Detectadas alterações não commitadas."
    echo "Deseja realizar um commit agora? (s/n)"
    read -r response
    if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        echo "Digite a mensagem do commit (Padrão Conventional Commits):"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
    fi
fi

# 2. Executar Testes Automatizados
"$(dirname "$0")/test-backend.sh" || exit 1
"$(dirname "$0")/test-frontend.sh" || exit 1

# 3. Push para o GitHub
log_info "Realizando Push para o GitHub..."
if git push origin main; then
    log_success "Push concluído com sucesso!"
else
    log_error "Erro ao realizar push."
    exit 1
fi

# 4. Deploys
"$(dirname "$0")/deploy-api.sh" || exit 1
"$(dirname "$0")/deploy-web.sh" || exit 1

log_success "Sincronização finalizada com sucesso!"
echo -e "API: ${BLUE}https://contract-lens-api-beta.vercel.app${NC}"
echo -e "Web: ${BLUE}https://contract-lens-web.vercel.app${NC}"
