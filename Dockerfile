FROM node:20-alpine AS builder
WORKDIR /app

# package files 복사
COPY package*.json ./

# 개발 의존성 포함하여 설치 (빌드에 필요)
RUN npm ci

# 소스 코드 복사
COPY . .

# 빌드 실행
RUN npm run build

# 운영 이미지
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 운영 의존성만 설치
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 빌드 결과물 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.* ./

EXPOSE 3000
CMD ["npm", "start"]
