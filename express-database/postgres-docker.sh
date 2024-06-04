#!/bin/bash
sudo docker create \
        --name CONTAINER-NAME \
        --restart always \
        --network host \
        -e TZ='Asia/Kolkata' \
        -e POSTGRES_PASSWORD=YOUR-DATABASE-PASSWORD \
        -e PGDATA=/var/lib/postgresql/data/pgdata \
        -v /YOUR/DB/PATH:/var/lib/postgresql/data \
        postgres
