#!/bin/sh

echo "Waiting for PostgreSQL to start..."
until pg_isready -h db -U ${POSTGRES_USER} -d ${POSTGRES_DB}
do
  echo "Waiting for database connection..."
  sleep 2
done
echo "PostgreSQL started"

echo "Running migrations..."
npx prisma migrate deploy
echo "Migrations completed"

echo "Generating Prisma client..."
npx prisma generate
echo "Prisma client generated"

echo "Starting application..."
npm run start