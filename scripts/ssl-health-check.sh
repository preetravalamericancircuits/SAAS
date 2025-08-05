#!/bin/bash

# SSL Health Check Script

DOMAIN=${1:-"yourdomain.com"}
DAYS_WARNING=30

echo "🔒 SSL Health Check for: $DOMAIN"
echo "================================"

# Check certificate expiration
echo "📅 Certificate Expiration:"
expiry_date=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
expiry_epoch=$(date -d "$expiry_date" +%s)
current_epoch=$(date +%s)
days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))

echo "  Expires: $expiry_date"
echo "  Days until expiry: $days_until_expiry"

if [ $days_until_expiry -lt $DAYS_WARNING ]; then
    echo "  ⚠️  WARNING: Certificate expires in less than $DAYS_WARNING days!"
else
    echo "  ✅ Certificate is valid"
fi

# Check SSL configuration
echo ""
echo "🔧 SSL Configuration:"
ssl_info=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null)

# Check protocol version
protocol=$(echo "$ssl_info" | grep "Protocol" | awk '{print $3}')
echo "  Protocol: $protocol"

# Check cipher
cipher=$(echo "$ssl_info" | grep "Cipher" | awk '{print $3}')
echo "  Cipher: $cipher"

# Check certificate chain
echo ""
echo "🔗 Certificate Chain:"
echo "$ssl_info" | openssl x509 -noout -subject -issuer

# Test HTTPS connectivity
echo ""
echo "🌐 Connectivity Test:"
if curl -s -I "https://$DOMAIN" > /dev/null; then
    echo "  ✅ HTTPS connection successful"
else
    echo "  ❌ HTTPS connection failed"
fi

# Check HSTS header
echo ""
echo "🛡️  Security Headers:"
headers=$(curl -s -I "https://$DOMAIN")
if echo "$headers" | grep -qi "strict-transport-security"; then
    hsts=$(echo "$headers" | grep -i "strict-transport-security" | cut -d' ' -f2-)
    echo "  ✅ HSTS: $hsts"
else
    echo "  ❌ HSTS: Not found"
fi

echo ""
echo "🔒 SSL Health Check Complete"