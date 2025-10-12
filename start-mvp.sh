#!/bin/bash

echo "🚀 Starting DuuniJobs MVP..."
echo "================================"

# Check if Redis is running
if ! pgrep -x "redis-server" > /dev/null
then
    echo "⚠️  Redis is not running. Please start Redis first:"
    echo "   redis-server"
    exit 1
fi

# Start backend in background
echo "🔧 Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 10

# Start frontend
echo "🎨 Starting Frontend..."
cd ..
npm start

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
