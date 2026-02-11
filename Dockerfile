# =============================================================================
# Multi-stage Dockerfile for WerePups Online
# Frontend and backend build in PARALLEL for faster builds.
# =============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund --prefer-offline
COPY index.html index.tsx index.css* tsconfig.json vite.config.ts ./
COPY components/ ./components/
COPY services/ ./services/
COPY utils/ ./utils/
COPY App.tsx constants.ts types.ts metadata.json ./
RUN npx vite build

# --- Stage 2: Build Backend (runs in parallel with Stage 1) ---
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o werewords-server .

# --- Stage 3: Minimal production image ---
FROM scratch
COPY --from=backend-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=backend-builder /app/werewords-server /app/werewords-server
COPY --from=frontend-builder /app/dist /app/static
WORKDIR /app
EXPOSE 8080
ENTRYPOINT ["./werewords-server"]
