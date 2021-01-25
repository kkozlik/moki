NAME		= moki-nginx
RELEASE	= dev

IMG_NAME	= $(URL)/$(NAME):$(RELEASE)
IMG_DEV		= $(NAME)-dev

CERT	= cert.pem
KEY		= key.pem

.PHONY: all
## all: Default target, call all
all: $(NAME)
.PHONY: all docker-build
## moki-nginx: Default target, call docker-build
$(NAME): docker-build
.PHONY: docker-build
## docker-build: Build the docker image
docker-build:
	docker build --rm -t $(NAME):$(RELEASE) .

.PHONY: docker-tag
## docker-tag: Tag the docker image
docker-tag:
	docker tag $(NAME):$(RELEASE) $(IMG_NAME)

.PHONY: docker-push
## docker-push: Push the docker image to the registry $(URL)
docker-push:
	docker push $(IMG_NAME)

## keys: Gen a cert and key
keys: $(CERT)
$(CERT): $(KEY)
$(KEY):
	openssl req -new -newkey rsa:4096 -sha256 -days 365 -nodes \
		-subj "/C=DE/ST=Berlin/L=Berlin/O=Frafos GmbH/OU=IT Department/CN=localhost" \
		 -out $(CERT) -keyout $(KEY)

.PHONY: clean
## clean: Remove builded artifacts
clean:
	rm -f $(CERT) $(KEY)

.PHONY: help
## help: Prints this help message
 help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
