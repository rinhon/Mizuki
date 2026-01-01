# Build stage
FROM node:lts-slim AS builder

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN apt-get update && apt-get install -y git
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Fix symlinks for Linux environment
# This will remove broken Windows junctions and create valid Linux symlinks
ENV ENABLE_CONTENT_SYNC=true
RUN node scripts/sync-content.js

# Build the application
RUN pnpm build

# Runtime stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
