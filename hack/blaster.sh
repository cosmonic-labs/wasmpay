#!/bin/bash

# assumed nordhaven built, http provider started as id 'http'

for i in {1..10000}
do
  curl -H "host: v$i" localhost:8000 -d '{"origin": {"id": "bank1", "code": "BNK1", "country": "US", "currency": "USD", "name": "Bank One"}, "destination": {"id": "bank2", "code": "BNK2", "country": "UK", "currency": "GBP", "name": "Bank Two"}, "amount": 1000, "currency": "USD", "status": "Approved"}'
  echo ""
done

