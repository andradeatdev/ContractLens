# Stage 1: Base image
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Stage 2: Dependencies
FROM base AS deps
# Copy dependency files first to leverage Docker cache
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
# Use cache mount for faster pnpm installs
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --config.ignore-scripts=true

# Stage 3: Development
FROM base AS dev
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Expose port
EXPOSE 3000
# Run dev server
CMD ["pnpm", "dev"]

# Stage 4: Builder
FROM base AS builder
# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy source code
COPY . .
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1
# Build the application
RUN pnpm build

# Stage 5: Production runner
FROM base AS prod
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Install wget for healthcheck
RUN apk add --no-cache wget

# Security hardening: Use a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
# See: https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Healthcheck to ensure the service is running
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run the standalone server
CMD ["node", "server.js"]
