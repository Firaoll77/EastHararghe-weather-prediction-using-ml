# East Hararge Weather Prediction API

A production-grade Django REST Framework backend for the weather prediction system with ML inference capabilities.

## Architecture

This backend follows clean architecture principles with clear separation of concerns:

```
backend/
├── config/                 # Django configuration
│   ├── settings.py        # Settings with environment variables
│   ├── urls.py            # Main URL routing
│   └── wsgi.py            # WSGI entry point
├── core/                   # Shared utilities
│   ├── services.py        # Base service classes
│   ├── exceptions.py      # Custom exceptions
│   ├── middleware.py      # Request logging
│   └── permissions.py     # Custom permissions
├── apps/                   # Django applications
│   ├── users/             # Authentication & user management
│   ├── locations/         # District-based locations
│   ├── weather/           # Weather API integration
│   └── predictions/       # ML predictions
├── ml_models/             # Trained ML models (.pkl files)
└── logs/                  # Application logs
```

### Layer Architecture

1. **Presentation Layer (Views)** - Thin views that handle HTTP requests/responses
2. **Service Layer** - Business logic and orchestration
3. **Data Layer (Models)** - Database models and repositories
4. **ML Layer** - Isolated ML inference module with singleton pattern

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Login with JWT tokens |
| `/api/auth/logout/` | POST | Logout (blacklist token) |
| `/api/auth/refresh/` | POST | Refresh access token |

### User Profile

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/user/profile/` | GET | Get user profile |
| `/api/user/profile/` | PATCH | Update profile |
| `/api/user/change-password/` | POST | Change password |
| `/api/user/predictions/` | GET | User's prediction history |

### Weather

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/weather/live/` | GET | Live weather data |
| `/api/weather/history/` | GET | Historical weather |
| `/api/weather/forecast/` | GET | Weather forecast |

### Predictions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict/` | POST | Make rainfall prediction |
| `/api/predict/custom/` | POST | Prediction with custom features |
| `/api/predict/status/` | GET | ML model status |
| `/api/predict/history/` | GET | User's predictions |

### Locations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/locations/` | GET | List all locations |
| `/api/locations/search/` | GET | Search locations |
| `/api/locations/<id>/` | GET | Location details |

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL (or SQLite for development)
- OpenWeatherMap API key

### Installation

1. Create virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

4. Run migrations:
```bash
python manage.py migrate
```

5. Create superuser:
```bash
python manage.py createsuperuser
```

6. Load initial locations:
```bash
python manage.py shell
from apps.locations.models import Location, EASTERN_HARARGE_LOCATIONS
for loc in EASTERN_HARARGE_LOCATIONS:
    Location.objects.get_or_create(name=loc['name'], defaults=loc)
```

7. Run development server:
```bash
python manage.py runserver
```

### ML Model Setup

Place your trained model files in `ml_models/`:
- `rainfall_model.pkl` - Trained prediction model
- `scaler.pkl` - Feature scaler

The ML service uses a singleton pattern to load models once and reuse them across requests.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DJANGO_SECRET_KEY` | Django secret key | (required) |
| `DJANGO_DEBUG` | Debug mode | `True` |
| `DB_*` | Database settings | SQLite |
| `OPENWEATHER_API_KEY` | Weather API key | (required) |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | localhost |
| `JWT_ACCESS_LIFETIME` | Access token lifetime (minutes) | 60 |
| `JWT_REFRESH_LIFETIME` | Refresh token lifetime (days) | 7 |

## System Flow

```
User Request
    │
    ▼
Next.js Frontend
    │
    ▼ (HTTP/JSON)
Django REST API
    │
    ├──▶ Weather Service ──▶ OpenWeatherMap API
    │         │
    │         ▼
    │    Weather Data (cached in DB)
    │
    └──▶ ML Service (Singleton)
              │
              ▼
         Prediction + History
              │
              ▼
         Response to Frontend
```

## Development

### Running Tests

```bash
pytest
```

### Code Quality

```bash
black .
isort .
flake8
```

### API Documentation

When running in debug mode, visit `/api/docs/` for interactive API documentation.

## Production Deployment

1. Set `DJANGO_DEBUG=False`
2. Configure PostgreSQL database
3. Set strong `DJANGO_SECRET_KEY`
4. Configure proper `ALLOWED_HOSTS`
5. Use gunicorn: `gunicorn config.wsgi:application`
6. Set up reverse proxy (nginx)
7. Configure SSL/TLS

## License

MIT License
