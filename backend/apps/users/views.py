"""
Views for user authentication and profile management.
Views are thin - business logic is in services.
"""

from rest_framework import status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    UserActivitySerializer,
)
from .services import AuthService, UserService, ActivityService
from .models import UserActivity


class RegisterView(APIView):
    """
    User registration endpoint.
    POST /api/auth/register
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = AuthService.register_user(serializer.validated_data)
        
        if result.success:
            return Response(
                {'success': True, 'data': result.data},
                status=status.HTTP_201_CREATED
            )
        
        return Response(
            {'success': False, 'error': result.error, 'code': result.error_code},
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(TokenObtainPairView):
    """
    User login endpoint with JWT tokens.
    POST /api/auth/login
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log login activity
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid()
            user = serializer.user
            
            ActivityService.log_activity(
                user=user,
                action='login',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
            )
            
            return Response({
                'success': True,
                'data': response.data
            })
        
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class LogoutView(APIView):
    """
    User logout endpoint - blacklists refresh token.
    POST /api/auth/logout
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response(
                {'success': False, 'error': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = AuthService.logout_user(refresh_token)
        
        if result.success:
            # Log logout activity
            ActivityService.log_activity(
                user=request.user,
                action='logout',
                ip_address=self.get_client_ip(request),
            )
            
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class TokenRefreshAPIView(TokenRefreshView):
    """
    Token refresh endpoint.
    POST /api/auth/refresh
    """
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            return Response({
                'success': True,
                'data': response.data
            })
        
        return response


class UserProfileView(APIView):
    """
    User profile endpoint.
    GET /api/user/profile - Get current user profile
    PATCH /api/user/profile - Update profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        result = UserService.get_user_profile(request.user)
        return Response({'success': True, 'data': result.data})
    
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = UserService.update_profile(request.user, serializer.validated_data)
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error},
            status=status.HTTP_400_BAD_REQUEST
        )


class ChangePasswordView(APIView):
    """
    Change password endpoint.
    POST /api/user/change-password
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {'success': False, 'errors': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = AuthService.change_password(
            user=request.user,
            old_password=serializer.validated_data['old_password'],
            new_password=serializer.validated_data['new_password'],
        )
        
        if result.success:
            return Response({'success': True, 'data': result.data})
        
        return Response(
            {'success': False, 'error': result.error},
            status=status.HTTP_400_BAD_REQUEST
        )


class UserPredictionsView(generics.ListAPIView):
    """
    Get user's prediction history.
    GET /api/user/predictions
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Import here to avoid circular imports
        from apps.predictions.models import PredictionHistory
        from apps.predictions.serializers import PredictionHistorySerializer
        
        predictions = PredictionHistory.objects.filter(user=request.user)[:50]
        serializer = PredictionHistorySerializer(predictions, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data
        })


class UserActivityView(generics.ListAPIView):
    """
    Get user's activity history.
    GET /api/user/activities
    """
    permission_classes = [IsAuthenticated]
    serializer_class = UserActivitySerializer
    
    def get_queryset(self):
        return UserActivity.objects.filter(user=self.request.user)[:100]
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
