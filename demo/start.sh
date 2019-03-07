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

DEMO_FOLDER=`pwd`

cd ..

for FILE in $(find $DEMO_FOLDER -iname "*.json");
do
    npm start "$FILE" &
    PIDS+=`echo $!`
done

cat # Wait for interrupt
