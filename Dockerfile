# Multi-stage Dockerfile for SGM
# Privacy-first: All data stays in mounted volumes

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (use npm install instead of ci due to lock file complexity with Electron)
RUN npm install

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment for build
ENV NODE_ENV=production
ENV DATABASE_URL=file:/data/sgm.db
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install SQLite (for CLI debugging)
RUN apk add --no-cache sqlite

# Create app user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create data directories
RUN mkdir -p /data/documents /data/plans && \
    chown -R nextjs:nodejs /data

# Set user
USER nextjs

# Expose port
EXPOSE 3003

# Environment variables
ENV NODE_ENV=production
ENV PORT=3003
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/data/sgm.db
ENV DOCUMENT_ROOT=/data/documents
ENV PLAN_ROOT=/data/plans
ENV STORAGE_MODE=local_sqlite
ENV ENABLE_DEMO_DATA=false
ENV ENABLE_ANONYMOUS_ANALYTICS=false

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:3003/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
