# ─────────────────────────────
# Stage 1: Build
# ─────────────────────────────
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY api/package*.json ./

# Install deps (no dev deps for production)
RUN npm install

# Copy tsconfig + source
COPY api/tsconfig.json ./
COPY api/src ./src

# Compile TypeScript -> JavaScript
RUN npx tsc

# ─────────────────────────────
# Stage 2: Runtime
# ─────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy only required files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Expose port (Render will override but good practice)
EXPOSE 3000

# Start server (compiled JS, not TS)
CMD ["node", "dist/server.js"]
