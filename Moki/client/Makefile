NAME		= moki-react
RELEASE	= dev

PORT	= 3000
CMD	=
IMG_NAME	= $(URL)/$(NAME):$(RELEASE)
VOLUMES = -v `pwd`:/app

.PHONY: $(NAME)
## moki-react-express-app: Default target, run build
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
