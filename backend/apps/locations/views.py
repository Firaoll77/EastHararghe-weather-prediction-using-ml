"""
Views for location endpoints.
"""

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Location
from .serializers import LocationSerializer, LocationListSerializer


class LocationListView(generics.ListAPIView):
    """
    List all active locations.
    GET /api/locations/
    """
    permission_classes = [AllowAny]
    serializer_class = LocationListSerializer
    queryset = Location.objects.filter(is_active=True)


class LocationDetailView(generics.RetrieveAPIView):
    """
    Get location details.
    GET /api/locations/<id>/
    """
    permission_classes = [AllowAny]
    serializer_class = LocationSerializer
    queryset = Location.objects.filter(is_active=True)


class LocationSearchView(APIView):
    """
    Search locations by name.
    GET /api/locations/search/?q=<query>
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        query = request.query_params.get('q', '')
        
        if len(query) < 2:
            return Response({
                'success': True,
                'data': []
            })
        
        locations = Location.objects.filter(
            is_active=True,
            name__icontains=query
        )[:10]
        
        serializer = LocationListSerializer(locations, many=True)
        return Response({
            'success': True,
            'data': serializer.data
        })
