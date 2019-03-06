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

npm start demo/component-supplier.json &
PIDS+=`echo $!`

npm start demo/final-assembly-plant.json &
PIDS+=`echo $!`

npm start demo/carrier.json &
PIDS+=`echo $!`

npm start demo/cross-dock.json &
PIDS+=`echo $!`

cat # Wait for interrupt
