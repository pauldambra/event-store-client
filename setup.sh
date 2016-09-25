#! /bin/bash

set -eu

# ensure that eventstore ends when this process does
trap "kill 0" SIGINT

function clean {
	mkdir -p ./build
	rm -rf ./build/*
	mkdir -p ./build/server
}

function setup_server {
	default_download_url="http://download.geteventstore.com/binaries/EventStore-OSS-MacOSX-v3.9.1.tar.gz"
	download_url=${ES_DOWNLOAD_URL:-$default_download_url}

	curl -o ./build/eventstore.tar.gz $download_url 	

	tar -xvf ./build/eventstore.tar.gz -C ./build/server --strip 1
}

function start_server {
	(
		cd ./build/server
		./eventstored -MemDb --run-projections=SYSTEM &> server.out.log &
	)
}

function get_eventstore_status {
	curl -I -X GET -H "Accept:application/vnd.eventstore.atom+json" "http://127.0.0.1:2113/web/index.html" | head -n 1|cut -d$' ' -f2
}

function wait_for_server_to_start {
	for i in {1..5} 
	do 
	 status_code=$(get_eventstore_status)
	 echo "got status code $status_code from server"
	 if [ "$status_code" == "200" ]
	 	then
	 		echo "server ready"
	 		break  
	 fi
	 sleep 5
	done
}

function main {
	clean
	setup_server
	start_server

	wait_for_server_to_start
	
	test_output=`npm test 2>&1` || echo $test_output

	echo "all done!"
	kill 0
}

main

