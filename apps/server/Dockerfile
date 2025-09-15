# Production Dockerfile for Colyseus server
# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app
# Enable corepack for pnpm
RUN corepack enable
COPY package.json pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/server/package.json ./apps/server/package.json
COPY apps/server/tsconfig.json ./apps/server/tsconfig.json
COPY apps/server/src ./apps/server/src
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/tsconfig.json ./packages/shared/tsconfig.json
COPY packages/shared/src ./packages/shared/src
RUN corepack prepare pnpm@10.16.1 --activate && pnpm install --frozen-lockfile
RUN pnpm --filter @game/shared build && pnpm --filter @game/server build

# 2) Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=2567
EXPOSE 2567
# Copy built server and shared outputs and production node_modules
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/server/dist ./apps/server/dist
# Start server
CMD ["node", "apps/server/dist/index.js"]
