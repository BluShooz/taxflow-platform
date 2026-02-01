#!/bin/bash

# Database Migration Script
# This script runs Prisma migrations and seeds the database

set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate dev --name init

echo "✅ Migrations completed"

echo "🌱 Seeding database..."
npm run db:seed

echo "✅ Database setup complete!"
