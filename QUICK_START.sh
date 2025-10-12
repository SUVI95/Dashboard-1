#!/bin/bash

echo "════════════════════════════════════════════════════════"
echo "🚀 DuuniJobs Quick Start Script"
echo "════════════════════════════════════════════════════════"
echo ""

# Check if DATABASE_URL is configured
if grep -q "DATABASE_URL=postgresql://neondb_owner:npg_" /Users/gisrieliamaro/Dashboard-1-2/backend/.env; then
    echo "⚠️  WARNING: Placeholder database URL detected!"
    echo ""
    echo "You need to update your Neon connection string:"
    echo "1. Go to: https://console.neon.tech/app/projects/soft-cell-88391411"
    echo "2. Copy your connection string"
    echo "3. Edit: backend/.env (line 7)"
    echo "4. Replace DATABASE_URL with your actual connection"
    echo ""
    echo "Then run this script again!"
    echo ""
    exit 1
fi

echo "✅ Database URL configured"
echo ""

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "🔴 Redis is not running. Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi

echo "✅ Redis is running"
echo ""

# Navigate to backend
cd /Users/gisrieliamaro/Dashboard-1-2/backend

echo "📊 Deploying database migrations..."
npx prisma migrate deploy

if [ $? -eq 0 ]; then
    echo "✅ Migrations deployed"
    echo ""
else
    echo "❌ Migration failed. Check your database connection."
    exit 1
fi

echo "🌱 Seeding demo data..."
npm run prisma:seed

if [ $? -eq 0 ]; then
    echo "✅ Demo data seeded"
    echo ""
else
    echo "⚠️  Seeding failed (might already be seeded)"
    echo ""
fi

echo "════════════════════════════════════════════════════════"
echo "🎉 Setup Complete! Ready to start services"
echo "════════════════════════════════════════════════════════"
echo ""
echo "To start your platform:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd /Users/gisrieliamaro/Dashboard-1-2/backend"
echo "  npm run start:dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd /Users/gisrieliamaro/Dashboard-1-2"
echo "  npm start"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Demo Accounts:"
echo "  Admin: admin@duunijobs.fi / Admin123!"
echo "  Candidate: candidate@test.com / Candidate123!"
echo ""
echo "════════════════════════════════════════════════════════"
