# =============================================================================
# Dockerfile for WerePups Online
# Frontend is pre-built (dist/ committed to repo). Only Go backend is built here.
# =============================================================================

# --- Stage 1: Build Backend ---
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY server/go.mod server/go.sum ./
RUN go mod download
COPY server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o werewords-server .

# --- Stage 2: Minimal production image ---
FROM alpine:3.20
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/werewords-server .
COPY dist/ ./static/
EXPOSE 8080
CMD ["./werewords-server"]
