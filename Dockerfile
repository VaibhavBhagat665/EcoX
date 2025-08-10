# EcoX Home Frontend Dockerfile
# Multi-stage build for optimal production image

# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Install dependencies
RUN npm ci --only=production --ignore-scripts

# Copy source code
COPY client/ ./client/
COPY shared/ ./shared/
COPY server/ ./server/

# Build arguments for environment variables
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_BUILDER_API_KEY
ARG VITE_GEMINI_API_KEY

# Set environment variables
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_BUILDER_API_KEY=$VITE_BUILDER_API_KEY
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S ecox -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=ecox:nodejs /app/dist ./dist
COPY --from=builder --chown=ecox:nodejs /app/server ./server
COPY --from=builder --chown=ecox:nodejs /app/shared ./shared

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R ecox:nodejs /app/logs

# Switch to non-root user
USER ecox

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["npm", "start"]

# Labels for better image management
LABEL maintainer="EcoX Team <team@ecox.com>"
LABEL version="1.0.0"
LABEL description="EcoX Home - Futuristic Environmental Intelligence Platform"
LABEL org.opencontainers.image.title="EcoX Home"
LABEL org.opencontainers.image.description="AI-powered environmental intelligence platform with 3D visualizations, voice assistant, and community features"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.authors="EcoX Development Team"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.source="https://github.com/ecox-org/ecox-home-frontend"

# Development stage (optional - for local development with hot reload)
FROM node:20-alpine AS development

WORKDIR /app

# Install all dependencies (including dev dependencies)
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose port for development
EXPOSE 5000
EXPOSE 24678

# Start development server
CMD ["npm", "run", "dev"]
