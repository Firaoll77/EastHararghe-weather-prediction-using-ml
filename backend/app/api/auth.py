from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict, Any, Optional
from app.services.database import DatabaseService
from app.services.auth_service import AuthService
from app.utils.logger import setup_logger

logger = setup_logger(__name__)
router = APIRouter()

# Pydantic models
class UserProfileCreate(BaseModel):
    full_name: str
    role: str  # 'resident', 'farmer', 'official'
    location: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    location: Optional[str] = None

class TokenVerify(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

# Helper function to extract user from token (simplified for this example)
async def get_user_from_token(token: str) -> Dict[str, Any]:
    """Extract user information from JWT token"""
    try:
        payload = AuthService.verify_token(token)
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        # Get user profile
        profile = await DatabaseService.get_user_profile(user_id)
        if not profile:
            raise HTTPException(status_code=401, detail="User profile not found")
        
        return {
            'user_id': user_id,
            'email': payload.get('email'),
            'profile': profile
        }
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")

@router.post("/verify-token")
async def verify_token(request: TokenVerify) -> Dict[str, Any]:
    """
    Verify JWT token and return user information
    
    - **token**: JWT access token
    """
    try:
        user_info = await get_user_from_token(request.token)
        
        return {
            "success": True,
            "data": {
                "user": user_info
            },
            "message": "Token verified successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in verify_token: {e}")
        raise HTTPException(status_code=500, detail="Token verification failed")

@router.post("/create-profile")
async def create_user_profile(
    profile_data: UserProfileCreate,
    # This would normally come from authenticated Supabase user
    user_id: str = "demo-user-id"  # Placeholder - in real implementation, get from Supabase auth
) -> Dict[str, Any]:
    """
    Create user profile after authentication
    
    - **full_name**: User's full name
    - **role**: User role ('resident', 'farmer', 'official')
    - **location**: User's location (woreda)
    """
    try:
        # Validate role
        valid_roles = ['resident', 'farmer', 'official']
        if profile_data.role not in valid_roles:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        
        # Validate location
        from app.services.weather_service import WeatherService
        if not WeatherService.validate_woreda(profile_data.location):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid location. Must be one of the supported East Hararghe woredas"
            )
        
        # Check if profile already exists
        existing_profile = await DatabaseService.get_user_profile(user_id)
        if existing_profile:
            raise HTTPException(
                status_code=400,
                detail="User profile already exists"
            )
        
        # Create profile
        profile = await DatabaseService.create_user_profile(user_id, profile_data.dict())
        
        return {
            "success": True,
            "data": profile,
            "message": "User profile created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in create_user_profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to create profile")

@router.get("/profile")
async def get_user_profile(
    # This would normally come from authenticated request
    user_id: str = "demo-user-id"  # Placeholder - in real implementation, get from token
) -> Dict[str, Any]:
    """
    Get current user profile
    
    - **Authentication**: Required
    """
    try:
        profile = await DatabaseService.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        return {
            "success": True,
            "data": profile,
            "message": "Profile retrieved successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_user_profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve profile")

@router.put("/profile")
async def update_user_profile(
    profile_data: UserProfileUpdate,
    # This would normally come from authenticated request
    user_id: str = "demo-user-id"  # Placeholder - in real implementation, get from token
) -> Dict[str, Any]:
    """
    Update user profile
    
    - **Authentication**: Required
    """
    try:
        # Check if profile exists
        existing_profile = await DatabaseService.get_user_profile(user_id)
        if not existing_profile:
            raise HTTPException(
                status_code=404,
                detail="User profile not found"
            )
        
        # Validate updates
        update_data = profile_data.dict(exclude_unset=True)
        
        if 'role' in update_data:
            valid_roles = ['resident', 'farmer', 'official']
            if update_data['role'] not in valid_roles:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid role. Must be one of: {', '.join(valid_roles)}"
                )
        
        if 'location' in update_data:
            from app.services.weather_service import WeatherService
            if not WeatherService.validate_woreda(update_data['location']):
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid location. Must be one of the supported East Hararghe woredas"
                )
        
        # Update profile
        updated_profile = await DatabaseService.update_user_profile(user_id, update_data)
        
        return {
            "success": True,
            "data": updated_profile,
            "message": "Profile updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in update_user_profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.post("/login")
async def login_demo() -> Dict[str, Any]:
    """
    Demo login endpoint - in production, this would integrate with Supabase Auth
    
    This is a placeholder for demonstration purposes.
    In production, use Supabase Auth for actual authentication.
    """
    try:
        # Create demo token
        demo_user = {
            "user_id": "demo-user-id",
            "email": "demo@easthararghe.com",
            "role": "resident"
        }
        
        token = AuthService.create_access_token(demo_user)
        
        return {
            "success": True,
            "data": {
                "access_token": token,
                "token_type": "bearer",
                "user": demo_user
            },
            "message": "Demo login successful"
        }
    except Exception as e:
        logger.error(f"Error in login_demo: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.post("/signup")
async def signup_demo() -> Dict[str, Any]:
    """
    Demo signup endpoint - in production, this would integrate with Supabase Auth
    
    This is a placeholder for demonstration purposes.
    In production, use Supabase Auth for actual user registration.
    """
    try:
        return {
            "success": True,
            "message": "Demo signup endpoint - Use Supabase Auth for production",
            "data": {
                "note": "This is a placeholder. Implement Supabase Auth signup flow in frontend.",
                "next_steps": [
                    "1. Sign up user through Supabase Auth",
                    "2. Create user profile with /api/auth/create-profile",
                    "3. Use returned JWT token for authenticated requests"
                ]
            }
        }
    except Exception as e:
        logger.error(f"Error in signup_demo: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")
