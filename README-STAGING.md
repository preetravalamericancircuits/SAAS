# Staging Environment Setup

## Quick Start

### 1. Deploy Staging Environment
```bash
# Linux/Mac
./scripts/staging-deploy.sh

# Windows
scripts\staging-deploy.bat
```

### 2. Access Staging Services
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8001  
- **Nginx Proxy**: http://localhost:8080
- **Database**: localhost:5433
- **Redis**: localhost:6380

### 3. API Endpoints
- **Health**: http://localhost:8080/health
- **API Info**: http://localhost:8080/api/
- **Auth**: http://localhost:8080/api/v1/auth/
- **Users**: http://localhost:8080/api/v1/users/

## Environment Configuration

### Staging vs Production Differences
| Component | Staging | Production |
|-----------|---------|------------|
| Database | `aci_staging_db` | `aci_db` |
| Ports | 8080, 3001, 8001, 5433 | 80, 3000, 8000, 5432 |
| Secrets | `secrets/staging/` | `secrets/production/` |
| Rate Limits | More permissive | Strict |
| Debug Headers | Enabled | Disabled |

### Default Users (Staging)
- **preet** / password123 (SuperUser)
- **admin** / admin123 (Admin)
- **operator1** / password123 (Operator)
- **user1** / password123 (User)
- **itra1** / password123 (ITRA)

## Management Commands

### View Logs
```bash
docker-compose -f docker-compose.staging.yml logs -f
```

### Restart Services
```bash
docker-compose -f docker-compose.staging.yml restart
```

### Stop Staging
```bash
docker-compose -f docker-compose.staging.yml down
```

### Database Access
```bash
docker-compose -f docker-compose.staging.yml exec postgres-staging psql -U aci_staging_user -d aci_staging_db
```

## Testing

### API Testing
```bash
# Health check
curl http://localhost:8080/health

# Login test
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"preet","password":"password123"}' \
  -c staging-cookies.txt

# Get user info
curl http://localhost:8080/api/v1/me/ -b staging-cookies.txt
```

## Security Notes

- Staging uses separate secrets from production
- Database credentials are isolated
- Rate limiting is more permissive for testing
- Debug headers are enabled for troubleshooting