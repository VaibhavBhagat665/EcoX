/**
 * ML Service Integration for EcoX Backend
 * Connects to Python ML microservice for advanced carbon calculations
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_SERVICE_TIMEOUT = 30000; // 30 seconds

export interface MLCarbonResult {
  success: boolean;
  result?: {
    co2_kg: number;
    confidence: number;
    breakdown: {
      energy_type: string;
      consumption_kwh: number;
      emission_factor: number;
      basic_calculation: number;
      ml_enhanced: number;
    };
    savings_potential: {
      [key: string]: {
        kwh_saved: number;
        co2_saved: number;
        cost_easy: string;
      };
    };
    recommendations: Array<{
      title: string;
      description: string;
      impact: string;
      effort: string;
      potential_savings: string;
    }>;
  };
  error?: string;
  timestamp?: string;
}

export interface MLImageAnalysisResult {
  success: boolean;
  ocr_text?: string;
  parsed_data?: {
    kwh: number;
    amount: number;
    service_period: string;
    provider: string;
    confidence: number;
  };
  carbon_analysis?: MLCarbonResult['result'];
  error?: string;
  timestamp?: string;
}

export interface MLRecommendationsResult {
  success: boolean;
  recommendations?: Array<{
    title: string;
    description: string;
    impact: string;
    effort: string;
    potential_savings: string;
  }>;
  error?: string;
  timestamp?: string;
}

/**
 * Check if ML service is available
 */
export async function checkMLServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.warn('ML service health check failed:', error);
    return false;
  }
}

/**
 * Calculate carbon footprint using ML service
 */
export async function calculateCarbonWithML(energyData: {
  kWh: number;
  type?: string;
  household_size?: number;
  region?: string;
}): Promise<MLCarbonResult> {
  try {
    console.log('🤖 Calling ML service for carbon calculation');
    
    const response = await fetch(`${ML_SERVICE_URL}/calculate-carbon`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(energyData),
      signal: AbortSignal.timeout(ML_SERVICE_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ML carbon calculation completed');
    return result;

  } catch (error) {
    console.error('❌ ML carbon calculation failed:', error);
    
    // Fallback calculation
    const basicCO2 = energyData.kWh * 0.416; // Basic grid factor
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ML service unavailable',
      result: {
        co2_kg: basicCO2,
        confidence: 0.5,
        breakdown: {
          energy_type: energyData.type || 'electricity_grid',
          consumption_kwh: energyData.kWh,
          emission_factor: 0.416,
          basic_calculation: basicCO2,
          ml_enhanced: basicCO2
        },
        savings_potential: {
          led_lighting: {
            kwh_saved: energyData.kWh * 0.15,
            co2_saved: energyData.kWh * 0.15 * 0.416,
            cost_easy: 'Easy'
          }
        },
        recommendations: [
          {
            title: 'Basic Energy Efficiency',
            description: 'ML service unavailable, using basic recommendations',
            impact: 'Medium',
            effort: 'Easy',
            potential_savings: `${(energyData.kWh * 0.1).toFixed(0)} kWh/month`
          }
        ]
      }
    };
  }
}

/**
 * Analyze uploaded image using ML service
 */
export async function analyzeImageWithML(imageFile: {
  path: string;
  originalname: string;
  mimetype: string;
}): Promise<MLImageAnalysisResult> {
  try {
    console.log('🖼️ Calling ML service for image analysis');
    
    const FormData = require('form-data');
    const fs = require('fs');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(imageFile.path), {
      filename: imageFile.originalname,
      contentType: imageFile.mimetype,
    });

    const response = await fetch(`${ML_SERVICE_URL}/analyze-image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(ML_SERVICE_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ML image analysis completed');
    return result;

  } catch (error) {
    console.error('❌ ML image analysis failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ML service unavailable',
      ocr_text: '[OCR not available - ML service offline]',
      parsed_data: {
        kwh: 0,
        amount: 0,
        service_period: '',
        provider: '',
        confidence: 0
      }
    };
  }
}

/**
 * Get personalized recommendations from ML service
 */
export async function getMLRecommendations(userProfile: {
  totalTokens?: number;
  carbonSaved?: number;
  recentActions?: string[];
  currentUsage?: number;
}): Promise<MLRecommendationsResult> {
  try {
    console.log('💡 Calling ML service for recommendations');
    
    const response = await fetch(`${ML_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_profile: userProfile,
        recent_actions: userProfile.recentActions || []
      }),
      signal: AbortSignal.timeout(ML_SERVICE_TIMEOUT),
    });

    if (!response.ok) {
      throw new Error(`ML service error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ ML recommendations completed');
    return result;

  } catch (error) {
    console.error('��� ML recommendations failed:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'ML service unavailable',
      recommendations: [
        {
          title: 'Energy Efficiency Audit',
          description: 'Conduct a home energy audit to identify savings opportunities',
          impact: 'High',
          effort: 'Medium',
          potential_savings: '15-25% energy reduction'
        },
        {
          title: 'LED Lighting Upgrade',
          description: 'Replace incandescent bulbs with energy-efficient LED lighting',
          impact: 'Medium',
          effort: 'Easy',
          potential_savings: '10-15% lighting energy reduction'
        }
      ]
    };
  }
}

/**
 * Enhanced verification using ML service
 */
export async function verifyActionWithML(actionData: {
  type: string;
  imageUrl?: string;
  imagePath?: string;
  userSubmittedData: any;
}): Promise<{
  verified: boolean;
  confidence: number;
  mlAnalysis: string;
  extractedData?: any;
  carbonCalculation?: MLCarbonResult['result'];
}> {
  try {
    let mlResults: any = {};
    
    // If image is provided, analyze it first
    if (actionData.imagePath) {
      const imageAnalysis = await analyzeImageWithML({
        path: actionData.imagePath,
        originalname: 'uploaded_file',
        mimetype: 'image/jpeg'
      });
      
      if (imageAnalysis.success && imageAnalysis.parsed_data) {
        mlResults = imageAnalysis.parsed_data;
      }
    }
    
    // Calculate carbon footprint with ML
    const energyData = {
      kWh: mlResults.kwh || actionData.userSubmittedData.kWh || 0,
      type: actionData.type === 'solar' ? 'solar' : 'electricity_grid',
      household_size: actionData.userSubmittedData.household_size || 2
    };
    
    const carbonResult = await calculateCarbonWithML(energyData);
    
    // Determine verification status
    const hasValidData = energyData.kWh > 0;
    const confidenceScore = carbonResult.result?.confidence || 0.5;
    const verified = hasValidData && confidenceScore > 0.6;
    
    return {
      verified,
      confidence: confidenceScore,
      mlAnalysis: `ML analysis completed with ${(confidenceScore * 100).toFixed(1)}% confidence. 
                  ${hasValidData ? `Detected ${energyData.kWh} kWh usage.` : 'No energy data detected.'}
                  ${carbonResult.result ? `Estimated ${carbonResult.result.co2_kg} kg CO2 impact.` : ''}`,
      extractedData: mlResults,
      carbonCalculation: carbonResult.result
    };
    
  } catch (error) {
    console.error('ML verification failed:', error);
    
    return {
      verified: false,
      confidence: 0.3,
      mlAnalysis: `ML verification failed: ${error instanceof Error ? error.message : 'Unknown error'}. Using fallback verification.`,
      extractedData: null,
      carbonCalculation: null
    };
  }
}

/**
 * Initialize ML service connection
 */
export async function initializeMLService(): Promise<void> {
  const isHealthy = await checkMLServiceHealth();
  
  if (isHealthy) {
    console.log('🤖 ML Service connected successfully');
  } else {
    console.log('⚠️ ML Service not available - using fallback calculations');
  }
}

// Initialize on module load
initializeMLService();

export default {
  checkMLServiceHealth,
  calculateCarbonWithML,
  analyzeImageWithML,
  getMLRecommendations,
  verifyActionWithML,
  initializeMLService
};
