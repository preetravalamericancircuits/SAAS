#!/bin/bash

# Complete SSL Deployment Script

set -e

DOMAIN=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@yourdomain.com"}

echo "🚀 Starting SSL deployment for: $DOMAIN"
echo "📧 Contact email: $EMAIL"

# Step 1: Setup SSL certificates
echo ""
echo "Step 1: Setting up SSL certificates..."
./scripts/setup-ssl.sh $DOMAIN $EMAIL

# Step 2: Copy security header configs
echo ""
echo "Step 2: Setting up security configurations..."
sudo cp config/nginx/security-headers.conf /etc/nginx/conf.d/
sudo cp config/nginx/auth-security.conf /etc/nginx/conf.d/
sudo cp config/nginx/secure-files.conf /etc/nginx/conf.d/

# Step 3: Deploy with SSL
echo ""
echo "Step 3: Deploying application with SSL..."
docker-compose -f docker-compose.ssl.yml down
docker-compose -f docker-compose.ssl.yml up -d

# Step 4: Setup auto-renewal
echo ""
echo "Step 4: Setting up auto-renewal..."
./scripts/setup-cron.sh

# Step 5: Health check
echo ""
echo "Step 5: Running health check..."
sleep 30
./scripts/ssl-health-check.sh $DOMAIN

echo ""
echo "✅ SSL deployment complete!"
echo "🔗 Your site is now available at:"
echo "   https://$DOMAIN"
echo "   https://www.$DOMAIN"
echo "   https://api.$DOMAIN"
echo ""
echo "📋 Next steps:"
echo "   - Update DNS records to point to this server"
echo "   - Test all functionality over HTTPS"
echo "   - Monitor certificate renewal logs"