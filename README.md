# Contract Lens 🔍

[![Go Version](https://img.shields.io/badge/Go-1.26.2-00ADD8?style=flat-square&logo=go)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini_Pro-blue?style=flat-square)](https://ai.google.dev/)

<!-- README-I18N:START -->

**Português** | [English](./README.en.md)

<!-- README-I18N:END -->

Análise inteligente de contratos jurídicos utilizando Inteligência Artificial para identificação de riscos, resumo de cláusulas e chat interativo.

![Dashboard Preview](https://raw.githubusercontent.com/andradeatdev/ContractLens/main/public/preview.png)

## 🚀 Tecnologias

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, Radix UI
- **Estado & Dados:** Zustand, TanStack Query v5
- **Transições:** React View Transitions API
- **Validação:** Zod, React Hook Form

### Backend
- **Linguagem:** Go 1.26
- **Database:** PostgreSQL / SQLite (GORM)
- **AI:** Google Gemini Pro (Generative AI)
- **Auth:** JWT, TOTP (Two-Factor Authentication)
- **PDF Processing:** Ledongthuc PDF

## ✨ Funcionalidades

- **Upload & Parsing:** Extração de texto de arquivos PDF com processamento assíncrono.
- **Análise de Risco:** Identificação automática de cláusulas abusivas ou perigosas categorizadas por nível de severidade.
- **Chat Contextual:** Interface de chat para tirar dúvidas específicas sobre o conteúdo do contrato.
- **Exportação:** Geração de relatórios e resumos estruturados.
- **Segurança:** Autenticação robusta com verificação via e-mail e códigos temporários.
- **API RESTful v1:** Endpoints padronizados em `/api/v1`, com tratamento de erros JSON estruturado e altamente descritivo.
- **Documentação de API Interativa:** Especificação OpenAPI disponível nativamente, com uma interface interativa provida pelo Scalar UI (`/api/docs`).


## 🛠️ Arquitetura

O projeto utiliza uma arquitetura limpa (Clean Architecture) no backend para garantir testabilidade e independência de infraestrutura:

```text
api/
├── backend/
│   ├── handlers/    # Camada de transporte (HTTP)
│   ├── services/    # Regras de negócio e casos de uso
│   ├── repositories/# Persistência de dados
│   └── models/      # Entidades do domínio
└── pkg/             # Pacotes compartilhados (AI, PDF)
```

No frontend, a estrutura segue os padrões modernos do Next.js com foco em performance e experiência do usuário (UX):

```text
web/
├── src/
│   ├── app/         # Rotas e Server/Client Components
│   ├── components/  # Componentes de UI reaproveitáveis
│   ├── hooks/       # Lógica de estado customizada
│   └── lib/         # Utilitários, store e validações
```

## 🔧 Configuração Local

### Pré-requisitos
- Go 1.26+
- Node.js 20+ (pnpm recomendado)
- Docker (opcional para PostgreSQL)

### Backend
1. Navegue até a pasta `api/`.
2. Renomeie `.env.example` para `.env` e preencha as chaves:
   - `GEMINI_API_KEY`: Sua chave do Google AI Studio.
   - `JWT_SECRET`: Uma string aleatória para segurança.
3. Execute `go run cmd/app/main.go`.

### Frontend
1. Navegue até a pasta `web/`.
2. Instale as dependências: `pnpm install`.
3. Execute o servidor de desenvolvimento: `pnpm dev`.

## 🧪 Testes

### Backend
```bash
go test ./api/backend/services/...
```

### Frontend
```bash
cd web && pnpm test
```

## 📈 Estratégia de Marketing & SEO

O **Contract Lens** foi projetado com uma fundação estratégica focada em acessibilidade e confiabilidade.

### 🎯 Posicionamento
- **Voz da Marca:** Profissional, confiável e descomplicada. Transformamos "juridiquês" em linguagem clara para tomadores de decisão.
- **Público-Alvo:** Pequenos empreendedores, freelancers e departamentos jurídicos que buscam agilidade na revisão de documentos.
- **Diferencial:** Processamento ultra-rápido via Gemini 2.5 Flash Lite e interface focada em análise de risco visual.

### 🔍 Otimização para Motores de Busca (SEO)
Estamos focados nas seguintes palavras-chave e estratégias:
- **Keywords Principais:** `Análise de contrato IA`, `Legal Tech Brasil`, `Revisão de contrato automática`, `Extração de dados PDF jurídico`.
- **Estratégia de Conteúdo:** Foco em resolver a dor da "demora na revisão jurídica" e "riscos ocultos em letras miúdas".
- **Acessibilidade:** Cumprimento rigoroso das normas WCAG 2.2 para garantir que a ferramenta seja inclusiva.

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

---
Desenvolvido por [Gabriel Andrade](https://github.com/andradeatdev).
