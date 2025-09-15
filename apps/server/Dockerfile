# Production Dockerfile for Colyseus server
# 1) Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm --filter @game/server build

# 2) Runtime stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy built files
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./node_modules/@game/shared

# Set environment variables
ENV NODE_ENV=production
ENV PORT=$PORT

# Expose the port the app runs on
EXPOSE $PORT

# Start the application
CMD ["node", "dist/index.js"]
