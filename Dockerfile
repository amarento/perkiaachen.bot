# build image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm i
COPY . .
RUN npm run build

# production image
FROM node:18-alpine
WORKDIR /app
COPY package.json .
RUN npm i --only=production

COPY --from=builder /app/dist/ .
COPY .env .
RUN mkdir images
COPY images images
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]