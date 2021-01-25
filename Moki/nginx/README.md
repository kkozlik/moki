# nginx docker

The nginx docker is used to expose both the backend api and the frontend client
under the same dns.

The `dev` stage redirect all request where uri start by `/api` to the api docker.
Other request are handled by the front one.

The `prod` stage force the redirection from http to http(s). 
**TODO** Certs are handled by LE (**must be optional, some server are runned behind fw**).

## Makefile 

```
13:30:21 ❯ make help
Usage: 

  all                Build the docker image
  gen-certs          Generate the openssl file (cert.pem and key.pem)
  clean              Remove the generated certs
  docker-build       Build the release ready docker image
  docker-build-dev   Build the dev docker image
  help               Prints this help message
```

## stuffs

### generate ssl key+cert one line

```bash
$ openssl req -new -newkey rsa:4096 -sha256 -days 365 -nodes \
	-subj "/C=DE/ST=Berlin/L=Berlin/O=Global Security/OU=IT Department/CN=example.com" \
	-out $(CERT) -keyout $(KEY)`
```

### docker multi stage 

[Have a look at the official doc](https://docs.docker.com/develop/develop-images/multistage-build/)

### docker container name as hostnam

Once again, [have a look at the official doc](https://docs.docker.com/compose/networking/) - 
"Each container for a service (...) a hostname identical to the container name."
