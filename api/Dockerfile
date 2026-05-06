FROM golang:1.26.2-alpine

WORKDIR /app

# Instalar dependências de compilação
RUN apk add --no-cache build-base

# Copiar os arquivos de definição do módulo
COPY go.mod ./

# Copiar todo o código-fonte (necessário para o go mod tidy identificar os imports)
COPY . .

# Agora sim, sincronizar dependências e gerar o go.sum
RUN go mod tidy

# Instalar air para hot-reloading
RUN go install github.com/air-verse/air@latest

# Compilar a aplicação (opcional para o air, mas bom para checar erros)
RUN go build -o main ./cmd/app/main.go

EXPOSE 8080

# Usar air para rodar com watch mode
CMD ["air", "-c", ".air.toml"]
