"""
URL configuration for East Hararge Weather Prediction API.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # API v1 endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/weather/', include('apps.weather.urls')),
    path('api/predict/', include('apps.predictions.urls')),
    path('api/user/', include('apps.users.urls_profile')),
    path('api/locations/', include('apps.locations.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
