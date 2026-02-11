# =============================================================================
# Multi-stage Dockerfile for WerePups Online
# =============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --no-audit --no-fund
COPY . .
RUN ./node_modules/.bin/vite build

# --- Stage 2: Build Backend (parallel with Stage 1) ---
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o werewords-server .

# --- Stage 3: Minimal production image ---
FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=backend-builder /app/werewords-server .
COPY --from=frontend-builder /app/dist ./static
EXPOSE 8080
CMD ["./werewords-server"]
