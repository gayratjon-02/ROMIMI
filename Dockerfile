FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

RUN mkdir -p uploads

EXPOSE 5032

CMD ["npm", "run", "start:prod"]
