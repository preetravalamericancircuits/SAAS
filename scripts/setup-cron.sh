#!/bin/bash

# Setup cron job for SSL certificate renewal

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RENEWAL_SCRIPT="$SCRIPT_DIR/renew-ssl.sh"

echo "🔄 Setting up SSL certificate auto-renewal..."

# Make renewal script executable
chmod +x "$RENEWAL_SCRIPT"

# Create log directory
sudo mkdir -p /var/log
sudo touch /var/log/certbot-renewal.log
sudo chmod 644 /var/log/certbot-renewal.log

# Add cron job
(crontab -l 2>/dev/null | grep -v "renew-ssl.sh"; echo "0 2 * * * $RENEWAL_SCRIPT") | crontab -

# Also add a weekly check
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * 0 /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -

echo "✅ Cron jobs added:"
echo "  - Daily renewal check at 2:00 AM"
echo "  - Weekly renewal at 3:00 AM on Sundays"

# Display current crontab
echo ""
echo "📋 Current crontab:"
crontab -l | grep -E "(renew-ssl|certbot)"

echo ""
echo "📝 Log file: /var/log/certbot-renewal.log"