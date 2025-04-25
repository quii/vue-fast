# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN npm run server:build

# Production stage
FROM node:18-alpine as production-stage
WORKDIR /app

# Set build arguments for S3 configuration
ARG S3_ENDPOINT
ARG S3_REGION
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG S3_BUCKET_NAME

# Set environment variables
ENV S3_ENDPOINT=$S3_ENDPOINT
ENV S3_REGION=$S3_REGION
ENV S3_ACCESS_KEY=$S3_ACCESS_KEY
ENV S3_SECRET_KEY=$S3_SECRET_KEY
ENV S3_BUCKET_NAME=$S3_BUCKET_NAME
ENV NODE_ENV=production

# Copy built files - make sure they go to the correct locations
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
