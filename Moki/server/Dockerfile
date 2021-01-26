FROM node:10 AS dev

WORKDIR /app

ENV NODE_ENV=dev
ENV PORT=5000
ENV DEBUG=moki-express,express

RUN mkdir /etc/abc-monitor ; \
  echo "{}" > /etc/abc-monitor/defaults.json && \
  echo "{}" > /etc/abc-monitor/monitor.json

RUN npm install -g nodemon

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY package*.json /app/
COPY . .

EXPOSE $PORT

CMD npm install && nodemon

FROM node:10-alpine AS prod

WORKDIR /app

ENV NODE_ENV=prod
ENV PORT=5000

COPY --from=dev /app/* /usr/src/app/

RUN npm install --production && npm ci --only=production

EXPOSE $PORT

CMD npm run start
