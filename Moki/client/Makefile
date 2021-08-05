NAME			= moki-client
ifeq ($(TYPE), dev)
	RPM_NAME	= $(NAME)-dev
else
	RPM_NAME	= $(NAME)
endif 

RELEASE		= dev

RELEASE			?= $(shell sed -n 's/^ *Version: *//p' $(NAME).spec 2> /dev/null || echo "alpha")
GIT_COMMIT	:= $(shell git rev-parse --short HEAD 2> /dev/null || echo "dev")
VERSION			?= "$(RELEASE)-$(GIT_COMMIT)"

PORT	= 3000
CMD	=
IMG_NAME	= $(URL)/$(NAME):$(RELEASE)
VOLUMES = -v `pwd`:/app
D_FILE	= Dockerfile

.PHONY: $(NAME)
## moki-react-express-app: Default target, run build
$(NAME): build

.PHONY: build
## build: Build the nodejs docker image (default target)
build:
	@echo " -- Building $(NAME) docker image (target: $(BUILD_TARGET)) ..."
	@docker build --rm -t $(NAME) --target=$(BUILD_TARGET) --file=$(D_FILE) .
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
			-p $(PORT):$(PORT) \
			--net=host \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

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

.PHONY:		rpmtar
## rpmtar: Build the rpm tar ball
rpmtar:
	RPM_VERSION=`cat $(RPM_NAME).spec|grep -e "^Version:"|awk '{print $$2}'`; \
  	RPM_RELEASE=`cat $(RPM_NAME).spec|grep -e "^Release:"|awk '{print $$2}'`; \
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
  	--exclude=node_modules \
  	-cf - $(notdir $(CURDIR)) | \
  	(mkdir -p tmp/_tar1; mkdir -p tmp/_tar2 ; \
  	cd tmp/_tar1; tar -xf - ) && \
  	mv tmp/_tar1/$(notdir $(CURDIR)) \
  	tmp/_tar2/"$(RPM_NAME)-$${RPM_VERSION}" && \
  	(cd tmp/_tar2 && tar -zcf ../../"$(RPM_NAME)-$${RPM_VERSION}-$${RPM_RELEASE}".tar.gz "$(RPM_NAME)-$${RPM_VERSION}" ) ; \
  	rm -rf tmp; \
  	mkdir -p ~/rpmbuild/SOURCES ; \
  	cp "$(RPM_NAME)-$${RPM_VERSION}-$${RPM_RELEASE}".tar.gz ~/rpmbuild/SOURCES

.PHONY: rpm
## rpm: Build the rpm package
rpm: rpmtar
	rpmbuild --clean -bb $(RPM_NAME).spec

.PHONY: clean
## clean: remove the tarball and rpm package artifacts
clean:
	RPM_VERSION=`cat $(RPM_NAME).spec|grep -e "^Version:"|awk '{print $$2}'`; \
  	RPM_RELEASE=`cat $(RPM_NAME).spec|grep -e "^Release:"|awk '{print $$2}'`; \
  	rm -f ~/rpmbuild/SOURCES/$(RPM_NAME)-$${RPM_VERSION}-$${RPM_RELEASE}.tar.gz ; \
  	rm -f ~/rpmbuild/RPMS/x86_64/$(RPM_NAME)-$${RPM_VERSION}-$${RPM_RELEASE}.x86_64.rpm;

.PHONY:		help
## help: Prints this help message
help:
	@echo "Usage: \n"
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' |  sed -e 's/^/ /'
