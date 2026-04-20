"""
URL routes for prediction endpoints.
"""

from django.urls import path
from .views import (
    PredictView,
    CustomPredictView,
    ModelStatusView,
    PredictionHistoryView,
)

urlpatterns = [
    path('', PredictView.as_view(), name='predict'),
    path('custom/', CustomPredictView.as_view(), name='predict-custom'),
    path('status/', ModelStatusView.as_view(), name='predict-status'),
    path('history/', PredictionHistoryView.as_view(), name='predict-history'),
]
