# ML Models Directory

This directory contains the trained machine learning models for the East Hararghe weather prediction system.

## Required Files

1. `eastern_hararghe_final_model.pkl` - The trained Random Forest model
2. `weather_scaler.pkl` - The feature scaler used during training

## Model Training

The models should be trained on historical weather data from East Hararghe Zone with the following features:

- TS (Temperature)
- RH2M (Relative Humidity at 2m)
- PS (Surface Pressure)
- WS2M (Wind Speed at 2m)
- CLOUD_AMT (Cloud Amount)
- month (Month of year, 1-12)

## Development Mode

If the model files are not present, the service will automatically create dummy models for development purposes. However, for production use, you must provide the actual trained models.

## Training Script Example

```python
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pandas as pd

# Load your training data
# df = pd.read_csv('your_training_data.csv')

# Prepare features
# X = df[['TS', 'RH2M', 'PS', 'WS2M', 'CLOUD_AMT', 'month']]
# y = df['rainfall']

# Scale features
# scaler = StandardScaler()
# X_scaled = scaler.fit_transform(X)

# Train model
# model = RandomForestRegressor(n_estimators=100, random_state=42)
# model.fit(X_scaled, y)

# Save models
# joblib.dump(model, 'eastern_hararghe_final_model.pkl')
# joblib.dump(scaler, 'weather_scaler.pkl')
```

## Model Information

- **Algorithm**: Random Forest Regressor
- **Features**: 6 weather features
- **Target**: Rainfall amount (mm)
- **Output**: Predicted rainfall with confidence score
