"""
Service layer for user authentication and management.
Business logic is kept here, separate from views.
"""

import logging
from typing import Optional, Dict, Any
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from core.services import ServiceResult
from .models import User, UserActivity

logger = logging.getLogger('api')


class AuthService:
    """
    Service class for authentication operations.
    Handles registration, login, logout, and token management.
    """
    
    @staticmethod
    def register_user(data: Dict[str, Any]) -> ServiceResult:
        """
        Register a new user account.
        
        Args:
            data: User registration data
            
        Returns:
            ServiceResult with user data or error
        """
        try:
            # Check if email already exists
            if User.objects.filter(email=data['email']).exists():
                return ServiceResult.fail(
                    'A user with this email already exists.',
                    'email_exists'
                )
            
            # Create user
            user = User.objects.create_user(
                email=data['email'],
                password=data['password'],
                first_name=data.get('first_name', ''),
                last_name=data.get('last_name', ''),
                phone_number=data.get('phone_number', ''),
                organization=data.get('organization', ''),
                role=data.get('role', 'other'),
            )
            
            # Generate tokens for immediate login
            refresh = RefreshToken.for_user(user)
            
            logger.info(f"New user registered: {user.email}")
            
            return ServiceResult.ok({
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.get_full_name(),
                    'role': user.role,
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            })
            
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return ServiceResult.fail(
                'Registration failed. Please try again.',
                'registration_error'
            )
    
    @staticmethod
    def logout_user(refresh_token: str) -> ServiceResult:
        """
        Logout user by blacklisting their refresh token.
        
        Args:
            refresh_token: The refresh token to blacklist
            
        Returns:
            ServiceResult indicating success or failure
        """
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            logger.info("User logged out successfully")
            return ServiceResult.ok({'message': 'Successfully logged out.'})
            
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return ServiceResult.fail(
                'Logout failed.',
                'logout_error'
            )
    
    @staticmethod
    def change_password(user: User, old_password: str, new_password: str) -> ServiceResult:
        """
        Change user password.
        
        Args:
            user: The user instance
            old_password: Current password
            new_password: New password
            
        Returns:
            ServiceResult indicating success or failure
        """
        try:
            if not user.check_password(old_password):
                return ServiceResult.fail(
                    'Current password is incorrect.',
                    'invalid_password'
                )
            
            user.set_password(new_password)
            user.save()
            
            logger.info(f"Password changed for user: {user.email}")
            return ServiceResult.ok({'message': 'Password changed successfully.'})
            
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return ServiceResult.fail(
                'Failed to change password.',
                'password_change_error'
            )


class UserService:
    """
    Service class for user profile management.
    """
    
    @staticmethod
    def get_user_profile(user: User) -> ServiceResult:
        """Get complete user profile data."""
        return ServiceResult.ok({
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'full_name': user.get_full_name(),
            'phone_number': user.phone_number,
            'organization': user.organization,
            'role': user.role,
            'default_location': user.default_location_id,
            'is_verified': user.is_verified,
            'email_notifications': user.email_notifications,
            'alert_notifications': user.alert_notifications,
            'date_joined': user.date_joined.isoformat(),
            'last_login': user.last_login.isoformat() if user.last_login else None,
        })
    
    @staticmethod
    def update_profile(user: User, data: Dict[str, Any]) -> ServiceResult:
        """
        Update user profile information.
        
        Args:
            user: The user instance
            data: Profile data to update
            
        Returns:
            ServiceResult with updated profile
        """
        try:
            # Update allowed fields
            allowed_fields = [
                'first_name', 'last_name', 'phone_number',
                'organization', 'role', 'default_location',
                'email_notifications', 'alert_notifications'
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(user, field, data[field])
            
            user.save()
            
            logger.info(f"Profile updated for user: {user.email}")
            return UserService.get_user_profile(user)
            
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return ServiceResult.fail(
                'Failed to update profile.',
                'profile_update_error'
            )


class ActivityService:
    """
    Service class for tracking user activity.
    """
    
    @staticmethod
    def log_activity(
        user: User,
        action: str,
        ip_address: Optional[str] = None,
        user_agent: str = '',
        metadata: Optional[Dict] = None
    ) -> UserActivity:
        """
        Log a user activity event.
        
        Args:
            user: The user instance
            action: Type of action performed
            ip_address: Client IP address
            user_agent: Client user agent string
            metadata: Additional activity data
            
        Returns:
            Created UserActivity instance
        """
        return UserActivity.objects.create(
            user=user,
            action=action,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {}
        )
    
    @staticmethod
    def get_user_activities(user: User, limit: int = 50) -> list:
        """Get recent activities for a user."""
        activities = UserActivity.objects.filter(user=user)[:limit]
        return [
            {
                'id': a.id,
                'action': a.action,
                'metadata': a.metadata,
                'created_at': a.created_at.isoformat(),
            }
            for a in activities
        ]
