#!/bin/bash

# scripts/dev.sh - Contract Lens Development Orchestrator
# Este script limpa o ambiente anterior e inicia o stack completo em modo desenvolvimento.

set -e # Encerra o script em caso de erro

# Cores para o terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # Sem cor

echo -e "${BLUE}===> [Contract Lens] Iniciando ambiente de desenvolvimento...${NC}"

# 1. Reset do ambiente
echo -e "${YELLOW}---> Limpando containers e volumes anteriores...${NC}"
docker compose down -v --remove-orphans

# 2. Build e Start
echo -e "${YELLOW}---> Construindo e iniciando serviços (API, Web, DB)...${NC}"
docker compose up -d --build

# 3. Verificação de Saúde
echo -e "${GREEN}===> Ambiente pronto!${NC}"
echo -e "${BLUE}API:${NC} http://localhost:8080"
echo -e "${BLUE}Web:${NC} http://localhost:3000"
echo ""
echo -e "Para acompanhar os logs em tempo real, execute:"
echo -e "${GREEN}docker compose logs -f${NC}"
echo ""
