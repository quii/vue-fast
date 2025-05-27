# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./
RUN npm ci

# Copy all source files needed for build
# Instead of selectively copying files, copy everything except what's in .dockerignore
COPY . .

# Build the application
RUN npm run build
RUN npm run server:build

# Production stage
FROM node:18-alpine as production-stage
WORKDIR /app

# Set build arguments for S3 configuration
ARG AWS_ENDPOINT_URL_S3
ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG BUCKET_NAME

# Set environment variables
ENV AWS_ENDPOINT_URL_S3=$AWS_ENDPOINT_URL_S3
ENV AWS_REGION=$AWS_REGION
ENV AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
ENV AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
ENV BUCKET_NAME=$BUCKET_NAME
ENV NODE_ENV=production

# Copy only the necessary built files
COPY --from=build-stage /app/dist ./dist
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Expose port
EXPOSE 8080

# Start the server
CMD ["node", "dist/server/index.js"]