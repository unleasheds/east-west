# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app

# Force development so devDeps (nest CLI) are installed
ENV NODE_ENV=development

COPY server/package*.json ./
RUN npm ci

COPY server/ .
RUN ./node_modules/.bin/nest build

# ---- Run stage ----
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
