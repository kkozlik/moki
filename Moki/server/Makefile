NAME	= moki-server
RPM_NAME	= $(NAME)

RELEASE			?= $(shell sed -n 's/^ *Version: *//p' $(NAME).spec 2> /dev/null || echo "alpha")
GIT_COMMIT	:= $(shell git rev-parse --short HEAD 2> /dev/null || echo "dev")
VERSION			?= "$(RELEASE)-$(GIT_COMMIT)"

# docker build target
BUILD_TARGET	=	dev
# docker runtime shared volumes
VOLUMES = -v `pwd`/:/app/

# docker run/exec command
CMD	=

PORT	= 5000

.PHONY: $(NAME)
## moki-express: Default target, run build
$(NAME): build

.PHONY: build
## build: Build the nodejs docker image (default target)
build:
	@echo " -- Building $(NAME) docker image (target: $(BUILD_TARGET)) ..."
	@docker build -t $(NAME) --target=$(BUILD_TARGET) .
	@echo " -- Building $(NAME) docker image: done"

.PHONY: build-prod
## build-prod: Build a production readu nodejs docker image
build-prod:
	@echo " -- Building $(NAME) prod docker image ..."
	@ $(MAKE) build -e BUILD_TARGET=prod
	@echo " -- Building $(NAME) prod docker image: done"

.PHONY: run
## run: Run the nodejs server from the docker image
run:
	@echo " -- Running $(NAME) docker image ..."
	@docker run	--rm -it \
			--user "$(id -u):$(id -g)" \
			$(VOLUMES) \
			--env-file .dockerenv \
			-p $(PORT):$(PORT) \
			--net=host \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

.PHONY: run-prod
## run-prod: Run the nodejs prod server from the docker image
run-prod: build-prod
	@echo " -- Running $(NAME) docker image ..."
	@docker run	--rm -it \
			--env-file .dockerenv \
			-p $(PORT):$(PORT) \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

# .PHONY: test
# ## test: Run the mocha unit test
# test:
#		@echo " -- Testing $(NAME) ..."
#		@ $(MAKE) run -e CMD="npm run test"
#		@echo " -- Testing $(NAME): done"

.PHONY: exec
## exec: Run a custom command inside a running the docker container
exec:
	@echo " -- Runnin $(CMD) in $(NAME) ..."
	@ docker exec -it $(NAME) $(CMD)
	@echo " -- Runnin $(CMD) in $(NAME): done"

.PHONY: stop
## stop: Stop the docker image
stop:
	@echo " -- Stopping $(NAME) docker image ..."
	@docker stop -t 0 $(NAME) 2> /dev/null ; true
	@echo " -- Stopping $(NAME) docker image: done"

.PHONY: lint
## lint: Run the linter
lint:
	$(MAKE) run -e CMD="npm run lint"
	$(MAKE) run -e CMD="npm run pretty"

.PHONY: all
## all: Build then run the dockerized nodejs
all: build run

.PHONY: elastic
## elastic: Start the elastic container

elastic:
	docker run --rm --name $(NAME)-es \
		 -p 9200:9200 -p 9300:9300 \
		--net=host \
		-e "discovery.type=single-node" \
docker.elastic.co/elasticsearch/elasticsearch:7.7.1

.PHONY: stop-elastic
## stop-elastic: Stop the elastic container
stop-elastic:
	$(MAKE) stop -e NAME="$(NAME)-es"

.PHONY: rpmtar
## create tarbal for rpm packaging
PERCENT := %
rpmtar:
	RPM_VERSION=`cat $(RPM_NAME).spec|grep -e "^Version:"|awk '{print $$2}'`; \
  RPM_RELEASE=`cat $(RPM_NAME).spec|grep -e "^Release:"|awk '{print $$2}'| awk -F $(PERCENT) '{print $$1}'`; \
    echo "RPM_VERSION=$${RPM_VERSION}"; \
    echo "RPM_RELEASE=$${RPM_VERSION}"; \
    tar -C .. \
    --exclude=$(notdir $(CURDIR))/tmp \
    --exclude=.svn* \
    --exclude=.git* \
    --exclude=.\#* \
    --exclude=*.[do] \
    --exclude=*.la \
    --exclude=*.lo \
    --exclude=*.so \
    --exclude=*.il \
    --exclude=*.gz \
    --exclude=*.bz2 \
    --exclude=*.tar \
    --exclude=*~ \
    -cf - $(notdir $(CURDIR)) | \
    (mkdir -p tmp/_tar1; mkdir -p tmp/_tar2 ; \
    cd tmp/_tar1; tar -xf - ) && \
    mv tmp/_tar1/$(notdir $(CURDIR)) \
    tmp/_tar2/"$(RPM_NAME)-$${RPM_VERSION}" && \
    (cd tmp/_tar2 && tar -zcf ../../"$(RPM_NAME)-$${RPM_VERSION}-$${RPM_RELEASE}".tar.gz "$(RPM_NAME)-$${RPM_VERSION}" ) ; \
    rm -rf tmp

.PHONY: help
## help: Prints this help message
 help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'

.PHONY: install_mon
install_mon:
	install -d $(DESTDIR)/usr/share/Moki/server
	cp -r js $(DESTDIR)/usr/share/Moki/server/
	cp -r src $(DESTDIR)/usr/share/Moki/server/
	cp package*.json $(DESTDIR)/usr/share/Moki/server
	# install moki service file
	install -d $(DESTDIR)/usr/lib/systemd/system
	install -m 0644 moki-server.service $(DESTDIR)/usr/lib/systemd/system/
	# perform moki API install
	cd $(DESTDIR)/usr/share/Moki/server
	npm install
	mv node_modules node_modules_dev
	NODE_ENV=production npm install --production
	mv node_modules node_modules_prod
	# fix absolute paths that npm leaves there due to npm feature/bug
	find $(DESTDIR)/usr/share/Moki -name "package.json" -exec sed -i 's#$(DESTDIR)##' '{}' \;
