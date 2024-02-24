FROM node:16-alpine

RUN mkdir -p /app

WORKDIR /app
ADD . /app
RUN npm install

EXPOSE 8282 8282

CMD ["npm", "start"]