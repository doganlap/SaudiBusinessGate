FROM node:18-alpine

# Install required system packages
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    supervisor \
    tini

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create required directories
RUN mkdir -p \
    /app/logs \
    /app/workflows \
    /app/backups \
    /etc/supervisor/conf.d

# Copy supervisor configuration
COPY supervisor/n8n.conf /etc/supervisor/conf.d/

# Create non-root user
RUN addgroup -g 1001 -S n8nuser && \
    adduser -S n8nuser -u 1001 && \
    chown -R n8nuser:n8nuser /app

# Switch to non-root user
USER n8nuser

# Expose port
EXPOSE 5678

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=5 \
    CMD curl -f http://localhost:5678/health || exit 1

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["npm", "start"]