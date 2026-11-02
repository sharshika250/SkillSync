# Production Dockerfile for SkillSync Backend
FROM node:20-alpine AS runner

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Copy package manifests and install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend port
EXPOSE 5000

# Run with non-root user for security
USER node

# Start Express server
CMD ["node", "server.js"]
