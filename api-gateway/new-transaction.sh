#!/bin/bash

URL="http://localhost:8000/accounts/$BANK_USER/transactions"
read -p "Amount: " amount
read -p "Description: " description
curl $URL \
    -d \
    "{\"description\":\"$description\",\"amount\":$amount,\"status\":\"Complete\",\"method\":\"Credit\",\"date\":$(date +%s)}"
