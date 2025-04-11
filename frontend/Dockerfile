FROM node:lts-alpine AS app

RUN npm install -g serve

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80
CMD [ "serve", "-s", "-p", "80", "dist" ]