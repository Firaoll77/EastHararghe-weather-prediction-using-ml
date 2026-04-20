"""
URL routes for location endpoints.
"""

from django.urls import path
from .views import LocationListView, LocationDetailView, LocationSearchView

urlpatterns = [
    path('', LocationListView.as_view(), name='location-list'),
    path('search/', LocationSearchView.as_view(), name='location-search'),
    path('<int:pk>/', LocationDetailView.as_view(), name='location-detail'),
]
