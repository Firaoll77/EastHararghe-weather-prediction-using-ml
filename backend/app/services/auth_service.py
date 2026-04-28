from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class AuthService:
    """Authentication service for JWT tokens and user management"""
    
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    @staticmethod
    def create_access_token(data: Dict[str, Any]) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
        to_encode.update({"exp": expire})
        
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET, 
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError as e:
            logger.error(f"Token verification failed: {e}")
            raise
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        return AuthService.pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return AuthService.pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_user_role_from_token(token: str) -> Optional[str]:
        """Extract user role from JWT token"""
        try:
            payload = AuthService.verify_token(token)
            return payload.get('role')
        except Exception as e:
            logger.error(f"Error extracting role from token: {e}")
            return None
    
    @staticmethod
    def get_user_id_from_token(token: str) -> Optional[str]:
        """Extract user ID from JWT token"""
        try:
            payload = AuthService.verify_token(token)
            return payload.get('user_id')
        except Exception as e:
            logger.error(f"Error extracting user ID from token: {e}")
            return None
