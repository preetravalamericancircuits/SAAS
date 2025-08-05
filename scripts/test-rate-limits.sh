#!/bin/bash

# Rate Limiting Test Script

BASE_URL="http://localhost:8080"
ENDPOINT="/api/v1/auth/login"

echo "🔒 Testing Rate Limits for Authentication Endpoints"
echo "=================================================="

# Test login rate limiting
echo ""
echo "Testing Login Rate Limiting (3 requests/minute):"
echo "-----------------------------------------------"

for i in {1..5}; do
    echo "Request $i:"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}\nTIME:%{time_total}\n" \
        -X POST "$BASE_URL$ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "X-Requested-With: XMLHttpRequest" \
        -d '{"username":"test","password":"test"}' 2>/dev/null)
    
    status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    time=$(echo "$response" | grep "TIME" | cut -d: -f2)
    
    if [ "$status" = "429" ]; then
        echo "  ❌ Rate limited (HTTP $status) - Time: ${time}s"
        retry_after=$(echo "$response" | grep -i "retry-after" | cut -d: -f2 | tr -d ' ')
        if [ ! -z "$retry_after" ]; then
            echo "  ⏰ Retry after: ${retry_after} seconds"
        fi
    elif [ "$status" = "401" ]; then
        echo "  ✅ Request processed (HTTP $status) - Time: ${time}s"
    else
        echo "  ⚠️  Unexpected status (HTTP $status) - Time: ${time}s"
    fi
    
    sleep 1
done

# Test register rate limiting
echo ""
echo "Testing Register Rate Limiting (5 requests/minute):"
echo "-------------------------------------------------"

REGISTER_ENDPOINT="/api/v1/auth/register"

for i in {1..7}; do
    echo "Request $i:"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}\n" \
        -X POST "$BASE_URL$REGISTER_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "X-Requested-With: XMLHttpRequest" \
        -d "{\"username\":\"test$i\",\"email\":\"test$i@example.com\",\"password\":\"test123\",\"confirm_password\":\"test123\"}" 2>/dev/null)
    
    status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$status" = "429" ]; then
        echo "  ❌ Rate limited (HTTP $status)"
    else
        echo "  ✅ Request processed (HTTP $status)"
    fi
    
    sleep 1
done

# Test refresh rate limiting
echo ""
echo "Testing Refresh Rate Limiting (10 requests/minute):"
echo "-------------------------------------------------"

REFRESH_ENDPOINT="/api/v1/auth/refresh"

for i in {1..12}; do
    echo "Request $i:"
    response=$(curl -s -w "HTTP_STATUS:%{http_code}\n" \
        -X POST "$BASE_URL$REFRESH_ENDPOINT" \
        -H "Content-Type: application/json" \
        -H "X-Requested-With: XMLHttpRequest" 2>/dev/null)
    
    status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$status" = "429" ]; then
        echo "  ❌ Rate limited (HTTP $status)"
        break
    else
        echo "  ✅ Request processed (HTTP $status)"
    fi
    
    sleep 1
done

echo ""
echo "🔒 Rate Limiting Test Complete"
echo "=============================="