FROM node:10-alpine

WORKDIR /app

ADD package.json .
ADD package-lock.json .

RUN npm install --production

ADD . .

CMD ["node", "index.js"]
