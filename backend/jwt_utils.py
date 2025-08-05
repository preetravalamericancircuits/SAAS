from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import JWTError, jwt
from config import settings
import logging

logger = logging.getLogger(__name__)

class JWTManager:
    """Enhanced JWT token management with comprehensive validation"""
    
    def __init__(self):
        self.secret_key = settings.secret_key
        self.algorithm = settings.algorithm
        self.access_token_expire_minutes = settings.access_token_expire_minutes
        self.refresh_token_expire_days = settings.refresh_token_expire_days
    
    def create_token(self, data: Dict[str, Any], token_type: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT token with comprehensive claims"""
        to_encode = data.copy()
        now = datetime.utcnow()
        
        # Set expiration based on token type
        if expires_delta:
            expire = now + expires_delta
        elif token_type == "access":
            expire = now + timedelta(minutes=self.access_token_expire_minutes)
        elif token_type == "refresh":
            expire = now + timedelta(days=self.refresh_token_expire_days)
        else:
            expire = now + timedelta(minutes=15)  # Default 15 minutes
        
        # Add standard JWT claims
        to_encode.update({
            "exp": expire,           # Expiration time
            "iat": now,             # Issued at
            "nbf": now,             # Not before
            "iss": "saas-api",      # Issuer
            "aud": "saas-client",   # Audience
            "type": token_type,     # Token type
            "jti": f"{token_type}_{now.timestamp()}_{data.get('sub', 'unknown')}"  # JWT ID
        })
        
        try:
            encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
            logger.info(f"Created {token_type} token", extra={
                "username": data.get("sub"),
                "expires": expire.isoformat(),
                "jti": to_encode["jti"]
            })
            return encoded_jwt
        except Exception as e:
            logger.error(f"Failed to create {token_type} token: {e}")
            raise
    
    def validate_token(self, token: str, expected_type: str = "access") -> Dict[str, Any]:
        """Validate JWT token with comprehensive checks"""
        try:
            # Decode with all validations enabled
            payload = jwt.decode(
                token,
                self.secret_key,
                algorithms=[self.algorithm],
                options={
                    "verify_exp": True,
                    "verify_nbf": True,
                    "verify_iat": True,
                    "verify_aud": True,
                    "verify_iss": True,
                    "verify_signature": True
                },
                audience="saas-client",
                issuer="saas-api"
            )
            
            # Validate required claims
            required_claims = ["sub", "exp", "iat", "nbf", "type", "jti", "iss", "aud"]
            missing_claims = [claim for claim in required_claims if claim not in payload]
            
            if missing_claims:
                raise JWTError(f"Missing required claims: {missing_claims}")
            
            # Validate token type
            if payload.get("type") != expected_type:
                raise JWTError(f"Invalid token type. Expected: {expected_type}, Got: {payload.get('type')}")
            
            # Additional time validations
            current_time = datetime.utcnow().timestamp()
            
            # Check expiration with buffer
            if current_time >= payload["exp"]:
                raise JWTError("Token has expired")
            
            # Check not-before
            if current_time < payload["nbf"]:
                raise JWTError("Token not yet valid")
            
            # Check issued-at (prevent future tokens)
            if payload["iat"] > current_time + 60:  # 1 minute buffer for clock skew
                raise JWTError("Token issued in the future")
            
            logger.debug(f"Token validation successful", extra={
                "username": payload.get("sub"),
                "token_type": payload.get("type"),
                "jti": payload.get("jti")
            })
            
            return payload
            
        except JWTError as e:
            logger.warning(f"Token validation failed: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error during token validation: {e}")
            raise JWTError(f"Token validation error: {e}")
    
    def get_token_info(self, token: str) -> Dict[str, Any]:
        """Get token information without validation (for debugging)"""
        try:
            # Decode without verification for inspection
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False}
            )
            
            # Convert timestamps to readable format
            if "exp" in payload:
                payload["exp_readable"] = datetime.fromtimestamp(payload["exp"]).isoformat()
            if "iat" in payload:
                payload["iat_readable"] = datetime.fromtimestamp(payload["iat"]).isoformat()
            if "nbf" in payload:
                payload["nbf_readable"] = datetime.fromtimestamp(payload["nbf"]).isoformat()
            
            return payload
        except Exception as e:
            return {"error": str(e)}
    
    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired without full validation"""
        try:
            payload = jwt.decode(
                token,
                options={"verify_signature": False, "verify_exp": False}
            )
            exp = payload.get("exp")
            if exp:
                return datetime.utcnow().timestamp() >= exp
            return True
        except:
            return True

# Global JWT manager instance
jwt_manager = JWTManager()