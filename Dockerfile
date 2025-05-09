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
