#!/bin/sh

echo "Running migrations..."
npx prisma migrate deploy --schema=./apps/backend/prisma/schema.prisma

echo "Generating Prisma client..."
npx prisma generate --schema=./apps/backend/prisma/schema.prisma

echo "Starting application with Turborepo..."
npx turbo run start --filter=backend