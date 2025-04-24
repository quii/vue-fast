# Build stage for Vue app
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
COPY --from=build-stage /app/dist ./dist
COPY package*.json ./
RUN npm install --production

# Start the server
CMD ["node", "dist/server/index.js"]
