NAME        		= api-mocker
SSH_AGENT			= default
IMAGE_REPO  		= teamwork/$(NAME)

DEV_ENV_TAG     	= $(IMAGE_REPO)

 ifneq ($(wildcard ${HOME}/.npmrc),)
	NPM_SECRET = --secret id=npm,src=${HOME}/.npmrc
 else
	NPM_SECRET =
 endif

build:
	docker buildx build \
	  -t $(DEV_ENV_TAG) \
	  --load \
	  $(NPM_SECRET) \
	  --ssh $(SSH_AGENT) \
	  .

push:
	docker buildx create --use
	docker buildx build \
	  -t $(DEV_ENV_TAG) \
	  --platform linux/amd64,linux/arm64 \
	  --push \
	  --progress=plain \
	  $(NPM_SECRET) \
	  --ssh $(SSH_AGENT) \
	  .