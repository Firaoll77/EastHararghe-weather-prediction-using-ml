"""
Custom middleware for request logging and processing.
"""

import logging
import time
import json
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger('api')


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware for logging all API requests and responses.
    Useful for debugging and monitoring.
    """
    
    def process_request(self, request):
        """Log incoming request details."""
        request.start_time = time.time()
        
        # Log request info
        logger.info(
            f"Request: {request.method} {request.path}",
            extra={
                'method': request.method,
                'path': request.path,
                'user': str(request.user) if request.user.is_authenticated else 'anonymous',
                'ip': self.get_client_ip(request),
            }
        )
    
    def process_response(self, request, response):
        """Log response details including processing time."""
        # Calculate request duration
        duration = time.time() - getattr(request, 'start_time', time.time())
        
        # Log response info
        logger.info(
            f"Response: {response.status_code} in {duration:.3f}s",
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration': round(duration, 3),
            }
        )
        
        # Add timing header for debugging
        response['X-Request-Duration'] = f"{duration:.3f}s"
        
        return response
    
    def get_client_ip(self, request):
        """Extract client IP from request headers."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', 'unknown')
