#!/bin/bash

# Production startup script for Tic-Tac-Toe Weapon Collection Game

set -e

echo "🚀 Starting Tic-Tac-Toe Weapon Collection Game in Production Mode"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Not in project root directory. Please run from project root."
    exit 1
fi

# Kill any existing processes on ports 3000 and 3001
print_status "Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Set production environment
export NODE_ENV=production

# Check if build exists, if not build it
if [ ! -d "backend/dist" ] || [ ! -d "frontend/build" ]; then
    print_status "Building application for production..."
    npm run build
fi

print_status "Starting backend server..."

# Start backend in background
cd backend
nohup npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 5

# Check if backend is running
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "Backend started successfully on port 3001"
else
    print_error "Backend failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

print_status "Starting frontend server..."

# Check if serve is available, if not install it locally
if ! command -v serve &> /dev/null; then
    print_status "Installing 'serve' package locally..."
    cd frontend
    npm install serve --save-dev
    cd ..
fi

# Start frontend using npx serve (works with both global and local installations)
cd frontend
nohup npx serve -s build -l 3000 > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
sleep 3

# Check if frontend is running
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Frontend started successfully on port 3000"
else
    print_error "Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit 1
fi

# Save PIDs for stopping later
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

print_success "🎮 Game is now running in production mode!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "❤️  Health:   http://localhost:3001/health"
echo ""
echo "📋 To stop the servers, run: ./scripts/stop-production.sh"
echo "📋 To view logs: tail -f logs/backend.log logs/frontend.log"
echo ""
echo "🎯 Ready for epic battles!" 