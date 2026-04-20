"""
URL routes for authentication endpoints.
"""

from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    TokenRefreshAPIView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('refresh/', TokenRefreshAPIView.as_view(), name='auth-refresh'),
]
