#!/bin/bash

# Debug script for anime reviews

echo "🔍 Debugging Anime Reviews Issue"
echo "=================================="
echo ""

# Check if MongoDB connection info is available
echo "1. Checking for reviews in database..."
echo "   (This requires MongoDB to be running and accessible)"
echo ""

# Test the API endpoint directly
echo "2. Testing API endpoint..."
echo ""

# Get first show from database
echo "📡 Fetching first show from API..."
FIRST_SHOW=$(curl -s "http://localhost:3000/api/shows?limit=1")

if [ -z "$FIRST_SHOW" ] || [ "$FIRST_SHOW" = "null" ]; then
  echo "❌ Could not fetch shows. Is the server running?"
  echo "   Start server with: npm run dev"
  exit 1
fi

echo "✅ Shows API is responding"
echo ""

# Extract show ID
SHOW_ID=$(echo "$FIRST_SHOW" | grep -o '"_id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$SHOW_ID" ]; then
  echo "⚠️  Could not extract show ID from response"
  echo "Response: $FIRST_SHOW" | head -c 200
  exit 1
fi

echo "📌 Testing with Show ID: $SHOW_ID"
echo ""

# Test reviews endpoint
echo "📡 Fetching reviews for show..."
REVIEWS_URL="http://localhost:3000/api/reviews/anime/$SHOW_ID"
echo "   URL: $REVIEWS_URL"
echo ""

REVIEWS_RESPONSE=$(curl -s -w "\n%{http_code}" "$REVIEWS_URL")
HTTP_CODE=$(echo "$REVIEWS_RESPONSE" | tail -n1)
REVIEWS_BODY=$(echo "$REVIEWS_RESPONSE" | sed '$d')

echo "   HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Reviews API is responding"
  
  # Check if reviews array is empty
  REVIEW_COUNT=$(echo "$REVIEWS_BODY" | grep -o '\[' | wc -l)
  
  if [ "$REVIEWS_BODY" = "[]" ]; then
    echo "⚠️  No reviews found for this show"
    echo ""
    echo "🔍 This could mean:"
    echo "   1. No reviews have been created yet"
    echo "   2. Reviews exist but with different animeId format"
    echo "   3. The show ID format doesn't match review animeId"
    echo ""
    echo "💡 To fix:"
    echo "   - Check review.model.ts: animeId should be String type"
    echo "   - When creating reviews, use: animeId: show._id.toString()"
    echo "   - Verify existing reviews in MongoDB with:"
    echo "     db.reviews.find({}).limit(5)"
  else
    echo "✅ Reviews found!"
    echo "$REVIEWS_BODY" | head -c 500
    echo ""
  fi
else
  echo "❌ Reviews API error"
  echo "Response: $REVIEWS_BODY"
fi

echo ""
echo "=================================="
echo ""
echo "📝 Quick Test Checklist:"
echo "   □ MongoDB is running"
echo "   □ Server is running (npm run dev)"
echo "   □ Shows exist in database"
echo "   □ Reviews exist with matching animeId"
echo ""
echo "🔧 To create a test review:"
echo "   - Go to the review page"
echo "   - Submit a review for a show"
echo "   - The animeId should be stored as show._id.toString()"
echo ""
echo "🗄️  To check reviews in MongoDB:"
echo "   mongosh"
echo "   use animeverse"
echo "   db.reviews.find().limit(5)"
echo "   db.reviews.findOne({}, {animeId: 1, animeTitle: 1})"
