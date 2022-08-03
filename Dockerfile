FROM node:14.17.3

ENV NODE_ENV=production

RUN mkdir /app && chown -R node:node /app

WORKDIR /app

COPY --chown=node:node . /app 

USER node

RUN npm install

CMD node -r tsconfig-paths/register -r ts-node/register ./src/index.ts