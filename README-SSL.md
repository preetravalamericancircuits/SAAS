# SSL Setup with Let's Encrypt

## Quick SSL Deployment

### 1. Complete SSL Setup
```bash
# Replace with your actual domain and email
./scripts/deploy-ssl.sh yourdomain.com admin@yourdomain.com
```

### 2. Manual Setup Steps

#### Step 1: Install Certbot
```bash
# Ubuntu/Debian
sudo apt-get install certbot python3-certbot-nginx

# CentOS/RHEL
sudo yum install certbot python3-certbot-nginx
```

#### Step 2: Obtain SSL Certificate
```bash
sudo certbot certonly --standalone \
  --email admin@yourdomain.com \
  --agree-tos \
  --domains yourdomain.com,www.yourdomain.com,api.yourdomain.com
```

#### Step 3: Deploy with SSL
```bash
# Copy environment file
cp .env.ssl .env

# Deploy SSL-enabled stack
docker-compose -f docker-compose.ssl.yml up -d
```

#### Step 4: Setup Auto-Renewal
```bash
./scripts/setup-cron.sh
```

## SSL Configuration

### Certificate Locations
- **Certificate**: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- **Private Key**: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
- **DH Parameters**: `/etc/nginx/ssl/dhparam.pem`

### Nginx SSL Settings
- **Protocols**: TLSv1.2, TLSv1.3
- **Ciphers**: Modern secure cipher suite
- **HSTS**: 1 year with preload
- **HTTP/2**: Enabled

### Auto-Renewal
- **Daily check**: 2:00 AM
- **Weekly renewal**: 3:00 AM Sundays
- **Log file**: `/var/log/certbot-renewal.log`

## SSL Health Monitoring

### Check Certificate Status
```bash
./scripts/ssl-health-check.sh yourdomain.com
```

### Manual Certificate Check
```bash
# Check expiration
openssl x509 -in /etc/letsencrypt/live/yourdomain.com/cert.pem -noout -dates

# Test SSL connection
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Renewal Testing
```bash
# Dry run renewal
sudo certbot renew --dry-run

# Force renewal (testing)
sudo certbot renew --force-renewal
```

## Troubleshooting

### Common Issues

#### Certificate Not Found
```bash
# Check certificate files exist
ls -la /etc/letsencrypt/live/yourdomain.com/

# Verify nginx can read certificates
sudo nginx -t
```

#### Renewal Failures
```bash
# Check renewal logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Manual renewal
sudo certbot renew --verbose
```

#### Port 80/443 Issues
```bash
# Check if ports are in use
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# Stop conflicting services
sudo systemctl stop apache2  # if running
```

## Security Features

### SSL/TLS Configuration
- **Perfect Forward Secrecy**: ECDHE key exchange
- **Strong Ciphers**: AES-GCM preferred
- **Session Security**: 10-minute timeout
- **OCSP Stapling**: Enabled

### Security Headers
- **HSTS**: 1 year with preload
- **CSP**: Strict content security policy
- **HPKP**: Certificate pinning (optional)
- **Expect-CT**: Certificate transparency

### Monitoring
- **Certificate expiry**: 30-day warning
- **SSL Labs grade**: A+ target
- **Security headers**: Full compliance
- **Auto-renewal**: Automated with logging

## Production Checklist

- [ ] Domain DNS points to server
- [ ] Firewall allows ports 80/443
- [ ] SSL certificates obtained
- [ ] Nginx configuration tested
- [ ] Auto-renewal configured
- [ ] Health checks passing
- [ ] Security headers verified
- [ ] SSL Labs test: A+ grade