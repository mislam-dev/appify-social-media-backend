# stage 1 : builder
FROM node:22-alpine AS builder

WORKDIR /app


RUN npm install --global corepack@latest
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD [ "pnpm", "start:dev" ]