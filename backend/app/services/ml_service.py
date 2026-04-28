import numpy as np
import joblib
from typing import Dict, Any, Optional
from pathlib import Path
from app.utils.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

class MLService:
    """Machine Learning service for rainfall predictions"""
    
    _model = None
    _scaler = None
    
    @classmethod
    async def initialize(cls):
        """Load ML models and scaler"""
        try:
            model_path = Path(settings.MODEL_PATH)
            scaler_path = Path(settings.SCALER_PATH)
            
            if model_path.exists() and scaler_path.exists():
                cls._model = joblib.load(model_path)
                cls._scaler = joblib.load(scaler_path)
                logger.info("ML models loaded successfully")
            else:
                logger.warning("Model files not found, creating dummy models")
                cls._create_dummy_models()
                
        except Exception as e:
            logger.error(f"Error loading ML models: {e}")
            cls._create_dummy_models()
    
    @classmethod
    def _create_dummy_models(cls):
        """Create dummy models for development"""
        try:
            from sklearn.ensemble import RandomForestRegressor
            from sklearn.preprocessing import StandardScaler
            
            # Create dummy model
            cls._model = RandomForestRegressor(n_estimators=10, random_state=42)
            X_dummy = np.random.rand(100, 6)  # 6 features
            y_dummy = np.random.rand(100) * 10  # Dummy rainfall values
            cls._model.fit(X_dummy, y_dummy)
            
            # Create dummy scaler
            cls._scaler = StandardScaler()
            cls._scaler.fit(X_dummy)
            
            logger.info("Dummy ML models created successfully")
        except Exception as e:
            logger.error(f"Error creating dummy models: {e}")
            raise
    
    @classmethod
    async def health_check(cls) -> Dict[str, Any]:
        """Check ML service health"""
        try:
            return {
                "status": "healthy",
                "models_loaded": cls._model is not None and cls._scaler is not None,
                "model_type": type(cls._model).__name__ if cls._model else None,
                "scaler_type": type(cls._scaler).__name__ if cls._scaler else None
            }
        except Exception as e:
            logger.error(f"ML service health check failed: {e}")
            return {"status": "unhealthy", "error": str(e)}
    
    @classmethod
    def _calculate_confidence_score(cls, features: np.ndarray) -> float:
        """Calculate confidence score based on model predictions variance"""
        try:
            if not hasattr(cls._model, 'estimators_'):
                return 0.7  # Default confidence for non-ensemble models
            
            # Get predictions from all trees in the Random Forest
            tree_predictions = []
            for estimator in cls._model.estimators_:
                tree_pred = estimator.predict(features)[0]
                tree_predictions.append(tree_pred)
            
            # Calculate coefficient of variation as confidence measure
            tree_predictions = np.array(tree_predictions)
            mean_pred = np.mean(tree_predictions)
            std_pred = np.std(tree_predictions)
            
            # Lower variance = higher confidence
            if mean_pred != 0:
                cv = std_pred / abs(mean_pred)
                confidence = max(0.1, min(0.95, 1.0 - cv))
            else:
                confidence = 0.5
                
            return float(confidence)
        except Exception as e:
            logger.error(f"Error calculating confidence: {e}")
            return 0.7  # Default confidence
    
    @classmethod
    async def predict_rainfall(cls, features: Dict[str, float]) -> Dict[str, float]:
        """Predict rainfall based on weather features"""
        try:
            if not cls._model or not cls._scaler:
                raise RuntimeError("ML models not loaded")
            
            # Prepare input features
            feature_array = np.array([[
                features['TS'],
                features['RH2M'],
                features['PS'],
                features['WS2M'],
                features['CLOUD_AMT'],
                features['month']
            ]])
            
            # Scale the features
            features_scaled = cls._scaler.transform(feature_array)
            
            # Make prediction
            prediction = cls._model.predict(features_scaled)[0]
            
            # Apply expm1 if model was trained on log-transformed data
            # This depends on how the original model was trained
            # Uncomment if needed: prediction = np.expm1(prediction)
            
            # Calculate confidence score
            confidence = cls._calculate_confidence_score(features_scaled)
            
            logger.info(f"Prediction made: {prediction:.2f}mm, confidence: {confidence:.2f}")
            
            return {
                'prediction': float(prediction),
                'confidence_score': confidence
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
    
    @classmethod
    def get_model_info(cls) -> Dict[str, Any]:
        """Get information about loaded models"""
        try:
            if not cls._model or not cls._scaler:
                return {"error": "Models not loaded"}
            
            return {
                "model_type": type(cls._model).__name__,
                "model_params": cls._model.get_params(),
                "n_features": cls._model.n_features_in_ if hasattr(cls._model, 'n_features_in_') else 6,
                "scaler_type": type(cls._scaler).__name__
            }
        except Exception as e:
            logger.error(f"Error getting model info: {e}")
            return {"error": str(e)}
