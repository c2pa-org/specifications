#!/bin/bash

# add x for debugging
set -eu

# define the docker containers & file to be processed
DOCKER_IMG=timaschew/link-checker
BASE_NAME="./build/site/"

#detect platform that we're running on...
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac

# make sure we have an output dir
mkdir -p output

# check the current path
curPath=`pwd`
echo "curPath = ${curPath}"
if [ "${machine}" == "MinGw" ]; then
	curPath=/`pwd`
fi

# this is the core routine to process one file...
doIt() {
	# make sure we have the docker images
	if [[ "$(docker images -q "${DOCKER_IMG}" 2> /dev/null)" == "" ]]; then
		echo "Pulling LinkChecker Docker image"
		docker pull "${DOCKER_IMG}"
	fi

	# Run it
	echo "Running LinkChecker"
	docker run --rm -v "${curPath}":"${curPath}" -w "${curPath}" "${DOCKER_IMG}" "${BASE_NAME}"	
}

doIt