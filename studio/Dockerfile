# CyberHex Studio — Production Docker Image
# Multi-stage build for optimal performance and size

# ─── Stage 1: Build ───────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install all dependencies
RUN yarn install --frozen-lockfile --network-timeout 120000

# Copy source code
COPY . .

# Build the application
RUN yarn build

# ─── Stage 2: Production ──────────────────
FROM nginx:1.27-alpine AS production

# Install security updates
RUN apk update && apk upgrade

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy PWA icons
COPY public/studio-icon.svg /usr/share/nginx/html/studio-icon.svg

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health || exit 1

# Security: Run as non-root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]