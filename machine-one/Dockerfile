# --- Build stage: install only production deps ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev || npm install --omit=dev

# --- Runtime stage ---
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY public ./public
# sites/ is mounted as a volume in production; bake an empty dir + .gitkeep so the
# image is self-sufficient if no volume is attached.
RUN mkdir -p sites

EXPOSE 3000
CMD ["node", "src/server.js"]
