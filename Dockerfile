# Build stage
FROM node:18-alpine3.17 as build-stage
WORKDIR /app

# Copy package files first to leverage caching
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy only necessary files for the build
COPY tsconfig*.json ./
COPY vite.config.js ./
COPY server ./server
COPY src ./src
COPY public ./public

# Run build commands
RUN npm run build
RUN npm run server:build

# Production stage
FROM node:18-alpine as production-stage
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
# ... other ENV variables ...

# Copy only what's needed
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/dist/server ./dist/server
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Add debugging tools
RUN apk add --no-cache curl

# Debug the file structure
RUN ls -la /app && ls -la /app/dist && ls -la /app/dist/server

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/server/index.js"]
