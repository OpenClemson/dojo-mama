
all: prod

install:
	cd scripts; ./install && ./compile_less

css:
	cd scripts; ./compile_less

prod:
	cd scripts/build; ./build

dev:
	cd scripts/build; ./build app development

.PHONY: install css prod dev release release-dev
