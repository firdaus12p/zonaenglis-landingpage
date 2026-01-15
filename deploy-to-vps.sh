#!/bin/bash
# 🚀 Auto-Deploy Script for Zona English VPS
# Usage: bash deploy-to-vps.sh

set -e  # Exit on error

echo "🚀 Starting deployment to VPS..."
echo "================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Pull latest code
echo -e "${BLUE}📥 Step 1: Pulling latest code from Git...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git pull successful${NC}"
else
    echo -e "${RED}❌ Git pull failed${NC}"
    exit 1
fi

# Step 2: Install frontend dependencies
echo -e "${BLUE}📦 Step 2: Installing frontend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${RED}❌ Frontend npm install failed${NC}"
    exit 1
fi

# Step 3: Build frontend
echo -e "${BLUE}🔨 Step 3: Building frontend...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

# Step 4: Install backend dependencies
echo -e "${BLUE}📦 Step 4: Installing backend dependencies...${NC}"
cd backend
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend npm install failed${NC}"
    exit 1
fi
cd ..

# Step 5: Restart backend with PM2
echo -e "${BLUE}🔄 Step 5: Restarting backend service...${NC}"
pm2 restart zonaenglish-backend
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend restarted successfully${NC}"
else
    echo -e "${RED}❌ Backend restart failed${NC}"
    exit 1
fi

# Step 6: Show PM2 status
echo -e "${BLUE}📊 Step 6: Checking PM2 status...${NC}"
pm2 status zonaenglish-backend

echo ""
echo "================================"
echo -e "${GREEN}✨ Deployment completed successfully!${NC}"
echo "🌐 Website: https://zonaenglish.com"
echo "📊 Backend: https://zonaenglish.com/api"
echo ""
echo "💡 Tips:"
echo "  - View logs: pm2 logs zonaenglish-backend"
echo "  - Monitor: pm2 monit"
echo "  - Stop: pm2 stop zonaenglish-backend"
echo "================================"
