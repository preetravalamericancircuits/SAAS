#!/bin/bash

# Security Headers Testing Script

echo "🔒 Testing Security Headers..."
echo "================================"

BASE_URL="http://localhost:8080"

# Test endpoints
ENDPOINTS=(
    "/"
    "/api/"
    "/api/v1/auth/login"
    "/api/v1/users/"
    "/api/v1/secure-files"
    "/health"
)

# Expected security headers
SECURITY_HEADERS=(
    "X-Frame-Options"
    "X-Content-Type-Options"
    "X-XSS-Protection"
    "Referrer-Policy"
    "Content-Security-Policy"
    "Permissions-Policy"
    "Cross-Origin-Resource-Policy"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo ""
    echo "Testing: $BASE_URL$endpoint"
    echo "----------------------------------------"
    
    # Get headers
    response=$(curl -s -I "$BASE_URL$endpoint" 2>/dev/null)
    
    if [ $? -eq 0 ]; then
        echo "✅ Endpoint accessible"
        
        # Check each security header
        for header in "${SECURITY_HEADERS[@]}"; do
            if echo "$response" | grep -qi "$header:"; then
                value=$(echo "$response" | grep -i "$header:" | cut -d' ' -f2- | tr -d '\r\n')
                echo "✅ $header: $value"
            else
                echo "❌ $header: MISSING"
            fi
        done
        
        # Check for server header (should be removed)
        if echo "$response" | grep -qi "server:"; then
            server=$(echo "$response" | grep -i "server:" | cut -d' ' -f2- | tr -d '\r\n')
            echo "⚠️  Server header exposed: $server"
        else
            echo "✅ Server header: HIDDEN"
        fi
        
    else
        echo "❌ Endpoint not accessible"
    fi
done

echo ""
echo "🔒 Security Headers Test Complete"
echo "================================"