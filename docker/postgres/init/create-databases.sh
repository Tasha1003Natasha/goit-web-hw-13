#!/bin/bash
set -e

if [ -z "$POSTGRES_DB_QUOTES" ]; then
    echo "POSTGRES_DB_QUOTES is not set. Skipping Django database creation."
    exit 0
fi

if [ "$POSTGRES_DB_QUOTES" = "$POSTGRES_DB" ]; then
    echo "POSTGRES_DB_QUOTES is the same as POSTGRES_DB. Skipping duplicate database creation."
    exit 0
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE "$POSTGRES_DB_QUOTES";
EOSQL
