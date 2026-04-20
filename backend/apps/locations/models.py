"""
Location models for district-based weather forecasting.
"""

from django.db import models


class Location(models.Model):
    """
    Location model for Eastern Hararge districts.
    Stores geographic information for weather queries.
    """
    
    name = models.CharField(max_length=100, unique=True, db_index=True)
    name_amharic = models.CharField(max_length=100, blank=True)
    
    # Geographic coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    elevation = models.IntegerField(
        help_text='Elevation in meters above sea level',
        null=True,
        blank=True
    )
    
    # Administrative information
    district = models.CharField(max_length=100, blank=True)
    zone = models.CharField(max_length=100, default='Eastern Hararge')
    region = models.CharField(max_length=100, default='Oromia')
    
    # Weather station info
    has_weather_station = models.BooleanField(default=False)
    station_id = models.CharField(max_length=50, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'location'
        verbose_name_plural = 'locations'
        ordering = ['name']
        indexes = [
            models.Index(fields=['latitude', 'longitude']),
        ]
    
    def __str__(self):
        return f"{self.name}, {self.zone}"
    
    @property
    def coordinates(self):
        """Return coordinates as tuple."""
        return (float(self.latitude), float(self.longitude))


# Initial locations for Eastern Hararge
EASTERN_HARARGE_LOCATIONS = [
    {
        'name': 'Harar City',
        'latitude': 9.3116,
        'longitude': 42.1201,
        'elevation': 1885,
        'district': 'Harar',
        'has_weather_station': True,
    },
    {
        'name': 'Gursum',
        'latitude': 9.3667,
        'longitude': 42.4167,
        'elevation': 1600,
        'district': 'Gursum',
    },
    {
        'name': 'Babile',
        'latitude': 9.2333,
        'longitude': 42.3333,
        'elevation': 1650,
        'district': 'Babile',
    },
    {
        'name': 'Fedis',
        'latitude': 9.1500,
        'longitude': 42.0500,
        'elevation': 1750,
        'district': 'Fedis',
    },
    {
        'name': 'Kombolcha',
        'latitude': 9.4167,
        'longitude': 42.1167,
        'elevation': 1800,
        'district': 'Kombolcha',
    },
    {
        'name': 'Jarso',
        'latitude': 9.1833,
        'longitude': 42.4500,
        'elevation': 1500,
        'district': 'Jarso',
    },
    {
        'name': 'Chinaksen',
        'latitude': 9.0833,
        'longitude': 42.5833,
        'elevation': 1400,
        'district': 'Chinaksen',
    },
    {
        'name': 'Kersa',
        'latitude': 9.4500,
        'longitude': 41.8500,
        'elevation': 2000,
        'district': 'Kersa',
    },
    {
        'name': 'Meta',
        'latitude': 9.4333,
        'longitude': 41.7167,
        'elevation': 2100,
        'district': 'Meta',
    },
    {
        'name': 'Gola Oda',
        'latitude': 9.0167,
        'longitude': 42.3833,
        'elevation': 1350,
        'district': 'Gola Oda',
    },
]
