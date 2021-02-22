ARG img=nginx:alpine
FROM ${img} as dev

RUN apk add apache2-utils

# create dummy http user:""
COPY htpasswd /etc/nginx/htpasswd

# nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# temporary tls certificate
COPY cert.pem /etc/nginx/conf.d/
COPY key.pem /etc/nginx/conf.d/

FROM ${img} as prod

# create dummy http user:""
COPY htpasswd /etc/nginx/htpasswd

# nginx.conf
COPY nginx.prod.conf /etc/nginx/nginx.conf

# temporary tls certificate
COPY cert.pem /etc/nginx/conf.d
COPY key.pem /etc/nginx/conf.d
