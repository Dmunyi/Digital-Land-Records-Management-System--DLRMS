#!/bin/bash

# DLRMS Quick Start Script
# This script helps you quickly start the DLRMS application

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Digital Land Records Management System (DLRMS)           ║"
echo "║  Quick Start Script                                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "${GREEN}✓ npm ${NPM_VERSION}${NC}"

# Check MongoDB
if ! command -v mongosh &> /dev/null; then
    echo -e "${YELLOW}⚠ MongoDB shell (mongosh) not found in PATH${NC}"
    echo "  Note: MongoDB should still be running as a service"
else
    echo -e "${GREEN}✓ MongoDB shell available${NC}"
fi

echo ""
echo "🔧 Setting up Backend..."

# Navigate to backend
cd backend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "  Installing npm packages..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Backend dependencies installed${NC}"
else
    echo -e "${GREEN}  ✓ Backend dependencies already installed${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "  Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}  ✓ .env file created${NC}"
    echo -e "${YELLOW}  Please edit backend/.env with your configuration${NC}"
else
    echo -e "${GREEN}  ✓ .env file exists${NC}"
fi

# Navigate back
cd ..

echo ""
echo "🎨 Setting up Frontend..."

# Navigate to frontend
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "  Installing npm packages..."
    npm install > /dev/null 2>&1
    echo -e "${GREEN}  ✓ Frontend dependencies installed${NC}"
else
    echo -e "${GREEN}  ✓ Frontend dependencies already installed${NC}"
fi

# Navigate back
cd ..

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "📖 Next steps:"
echo ""
echo "1. Start MongoDB:"
echo "   - Windows: Services > MongoDB > Start"
echo "   - macOS: brew services start mongodb-community"
echo "   - Linux: sudo systemctl start mongod"
echo ""
echo "2. Start Backend Server (Terminal 1):"
echo "   cd backend"
echo "   npm start"
echo ""
echo "3. Start Frontend Server (Terminal 2):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "4. Open browser:"
echo "   http://localhost:3000"
echo ""
echo "5. Login with test account:"
echo "   Email: admin@dlrms.gov"
echo "   Password: admin123"
echo ""
echo "📚 For more information, see:"
echo "   - README.md - Project overview"
echo "   - docs/SETUP_GUIDE.md - Detailed setup instructions"
echo "   - docs/USER_GUIDE.md - How to use the system"
echo ""
