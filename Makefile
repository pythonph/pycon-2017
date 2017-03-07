.PHONY: all
all:
	export $(cat .env | xargs)
	python build.py
	yarn build
