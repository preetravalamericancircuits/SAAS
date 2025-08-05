#!/bin/bash

# SSL Certificate Renewal Script
set -e

LOG_FILE="/var/log/certbot-renewal.log"
NGINX_CONTAINER="saas-nginx-ssl"

echo "$(date): Starting SSL certificate renewal..." >> $LOG_FILE

# Renew certificates
if certbot renew --quiet --no-self-upgrade; then
    echo "$(date): Certificate renewal successful" >> $LOG_FILE
    
    # Reload nginx
    if docker ps | grep -q $NGINX_CONTAINER; then
        docker exec $NGINX_CONTAINER nginx -s reload
        echo "$(date): Nginx reloaded successfully" >> $LOG_FILE
    elif systemctl is-active --quiet nginx; then
        systemctl reload nginx
        echo "$(date): System nginx reloaded successfully" >> $LOG_FILE
    else
        echo "$(date): Warning: Could not reload nginx" >> $LOG_FILE
    fi
else
    echo "$(date): Certificate renewal failed" >> $LOG_FILE
    exit 1
fi

echo "$(date): SSL renewal process completed" >> $LOG_FILE