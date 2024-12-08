FROM node:18-alpine

ENV NODE_ENV=dev

WORKDIR /app

COPY package.json package-lock.json tsconfig.json .env.prod ./
RUN npm install

CMD ["npm", "run", "start:dev"]