FROM node:20-alpine AS builder

WORKDIR /app

# Package fayllarini nusxalash
COPY package*.json ./

# Dependency larni o'rnatish
RUN npm ci

# TypeORM entitylari uchun (agar kerak bo'lsa)
RUN npm run build || true

# Source kodni nusxalash
COPY . .

# Build qilish
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Build qilingan fayllarni nusxalash
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Portni ochish
EXPOSE 3000

# Boshlash
CMD ["node", "dist/main.js"]