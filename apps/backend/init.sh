#!/bin/sh

echo "Running migrations..."
npx prisma migrate deploy
echo "Generating Prisma client..."
npx prisma generate

echo "Starting application..."
npm run start