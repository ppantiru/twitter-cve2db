#!/bin/bash
openssl rand -base64 700 > file.key
sudo chmod 400 file.key

docker-compose up -d

sleep 5

docker exec mongo1 /scripts/rs-init.sh
