FROM node:20-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install

# Copiar o resto do código
COPY . .

EXPOSE 3000

# Rodar em modo dev para watch mode
CMD ["pnpm", "dev"]
