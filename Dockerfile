# --- Stage 1: Build React/Vite Frontend & Express Server ---
FROM node:20-slim AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Runs vite build & esbuild to generate dist/ and dist/server.cjs
RUN npm run build

# --- Stage 2: Production Lightweight Runtime ---
FROM node:20-slim
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only to keep the image lean
COPY package*.json ./
RUN npm install --only=production

# Copy compiled backend & static frontend assets from Stage 1
COPY --from=build-stage /app/dist ./dist

# Expose port 3000 (the standard entry point for reverse-proxy ingress)
EXPOSE 3000

# Start the Express full-stack application
CMD ["node", "dist/server.cjs"]
