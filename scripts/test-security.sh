#!/bin/bash
source "$(dirname "$0")/utils.sh"

log_info "Iniciando Auditoria de Segurança..."

# 1. Escaneamento de Código (SAST)
log_info "Executando Security Scanner (SAST)..."
log_info "Verificando API..."
python3 scripts/security/lib/security_scanner.py ./api --severity high --json --output security_scan_api.json
SAST_API_STATUS=$?

log_info "Verificando Web..."
python3 scripts/security/lib/security_scanner.py ./web --severity high --json --output security_scan_web.json
SAST_WEB_STATUS=$?

if [ $SAST_API_STATUS -eq 0 ] && [ $SAST_WEB_STATUS -eq 0 ]; then
    SAST_STATUS=0
else
    SAST_STATUS=1
fi

# 2. Auditoria de Dependências (CVEs)
log_info "Executando Vulnerability Assessor (Dependências)..."
log_info "Verificando API (Go)..."
python3 scripts/security/lib/vulnerability_assessor.py ./api --severity high --json --output vuln_scan_api.json
VULN_API_STATUS=$?

log_info "Verificando Web (npm)..."
python3 scripts/security/lib/vulnerability_assessor.py ./web --severity high --json --output vuln_scan_web.json
VULN_WEB_STATUS=$?

# 3. Verificação de Conformidade (Compliance)
log_info "Executando Compliance Checker..."
python3 scripts/security/lib/compliance_checker.py . --framework all --json --output compliance_scan.json
COMPLIANCE_STATUS=$?

# Resumo
echo ""
log_info "============================================================"
log_info "RESUMO DA AUDITORIA DE SEGURANÇA"
log_info "============================================================"

if [ $SAST_STATUS -eq 0 ]; then log_success "SAST: OK"; else log_error "SAST: Vulnerabilidades encontradas"; fi
if [ $VULN_API_STATUS -eq 0 ]; then log_success "VULN API: OK"; else log_error "VULN API: Vulnerabilidades encontradas"; fi
if [ $VULN_WEB_STATUS -eq 0 ]; then log_success "VULN WEB: OK"; else log_error "VULN WEB: Vulnerabilidades encontradas"; fi
if [ $COMPLIANCE_STATUS -eq 0 ]; then log_success "COMPLIANCE: OK"; else log_warning "COMPLIANCE: Gaps identificados"; fi

# Status final (falha se houver vulnerabilidades críticas/altas em código ou dependências)
if [ $SAST_STATUS -ne 0 ] || [ $VULN_API_STATUS -ne 0 ] || [ $VULN_WEB_STATUS -ne 0 ]; then
    log_error "Auditoria de segurança FALHOU."
    exit 1
else
    log_success "Auditoria de segurança CONCLUÍDA com sucesso."
    exit 0
fi
