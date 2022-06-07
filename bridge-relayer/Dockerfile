FROM node:16.13.0-alpine

WORKDIR /srv/app

COPY dist/* ./

COPY package.json yarn.lock ./

RUN yarn install --production --pure-lockfile --non-interactive

EXPOSE 3000

ENTRYPOINT ["node", "main.js"]
