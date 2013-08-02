PACKAGE_NAME = disableaddons

all: xpi

xpi:
	./makexpi.sh -n $(PACKAGE_NAME)
