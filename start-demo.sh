#!/bin/bash

PIDS=()

trap 'onInterrupt' INT

onInterrupt() {
    for p in "$PIDS"
    do
        kill -TERM $p > /dev/null 2>&1
        wait
    done
}

npm start demo/alice.json &
PIDS+=`echo $!`

npm start demo/bob.json &
PIDS+=`echo $!`

npm start demo/charles.json &
PIDS+=`echo $!`

cat # Wait for interrupt
