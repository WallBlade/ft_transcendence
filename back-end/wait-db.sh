#!/bin/bash
# wait-db.sh

# entrypoint.sh

# set -e

# shift

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$DATABASE_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

python manage.py makemigrations --noinput
python manage.py migrate --noinput

exec "$@"
