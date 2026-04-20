"""
ML Service Module - Singleton pattern for model loading and inference.
This module handles all ML-related operations in isolation from the rest of the app.
"""

import logging
import threading
from typing import Optional, Dict, Any, List, Tuple
import numpy as np

logger = logging.getLogger('ml')


class MLModelService:
    """
    Singleton ML service that handles model loading and inference.
    Uses singleton pattern to avoid reloading model on each request.
    
    Thread-safe implementation for concurrent requests.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                # Double-checked locking
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.model = None
        self.scaler = None
        self.model_loaded = False
        self.model_version = 'v1.0'
        self.model_type = 'random_forest'
        self.feature_names = [
            'temperature',
            'humidity',
            'pressure',
            'wind_speed',
            'cloudiness',
        ]
        
        # Try to load the model on initialization
        self._load_model()
        self._initialized = True
    
    def _load_model(self) -> bool:
        """
        Load the trained model and scaler from disk.
        Returns True if successful, False otherwise.
        """
        try:
            import joblib
            from django.conf import settings
            
            model_path = settings.ML_MODEL_PATH
            scaler_path = settings.ML_SCALER_PATH
            
            # Load model
            try:
                self.model = joblib.load(model_path)
                logger.info(f"Loaded ML model from {model_path}")
            except FileNotFoundError:
                logger.warning(f"Model file not found at {model_path}, using mock predictions")
                self.model = None
            
            # Load scaler
            try:
                self.scaler = joblib.load(scaler_path)
                logger.info(f"Loaded scaler from {scaler_path}")
            except FileNotFoundError:
                logger.warning(f"Scaler file not found at {scaler_path}")
                self.scaler = None
            
            self.model_loaded = self.model is not None
            return self.model_loaded
            
        except Exception as e:
            logger.error(f"Error loading ML model: {str(e)}")
            self.model_loaded = False
            return False
    
    def reload_model(self) -> bool:
        """
        Reload the model from disk.
        Useful for model updates without restarting the server.
        """
        with self._lock:
            return self._load_model()
    
    def is_ready(self) -> bool:
        """Check if the model is loaded and ready for inference."""
        return self.model_loaded or True  # Allow mock predictions if model not loaded
    
    def preprocess_features(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Preprocess input features for model inference.
        Applies the same transformations used during training.
        
        Args:
            features: Dictionary with weather feature values
            
        Returns:
            Preprocessed feature array ready for model input
        """
        # Extract features in the correct order
        feature_vector = []
        for name in self.feature_names:
            value = features.get(name, 0)
            feature_vector.append(float(value))
        
        feature_array = np.array(feature_vector).reshape(1, -1)
        
        # Apply scaling if scaler is available
        if self.scaler is not None:
            try:
                feature_array = self.scaler.transform(feature_array)
            except Exception as e:
                logger.warning(f"Scaling failed: {str(e)}, using raw features")
        
        return feature_array
    
    def predict(self, features: Dict[str, Any]) -> Tuple[float, Optional[float]]:
        """
        Make a rainfall prediction based on input features.
        
        Args:
            features: Dictionary containing weather features:
                - temperature: Temperature in Celsius
                - humidity: Humidity percentage (0-100)
                - pressure: Atmospheric pressure in hPa
                - wind_speed: Wind speed in m/s
                - cloudiness: Cloud coverage percentage (0-100)
                
        Returns:
            Tuple of (predicted_rainfall, confidence_score)
            - predicted_rainfall: Predicted rainfall in mm
            - confidence_score: Model confidence (0-100) or None
        """
        # Preprocess features
        feature_array = self.preprocess_features(features)
        
        if self.model is not None:
            try:
                # Get prediction
                prediction = self.model.predict(feature_array)[0]
                
                # Get confidence if available (for tree-based models)
                confidence = None
                if hasattr(self.model, 'predict_proba'):
                    try:
                        proba = self.model.predict_proba(feature_array)
                        confidence = float(np.max(proba) * 100)
                    except:
                        pass
                
                # Ensure non-negative prediction
                prediction = max(0, float(prediction))
                
                logger.info(f"ML prediction: {prediction:.2f}mm (confidence: {confidence})")
                return prediction, confidence
                
            except Exception as e:
                logger.error(f"Prediction error: {str(e)}")
                # Fall back to rule-based prediction
                return self._rule_based_prediction(features)
        else:
            # Use rule-based prediction if model not available
            return self._rule_based_prediction(features)
    
    def _rule_based_prediction(self, features: Dict[str, Any]) -> Tuple[float, Optional[float]]:
        """
        Rule-based fallback prediction when ML model is not available.
        Uses meteorological heuristics for rainfall estimation.
        """
        humidity = features.get('humidity', 50)
        cloudiness = features.get('cloudiness', 50)
        pressure = features.get('pressure', 1013)
        temperature = features.get('temperature', 25)
        
        # Base probability from humidity and cloudiness
        rain_probability = (humidity * 0.4 + cloudiness * 0.4) / 100
        
        # Low pressure increases rain chance
        if pressure < 1010:
            rain_probability += 0.15
        elif pressure < 1005:
            rain_probability += 0.25
        
        # Temperature affects precipitation type and amount
        if temperature > 25:
            rain_probability *= 1.1  # Warmer air holds more moisture
        
        # Calculate estimated rainfall
        if rain_probability > 0.7:
            rainfall = 15 + (rain_probability - 0.7) * 50
        elif rain_probability > 0.5:
            rainfall = 5 + (rain_probability - 0.5) * 50
        elif rain_probability > 0.3:
            rainfall = (rain_probability - 0.3) * 25
        else:
            rainfall = 0
        
        # Add some variation based on other factors
        rainfall *= (1 + (humidity - 50) / 200)
        
        # Ensure reasonable bounds
        rainfall = max(0, min(rainfall, 100))
        
        # Confidence is lower for rule-based predictions
        confidence = 65.0 + (rain_probability * 15)
        
        logger.info(f"Rule-based prediction: {rainfall:.2f}mm (confidence: {confidence:.1f})")
        return rainfall, confidence
    
    def batch_predict(self, features_list: List[Dict[str, Any]]) -> List[Tuple[float, Optional[float]]]:
        """
        Make predictions for multiple feature sets.
        More efficient for batch processing.
        
        Args:
            features_list: List of feature dictionaries
            
        Returns:
            List of (predicted_rainfall, confidence_score) tuples
        """
        results = []
        for features in features_list:
            result = self.predict(features)
            results.append(result)
        return results
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        return {
            'model_loaded': self.model_loaded,
            'model_version': self.model_version,
            'model_type': self.model_type,
            'feature_names': self.feature_names,
            'scaler_loaded': self.scaler is not None,
        }


# Global singleton instance
ml_service = MLModelService()


def get_ml_service() -> MLModelService:
    """Get the singleton ML service instance."""
    return ml_service
