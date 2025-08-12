"""
EcoX ML Microservice
Carbon Calculation and Image Analysis using Python ML
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import numpy as np
import cv2
import pandas as pd
from PIL import Image
import pytesseract
import re
import json
from datetime import datetime
import logging
from typing import Dict, List, Optional, Tuple
import tensorflow as tf
from sklearn.preprocessing import StandardScaler
import joblib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
MODEL_FOLDER = 'models'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(MODEL_FOLDER, exist_ok=True)

# Carbon emission factors (kg CO2 per unit)
EMISSION_FACTORS = {
    'electricity_grid': 0.416,  # kg CO2 per kWh (US average)
    'natural_gas': 0.202,       # kg CO2 per kWh
    'gasoline': 2.31,           # kg CO2 per liter
    'diesel': 2.68,             # kg CO2 per liter
    'coal': 0.820,              # kg CO2 per kWh
    'solar': 0.041,             # kg CO2 per kWh (lifecycle)
    'wind': 0.011,              # kg CO2 per kWh (lifecycle)
    'hydro': 0.024,             # kg CO2 per kWh (lifecycle)
}

class CarbonCalculator:
    """Advanced carbon footprint calculation engine"""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.load_models()
    
    def load_models(self):
        """Load pre-trained ML models"""
        try:
            # Try to load existing models, create defaults if not found
            model_path = os.path.join(MODEL_FOLDER, 'carbon_model.joblib')
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                logger.info("Loaded existing carbon prediction model")
            else:
                # Create a simple default model
                self.create_default_model()
                logger.info("Created default carbon prediction model")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            self.create_default_model()
    
    def create_default_model(self):
        """Create a default ML model for carbon calculation"""
        from sklearn.ensemble import RandomForestRegressor
        
        # Create synthetic training data for demo
        np.random.seed(42)
        n_samples = 1000
        
        # Features: [kWh, household_size, region_factor, appliance_efficiency]
        X = np.random.rand(n_samples, 4)
        X[:, 0] *= 2000  # kWh (0-2000)
        X[:, 1] *= 6     # household size (0-6)
        X[:, 2] *= 2     # region factor (0-2)
        X[:, 3] *= 1     # efficiency (0-1)
        
        # Target: CO2 emissions with some realistic calculation
        y = (X[:, 0] * EMISSION_FACTORS['electricity_grid'] * 
             (1 + X[:, 1] * 0.1) * X[:, 2] * (2 - X[:, 3]))
        
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.model.fit(X, y)
        
        # Save the model
        joblib.dump(self.model, os.path.join(MODEL_FOLDER, 'carbon_model.joblib'))
        
    def calculate_from_energy_data(self, energy_data: Dict) -> Dict:
        """Calculate carbon footprint from energy consumption data"""
        try:
            kwh = float(energy_data.get('kWh', 0))
            energy_type = energy_data.get('type', 'electricity_grid')
            household_size = int(energy_data.get('household_size', 2))
            region = energy_data.get('region', 'US')
            
            # Basic calculation
            emission_factor = EMISSION_FACTORS.get(energy_type, EMISSION_FACTORS['electricity_grid'])
            basic_co2 = kwh * emission_factor
            
            # ML-enhanced calculation
            features = np.array([[
                kwh,
                household_size,
                1.0,  # region factor (would be learned from data)
                0.8   # efficiency factor (would be learned from data)
            ]])
            
            ml_co2 = self.model.predict(features)[0]
            
            # Combine basic and ML predictions
            final_co2 = (basic_co2 + ml_co2) / 2
            
            # Calculate confidence based on data quality
            confidence = self.calculate_confidence(energy_data)
            
            # Calculate potential savings
            savings_potential = self.calculate_savings_potential(energy_data)
            
            return {
                'co2_kg': round(final_co2, 2),
                'confidence': confidence,
                'breakdown': {
                    'energy_type': energy_type,
                    'consumption_kwh': kwh,
                    'emission_factor': emission_factor,
                    'basic_calculation': round(basic_co2, 2),
                    'ml_enhanced': round(ml_co2, 2)
                },
                'savings_potential': savings_potential,
                'recommendations': self.generate_recommendations(energy_data, final_co2)
            }
            
        except Exception as e:
            logger.error(f"Carbon calculation error: {e}")
            return {
                'co2_kg': 0,
                'confidence': 0,
                'error': str(e)
            }
    
    def calculate_confidence(self, data: Dict) -> float:
        """Calculate confidence score based on data quality"""
        confidence = 0.5  # Base confidence
        
        # Increase confidence based on available data
        if 'kWh' in data and data['kWh'] > 0:
            confidence += 0.2
        if 'type' in data:
            confidence += 0.1
        if 'household_size' in data:
            confidence += 0.1
        if 'region' in data:
            confidence += 0.1
            
        return min(confidence, 1.0)
    
    def calculate_savings_potential(self, data: Dict) -> Dict:
        """Calculate potential CO2 savings"""
        current_kwh = float(data.get('kWh', 0))
        
        # Estimate savings from common efficiency measures
        led_savings = current_kwh * 0.15  # 15% savings from LED lights
        smart_thermostat = current_kwh * 0.12  # 12% savings
        efficient_appliances = current_kwh * 0.20  # 20% savings
        
        return {
            'led_lighting': {
                'kwh_saved': round(led_savings, 1),
                'co2_saved': round(led_savings * EMISSION_FACTORS['electricity_grid'], 2),
                'cost_easy': 'Easy'
            },
            'smart_thermostat': {
                'kwh_saved': round(smart_thermostat, 1),
                'co2_saved': round(smart_thermostat * EMISSION_FACTORS['electricity_grid'], 2),
                'cost_easy': 'Medium'
            },
            'efficient_appliances': {
                'kwh_saved': round(efficient_appliances, 1),
                'co2_saved': round(efficient_appliances * EMISSION_FACTORS['electricity_grid'], 2),
                'cost_easy': 'Hard'
            }
        }
    
    def generate_recommendations(self, data: Dict, co2_amount: float) -> List[Dict]:
        """Generate personalized recommendations"""
        kwh = float(data.get('kWh', 0))
        recommendations = []
        
        if kwh > 1000:  # High consumption
            recommendations.append({
                'title': 'High Energy Usage Detected',
                'description': 'Consider upgrading to energy-efficient appliances',
                'impact': 'High',
                'effort': 'Medium',
                'potential_savings': f"{kwh * 0.2:.0f} kWh/month"
            })
        
        if kwh > 500:
            recommendations.append({
                'title': 'LED Lighting Upgrade',
                'description': 'Replace incandescent bulbs with LED lighting',
                'impact': 'Medium',
                'effort': 'Easy',
                'potential_savings': f"{kwh * 0.15:.0f} kWh/month"
            })
        
        recommendations.append({
            'title': 'Smart Thermostat',
            'description': 'Install a programmable smart thermostat',
            'impact': 'Medium',
            'effort': 'Medium',
            'potential_savings': f"{kwh * 0.12:.0f} kWh/month"
        })
        
        return recommendations

class ImageAnalyzer:
    """Image analysis for bills, receipts, and meter readings"""
    
    def __init__(self):
        # Configure Tesseract path (adjust for your system)
        # pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'
        pass
    
    def extract_text_from_image(self, image_path: str) -> str:
        """Extract text from image using OCR"""
        try:
            image = Image.open(image_path)
            # Preprocess image for better OCR
            image = self.preprocess_image(image)
            text = pytesseract.image_to_string(image, config='--psm 6')
            return text
        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            return ""
    
    def preprocess_image(self, image: Image) -> Image:
        """Preprocess image for better OCR results"""
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')
        
        # Convert to numpy array for OpenCV processing
        img_array = np.array(image)
        
        # Apply image processing techniques
        # Gaussian blur to reduce noise
        img_array = cv2.GaussianBlur(img_array, (5, 5), 0)
        
        # Threshold to get clear text
        _, img_array = cv2.threshold(img_array, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Convert back to PIL Image
        return Image.fromarray(img_array)
    
    def parse_utility_bill(self, text: str) -> Dict:
        """Parse utility bill text to extract energy data"""
        result = {
            'kwh': 0,
            'amount': 0,
            'service_period': '',
            'provider': '',
            'confidence': 0
        }
        
        try:
            # Common patterns for energy bills
            kwh_patterns = [
                r'(\d+(?:\.\d+)?)\s*kWh',
                r'(\d+(?:\.\d+)?)\s*KWH',
                r'Total\s*Usage:?\s*(\d+(?:\.\d+)?)',
                r'Energy\s*Used:?\s*(\d+(?:\.\d+)?)'
            ]
            
            amount_patterns = [
                r'\$(\d+(?:\.\d+)?)',
                r'Total\s*Amount:?\s*\$?(\d+(?:\.\d+)?)',
                r'Amount\s*Due:?\s*\$?(\d+(?:\.\d+)?)'
            ]
            
            # Extract kWh
            for pattern in kwh_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result['kwh'] = float(match.group(1))
                    result['confidence'] += 0.3
                    break
            
            # Extract amount
            for pattern in amount_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    result['amount'] = float(match.group(1))
                    result['confidence'] += 0.2
                    break
            
            # Extract service period
            date_pattern = r'(\w+\s+\d{1,2},?\s+\d{4})'
            dates = re.findall(date_pattern, text)
            if len(dates) >= 2:
                result['service_period'] = f"{dates[0]} - {dates[1]}"
                result['confidence'] += 0.2
            
            # Extract provider (common utility companies)
            providers = ['PG&E', 'ConEd', 'Duke Energy', 'Southern Company', 'Electric Company']
            for provider in providers:
                if provider.lower() in text.lower():
                    result['provider'] = provider
                    result['confidence'] += 0.1
                    break
            
            result['confidence'] = min(result['confidence'], 1.0)
            
        except Exception as e:
            logger.error(f"Bill parsing error: {e}")
        
        return result

# Initialize components
carbon_calculator = CarbonCalculator()
image_analyzer = ImageAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'EcoX ML Service',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/calculate-carbon', methods=['POST'])
def calculate_carbon():
    """Calculate carbon footprint from energy data"""
    try:
        data = request.get_json()
        result = carbon_calculator.calculate_from_energy_data(data)
        return jsonify({
            'success': True,
            'result': result,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Carbon calculation endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/analyze-image', methods=['POST'])
def analyze_image():
    """Analyze uploaded image for energy data extraction"""
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No file selected'}), 400
        
        # Save uploaded file
        filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Extract text from image
            text = image_analyzer.extract_text_from_image(filepath)
            
            # Parse utility bill data
            parsed_data = image_analyzer.parse_utility_bill(text)
            
            # Calculate carbon footprint if energy data found
            carbon_result = None
            if parsed_data['kwh'] > 0:
                carbon_result = carbon_calculator.calculate_from_energy_data({
                    'kWh': parsed_data['kwh'],
                    'type': 'electricity_grid'
                })
            
            return jsonify({
                'success': True,
                'ocr_text': text[:500],  # Limit text for response size
                'parsed_data': parsed_data,
                'carbon_analysis': carbon_result,
                'timestamp': datetime.now().isoformat()
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
                
    except Exception as e:
        logger.error(f"Image analysis endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Get personalized environmental recommendations"""
    try:
        data = request.get_json()
        user_profile = data.get('user_profile', {})
        recent_actions = data.get('recent_actions', [])
        
        recommendations = carbon_calculator.generate_recommendations(
            user_profile, 
            user_profile.get('current_co2', 0)
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Recommendations endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/train-model', methods=['POST'])
def train_model():
    """Train/update ML model with new data"""
    try:
        # This would implement online learning or model retraining
        # For now, return success status
        return jsonify({
            'success': True,
            'message': 'Model training initiated',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        logger.error(f"Model training error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
