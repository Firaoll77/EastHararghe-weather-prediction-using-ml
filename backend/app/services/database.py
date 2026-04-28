from supabase import create_client, Client
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import asyncio
from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class DatabaseService:
    """Database service for Supabase operations"""
    
    _client: Optional[Client] = None
    
    @classmethod
    async def initialize(cls):
        """Initialize Supabase client"""
        try:
            cls._client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY
            )
            logger.info("Database client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    
    @classmethod
    async def close(cls):
        """Close database connection"""
        if cls._client:
            cls._client = None
            logger.info("Database connection closed")
    
    @classmethod
    def get_client(cls) -> Client:
        """Get database client"""
        if not cls._client:
            raise RuntimeError("Database not initialized")
        return cls._client
    
    @classmethod
    async def health_check(cls) -> Dict[str, Any]:
        """Check database health"""
        try:
            client = cls.get_client()
            # Simple health check - try to fetch from a table
            result = client.table('profiles').select('id').limit(1).execute()
            return {"status": "healthy", "connection": "ok"}
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    # Profile operations
    @classmethod
    async def get_user_profile(cls, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user profile by ID"""
        try:
            client = cls.get_client()
            result = client.table('profiles').select('*').eq('id', user_id).single().execute()
            return result.data
        except Exception as e:
            logger.error(f"Error fetching user profile: {e}")
            raise
    
    @classmethod
    async def create_user_profile(cls, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create user profile"""
        try:
            client = cls.get_client()
            profile_data['id'] = user_id
            profile_data['created_at'] = datetime.now().isoformat()
            profile_data['updated_at'] = datetime.now().isoformat()
            
            result = client.table('profiles').insert(profile_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error creating user profile: {e}")
            raise
    
    @classmethod
    async def update_user_profile(cls, user_id: str, profile_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update user profile"""
        try:
            client = cls.get_client()
            profile_data['updated_at'] = datetime.now().isoformat()
            
            result = client.table('profiles').update(profile_data).eq('id', user_id).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error updating user profile: {e}")
            raise
    
    # Weather history operations
    @classmethod
    async def get_recent_weather(cls, location: str, hours: int = 1) -> Optional[Dict[str, Any]]:
        """Get recent weather data for location"""
        try:
            client = cls.get_client()
            time_ago = (datetime.now() - timedelta(hours=hours)).isoformat()
            
            result = client.table('weather_history')\
                .select('*')\
                .eq('location', location)\
                .gte('timestamp', time_ago)\
                .order('timestamp', desc=True)\
                .limit(1)\
                .execute()
            
            return result.data[0] if result.data else None
        except Exception as e:
            logger.error(f"Error fetching recent weather: {e}")
            raise
    
    @classmethod
    async def save_weather_data(cls, weather_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save weather data to database"""
        try:
            client = cls.get_client()
            weather_data['timestamp'] = datetime.now().isoformat()
            
            result = client.table('weather_history').insert(weather_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error saving weather data: {e}")
            raise
    
    # Prediction operations
    @classmethod
    async def save_prediction(cls, prediction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save prediction to database"""
        try:
            client = cls.get_client()
            prediction_data['created_at'] = datetime.now().isoformat()
            
            result = client.table('predictions').insert(prediction_data).execute()
            return result.data[0]
        except Exception as e:
            logger.error(f"Error saving prediction: {e}")
            raise
    
    @classmethod
    async def get_user_predictions(cls, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Get user's prediction history"""
        try:
            client = cls.get_client()
            result = client.table('predictions')\
                .select('*')\
                .eq('user_id', user_id)\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
        except Exception as e:
            logger.error(f"Error fetching user predictions: {e}")
            raise
    
    @classmethod
    async def get_all_predictions(cls, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all predictions (for admin)"""
        try:
            client = cls.get_client()
            result = client.table('predictions')\
                .select('*, profiles(full_name, role, location)')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .execute()
            
            return result.data
        except Exception as e:
            logger.error(f"Error fetching all predictions: {e}")
            raise
    
    @classmethod
    async def get_analytics_data(cls) -> Dict[str, Any]:
        """Get analytics data for admin dashboard"""
        try:
            client = cls.get_client()
            
            # Get location counts
            location_result = client.table('predictions').select('location').execute()
            location_counts = {}
            for pred in location_result.data:
                location_counts[pred['location']] = location_counts.get(pred['location'], 0) + 1
            
            # Get average confidence
            confidence_result = client.table('predictions').select('confidence_score').execute()
            avg_confidence = 0
            if confidence_result.data:
                avg_confidence = sum(p['confidence_score'] for p in confidence_result.data) / len(confidence_result.data)
            
            # Get user role counts
            role_result = client.table('profiles').select('role').execute()
            role_counts = {}
            for profile in role_result.data:
                role_counts[profile['role']] = role_counts.get(profile['role'], 0) + 1
            
            # Get recent predictions (24 hours)
            one_day_ago = (datetime.now() - timedelta(hours=24)).isoformat()
            recent_result = client.table('predictions')\
                .select('id', count='exact')\
                .gte('created_at', one_day_ago)\
                .execute()
            
            return {
                'location_counts': location_counts,
                'average_confidence': avg_confidence,
                'total_predictions': len(confidence_result.data),
                'user_roles': role_counts,
                'recent_predictions_24h': len(recent_result.data) if recent_result.data else 0,
                'last_updated': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error fetching analytics data: {e}")
            raise
