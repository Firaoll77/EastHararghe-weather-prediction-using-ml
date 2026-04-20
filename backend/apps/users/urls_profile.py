"""
URL routes for user profile endpoints.
"""

from django.urls import path
from .views import (
    UserProfileView,
    ChangePasswordView,
    UserPredictionsView,
    UserActivityView,
)

urlpatterns = [
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('predictions/', UserPredictionsView.as_view(), name='user-predictions'),
    path('activities/', UserActivityView.as_view(), name='user-activities'),
]
