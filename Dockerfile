FROM node:20-alpine

WORKDIR /app

COPY server/package*.json ./
RUN npm ci --include=dev

COPY server/ .
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/main"]
