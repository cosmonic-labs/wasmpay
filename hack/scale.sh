#!/bin/bash

# assumed nordhaven built, http provider started as id 'http'

if [ -z "$HOST_ID" ]; then
  HOST_ID=$(wash get hosts -t 10 -o json | jq -r '.hosts[0].id')
fi

for i in {1..10000}
do
  wash start component ./nordhaven-validator/build/nordhaven-validator.composed_s.wasm v$i --host-id $HOST_ID --skip-wait
  wash config put v$i-host host=v$i
  wash link put http v$i --link-name v$i --interfaces incoming-handler wasi http --source-config v$i-host
done
