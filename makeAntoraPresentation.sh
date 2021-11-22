#!/bin/bash

# add x for debugging
set -eu

# define the docker containers & file to be processed
AD_DOCKER_IMG=asciidoctor/docker-asciidoctor
BASE_NAME=UsingAntora


#detect platform that we're running on...
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac

# make sure we have an output dirs
mkdir -p output

# check the current path
curPath=`pwd`
echo "curPath = ${curPath}"
if [ "${machine}" == "MinGw" ]; then
	curPath=/`pwd`
fi

# this is the core routine to process one file...
convertOne() {
	# make sure we have the docker images
	if [[ "$(docker images -q "${AD_DOCKER_IMG}" 2> /dev/null)" == "" ]]; then
		echo "Pulling AsciiDoc Docker image"
		docker pull "${AD_DOCKER_IMG}"
	fi

	# Create the presentation
	echo "Converting AsciiDoc to RevealJS"
	docker run --rm -v "${curPath}":"${curPath}" -w "${curPath}" "${AD_DOCKER_IMG}" asciidoctor-revealjs -a revealjsdir=https://cdnjs.cloudflare.com/ajax/libs/reveal.js/3.9.2 -r asciidoctor-diagram -D ./output -a data-uri -o "${BASE_NAME}".html "${BASE_NAME}".adoc	
}

convertOne