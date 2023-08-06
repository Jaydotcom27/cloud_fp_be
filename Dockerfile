FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY index.js /usr/src/app/index.js
COPY my-database.db /usr/src/app/my-database.db

EXPOSE 3001

CMD ["node", "index.js"]