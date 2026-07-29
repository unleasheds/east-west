FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_BASE=/
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_STRIPE_PUBLISHABLE_KEY

ENV VITE_BASE=$VITE_BASE
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────────
# The SPA is served by a zero-dependency Node edge server rather than a static
# file server, because it rewrites each response's <head> for the requested URL.
# That is what gives crawlers real titles, canonicals and Open Graph tags.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.mjs ./server.mjs
COPY --from=builder /app/shared ./shared

# Only the API base needs to be known at runtime; everything else is baked in.
ENV PORT=8080
EXPOSE 8080

USER node
CMD ["node", "server.mjs"]
