# =============================================================================
# Multi-stage Dockerfile for Werewords Online
# Builds the React frontend and Go backend into a single lightweight image.
# =============================================================================

# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Stage 2: Build Backend ---
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app
COPY server/ .
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o werewords-server .

# --- Stage 3: Production Image ---
FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /app

# Copy the compiled Go binary
COPY --from=backend-builder /app/werewords-server .

# Copy the built frontend into the static directory the Go server serves
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8080

CMD ["./werewords-server"]
