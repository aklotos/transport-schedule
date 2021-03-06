FROM node:6.9.4-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install
RUN npm install bunyan -g

COPY . /usr/src/app

EXPOSE 8080

CMD ["npm", "start"]
