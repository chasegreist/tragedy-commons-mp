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

# Install all dependencies including devDependencies for building
RUN pnpm install --frozen-lockfile --prod=false

# Install TypeScript globally for the build
RUN npm install -g typescript

# Copy source code
COPY . .

# Build the application
WORKDIR /app/apps/server
RUN tsc
WORKDIR /app

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
