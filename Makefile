all: prod

install:
	npm prune
	npm install
	bower prune
	bower install
	gulp install

dev: install
	gulp build
	gulp release

prod: install
	gulp build --production
	gulp release --production

.PHONY: all install dev prod 
