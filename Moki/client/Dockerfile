FROM node:10 as dev

# set env var
ENV NODE_ENV=dev

# Expose port
EXPOSE 3000

# define work directory
WORKDIR /app

# Copy source
COPY . .

CMD npm install && npm start

FROM node:10 as build

WORKDIR /app
COPY ./package.json ./package.json
RUN npm install
COPY . .

RUN npm run build -o app

# multistage build...
# this runs a lil nginx instance to serve the app
FROM nginx:alpine as prod

EXPOSE 3000
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
