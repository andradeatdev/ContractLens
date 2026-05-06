#!/bin/bash

# Script de Sincronização e Deploy do Contract Lens
# Este script realiza o push para o GitHub e dispara os deploys na Vercel para API e Web.

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando Sincronização Contract Lens ===${NC}"

# 1. Verificar se há alterações para commitar
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}Detectadas alterações não commitadas.${NC}"
    echo "Deseja realizar um commit agora? (s/n)"
    read -r response
    if [[ "$response" =~ ^([sS][iI][mM]|[sS])$ ]]; then
        echo "Digite a mensagem do commit (Padrão Conventional Commits):"
        read -r commit_msg
        git add .
        git commit -m "$commit_msg"
    fi
fi

# 2. Push para o GitHub
echo -e "\n${BLUE}1/3 Realizando Push para o GitHub...${NC}"
if git push origin main; then
    echo -e "${GREEN}Push concluído com sucesso!${NC}"
else
    echo -e "${RED}Erro ao realizar push. Verifique sua conexão e permissões.${NC}"
    exit 1
fi

# 3. Deploy do Backend (API)
echo -e "\n${BLUE}2/3 Realizando Deploy do Backend (API)...${NC}"
if cd api && vercel deploy --prod --yes --scope zenstorages-projects; then
    echo -e "${GREEN}Deploy da API concluído!${NC}"
else
    echo -e "${RED}Falha no deploy da API.${NC}"
    exit 1
fi

# 4. Deploy do Frontend (Web)
echo -e "\n${BLUE}3/3 Realizando Deploy do Frontend (Web)...${NC}"
cd ../web
if vercel deploy --prod --yes --scope zenstorages-projects; then
    echo -e "${GREEN}Deploy da Web concluído!${NC}"
else
    echo -e "${RED}Falha no deploy da Web.${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Sincronização finalizada com sucesso! ===${NC}"
echo -e "API: ${BLUE}https://contract-lens-api-beta.vercel.app${NC}"
echo -e "Web: ${BLUE}https://contract-lens-web.vercel.app${NC}"
