#!/bin/bash

echo "🚀 Starting DuuniJobs Backend..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install --legacy-peer-deps
fi

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate deploy

# Seed data if needed
echo "🌱 Seeding database..."
npm run prisma:seed || echo "Seed already run or failed, continuing..."

# Start the server
echo "✅ Starting server..."
npm run start:dev

