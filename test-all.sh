#!/bin/bash

echo "🧪 Testing MongoDB Connection and API Endpoints"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Database Connection
echo "📊 Test 1: Database Connection"
cd /home/luffy/animeverse/apps/server
node test-db-connection.js > /tmp/db-test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
    echo "   $(grep 'Found' /tmp/db-test.log)"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    cat /tmp/db-test.log
fi
echo ""

# Test 2: Check if server is running
echo "📡 Test 2: Server Health Check"
SERVER_RESPONSE=$(curl -s http://localhost:3000 2>&1)
if echo "$SERVER_RESPONSE" | grep -q "OK"; then
    echo -e "${GREEN}✅ Server is running${NC}"
else
    echo -e "${YELLOW}⚠️  Server might not be running on port 3000${NC}"
    echo "   Please start it with: cd apps/server && npm run dev"
fi
echo ""

# Test 3: Test API endpoint
echo "🔌 Test 3: API Endpoint /api/shows"
API_RESPONSE=$(curl -s http://localhost:3000/api/shows?limit=5 2>&1)
if echo "$API_RESPONSE" | grep -q "title"; then
    COUNT=$(echo "$API_RESPONSE" | grep -o '"title"' | wc -l)
    echo -e "${GREEN}✅ API endpoint working${NC}"
    echo "   Found $COUNT shows"
else
    echo -e "${YELLOW}⚠️  API endpoint returned unexpected response${NC}"
    echo "   Response: ${API_RESPONSE:0:100}..."
fi
echo ""

echo "================================================"
echo "📋 Summary:"
echo "   - Check that both tests pass"
echo "   - If server isn't running, start with:"
echo "     cd apps/server && npm run dev"
echo "   - Then run this test again"
echo ""
