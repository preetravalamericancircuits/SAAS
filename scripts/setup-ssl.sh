#!/bin/bash

# SSL Setup Script with Let's Encrypt
set -e

DOMAIN=${1:-"yourdomain.com"}
EMAIL=${2:-"admin@yourdomain.com"}

echo "🔒 Setting up SSL for domain: $DOMAIN"
echo "📧 Using email: $EMAIL"

# Install Certbot
echo "📦 Installing Certbot..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    sudo yum install -y certbot python3-certbot-nginx
else
    echo "❌ Unsupported package manager. Please install certbot manually."
    exit 1
fi

# Stop nginx temporarily
echo "⏹️ Stopping nginx..."
sudo systemctl stop nginx || docker-compose down nginx

# Obtain SSL certificate
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly \
    --standalone \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --domains $DOMAIN,www.$DOMAIN,api.$DOMAIN

# Create SSL configuration
echo "⚙️ Creating SSL configuration..."
sudo mkdir -p /etc/nginx/ssl

# Generate DH parameters
echo "🔑 Generating DH parameters..."
sudo openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# Set up auto-renewal
echo "🔄 Setting up auto-renewal..."
sudo crontab -l 2>/dev/null | grep -v certbot > /tmp/crontab || true
echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'" >> /tmp/crontab
sudo crontab /tmp/crontab
rm /tmp/crontab

# Start nginx
echo "▶️ Starting nginx..."
sudo systemctl start nginx || docker-compose up -d nginx

echo "✅ SSL setup complete!"
echo "🔗 Your site should now be available at: https://$DOMAIN"