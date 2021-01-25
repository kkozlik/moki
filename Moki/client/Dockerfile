ARG img=docker.frafos.net/node:10
ARG img_nginx=docker.frafos.net/nginx:alpine
FROM ${img} as dev

# set env var
ENV NODE_ENV=dev

# Expose port
EXPOSE 3000

# define work directory
WORKDIR /app

# Copy source
COPY . .

CMD npm install && npm start

# FROM node:10 as build

# WORKDIR /app
# COPY ./package.json ./package.json
# RUN npm install
# COPY . .

# RUN npm run build -o app

# # multistage build...
# # this runs a lil nginx instance to serve the app
# FROM ${img_nginx} as prodpropr

# EXPOSE 3000
# COPY --from=build /app/build /usr/share/nginx/html
# COPY nginx.conf /etc/nginx/nginx.conf
FROM ${img} as prod

# set env var
ENV NODE_ENV=dev

# Expose port
EXPOSE 3000

# define work directory
WORKDIR /app

# Copy source
COPY . .

CMD npm install && npm start
