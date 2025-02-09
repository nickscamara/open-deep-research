# Build stage
FROM node:20-alpine AS builder

# Define o repositório Git como build argument com valor padrão
ARG REPO_URL=https://github.com/felvieira/open-deep-research.git

# Instala git e outras dependências necessárias
RUN apk add --no-cache git

# Instala o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Clone do repositório
RUN git clone ${REPO_URL} .

# Copia os arquivos de configuração
COPY .env.example .env

# Instala as dependências
RUN pnpm install --frozen-lockfile

# Build da aplicação
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Instala o pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Define as variáveis de ambiente para produção
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copia os arquivos necessários do stage de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expõe a porta 3000
EXPOSE 3000

# Define o comando para iniciar a aplicação
CMD ["node", "server.js"] 