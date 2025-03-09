#!/bin/sh

echo "Running migrations..."
npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma

echo "Generating Prisma client..."
npx prisma generate --schema=./apps/backend/prisma/schema.prisma

# Check if the database needs to be filled in
if [ "$SEED_DATABASE" = "true" ]; then
  echo "Checking and seeding database if empty..."
  npx ts-node ./apps/backend/scripts/seed-db.ts
else
  echo "Skipping database seeding (SEED_DATABASE is not set to true)"
fi

echo "Starting application with Turborepo..."
npx turbo run start --filter=backend