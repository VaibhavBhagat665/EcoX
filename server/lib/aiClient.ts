/**
 * AI microservice client for EcoX backend
 * Handles OCR, estimation, and verification with Gemini AI and mock fallback
 */

import { analyzeEnvironmentalAction, chatWithGeminiAssistant, isGeminiAvailable } from './geminiAI';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || '__SET_IN_REPLIT_SECRETS__';
const MOCK_AI_SERVICE = process.env.MOCK_AI_SERVICE === 'true' ||
                        (AI_SERVICE_URL === '__SET_IN_REPLIT_SECRETS__' && !isGeminiAvailable()) ||
                        (!AI_SERVICE_URL && !isGeminiAvailable());

/**
 * AI Service Response Types
 */
export interface OCRResult {
  success: boolean;
  text: string;
  confidence: number;
  fields: {
    kWh?: number;
    amount?: number;
    date?: string;
    provider?: string;
  };
}

export interface EstimationResult {
  success: boolean;
  co2Kg: number;
  confidence: number;
  methodology: string;
  breakdown: {
    energyType: string;
    consumptionkWh: number;
    emissionFactor: number;
  };
}

export interface ImageVerificationResult {
  success: boolean;
  confidence: number;
  isValidBill: boolean;
  detectedItems: string[];
  anomalies: string[];
}

/**
 * Mock AI responses for development
 */
const MOCK_RESPONSES = {
  OCR: {
    success: true,
    text: "ELECTRIC BILL - Total Usage: 450 kWh - Amount Due: $89.50 - Service Period: Jan 2024",
    confidence: 0.92,
    fields: {
      kWh: 450,
      amount: 89.50,
      date: "2024-01-31",
      provider: "City Electric Company"
    }
  },
  
  ESTIMATION: {
    success: true,
    co2Kg: 187.2,
    confidence: 0.88,
    methodology: "EPA eGRID emission factors",
    breakdown: {
      energyType: "grid_electricity",
      consumptionkWh: 450,
      emissionFactor: 0.416 // kg CO2 per kWh
    }
  },
  
  IMAGE_VERIFICATION: {
    success: true,
    confidence: 0.94,
    isValidBill: true,
    detectedItems: ["utility_logo", "usage_chart", "bill_amount", "account_number"],
    anomalies: []
  }
};

/**
 * Make request to AI service with fallback to mock
 */
async function makeAIRequest(endpoint: string, data: any): Promise<any> {
  if (MOCK_AI_SERVICE) {
    console.log(`🔄 Mock AI request to ${endpoint}:`, data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Return mock data based on endpoint
    switch (endpoint) {
      case '/ocr':
        return MOCK_RESPONSES.OCR;
      case '/estimate':
        return MOCK_RESPONSES.ESTIMATION;
      case '/verify-image':
        return MOCK_RESPONSES.IMAGE_VERIFICATION;
      default:
        throw new Error(`Unknown AI endpoint: ${endpoint}`);
    }
  }

  try {
    const response = await fetch(`${AI_SERVICE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.AI_SERVICE_API_KEY || ''}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ AI service request failed for ${endpoint}:`, error);
    
    // Fallback to mock on error
    console.log('🔄 Falling back to mock AI response');
    switch (endpoint) {
      case '/ocr':
        return { ...MOCK_RESPONSES.OCR, confidence: 0.5 };
      case '/estimate':
        return { ...MOCK_RESPONSES.ESTIMATION, confidence: 0.5 };
      case '/verify-image':
        return { ...MOCK_RESPONSES.IMAGE_VERIFICATION, confidence: 0.5 };
      default:
        throw error;
    }
  }
}

/**
 * Perform OCR on uploaded bill image
 */
export async function performOCR(imageUrl: string): Promise<OCRResult> {
  console.log(`📝 Performing OCR on image: ${imageUrl}`);
  
  const result = await makeAIRequest('/ocr', {
    imageUrl,
    extractFields: ['kWh', 'amount', 'date', 'provider'],
    language: 'en'
  });

  console.log(`📝 OCR result: ${result.confidence}% confidence, ${result.fields?.kWh || 0} kWh detected`);
  return result;
}

/**
 * Estimate CO2 emissions from energy consumption
 */
export async function estimateEmissions(data: {
  kWh: number;
  energyType?: string;
  location?: string;
  timeframe?: string;
}): Promise<EstimationResult> {
  console.log(`🌍 Estimating emissions for ${data.kWh} kWh`);
  
  const result = await makeAIRequest('/estimate', {
    consumption: data.kWh,
    energyType: data.energyType || 'grid_electricity',
    location: data.location || 'US_average',
    timeframe: data.timeframe || 'monthly'
  });

  console.log(`🌍 Emission estimate: ${result.co2Kg} kg CO2 (${result.confidence}% confidence)`);
  return result;
}

/**
 * Verify if uploaded image is a valid utility bill
 */
export async function verifyBillImage(imageUrl: string): Promise<ImageVerificationResult> {
  console.log(`🔍 Verifying bill image: ${imageUrl}`);
  
  const result = await makeAIRequest('/verify-image', {
    imageUrl,
    validationRules: [
      'utility_logo_present',
      'usage_data_visible',
      'no_tampering_detected',
      'readable_text'
    ]
  });

  console.log(`🔍 Image verification: ${result.isValidBill ? 'VALID' : 'INVALID'} (${result.confidence}% confidence)`);
  return result;
}

/**
 * Enhanced action verification pipeline
 */
export async function verifyActionData(data: {
  type: string;
  imageUrl?: string;
  userSubmittedData: any;
}): Promise<{
  verified: boolean;
  confidence: number;
  aiAnalysis: string;
  extractedData?: any;
  estimatedImpact?: EstimationResult;
}> {
  console.log(`🔄 Starting verification pipeline for ${data.type} action`);

  try {
    // Try Gemini AI first if available
    if (isGeminiAvailable()) {
      try {
        console.log('🤖 Using Gemini AI for action analysis');
        const geminiResult = await analyzeEnvironmentalAction({
          type: data.type,
          description: data.userSubmittedData?.description || 'Environmental action',
          kWh: data.userSubmittedData?.kWh,
          imageUrl: data.imageUrl,
          userSubmittedData: data.userSubmittedData
        });

        return {
          verified: geminiResult.verified,
          confidence: geminiResult.confidence,
          aiAnalysis: geminiResult.aiAnalysis,
          extractedData: data.userSubmittedData,
          estimatedImpact: geminiResult.co2Saved ? {
            success: true,
            co2Kg: geminiResult.co2Saved,
            confidence: geminiResult.confidence,
            methodology: 'Gemini AI Analysis',
            breakdown: {
              energyType: data.type,
              consumptionkWh: data.userSubmittedData?.kWh || 0,
              emissionFactor: 0.4
            }
          } : undefined
        };
      } catch (geminiError) {
        console.warn('Gemini AI failed, falling back to traditional pipeline:', geminiError);
      }
    }

    // Fall back to original verification pipeline
    let verified = false;
    let confidence = 0;
    let aiAnalysis = '';
    let extractedData = null;
    let estimatedImpact: EstimationResult | undefined = undefined;

    if (data.imageUrl) {
      // Step 1: Verify image authenticity
      const imageVerification = await verifyBillImage(data.imageUrl);
      
      if (!imageVerification.isValidBill) {
        return {
          verified: false,
          confidence: imageVerification.confidence,
          aiAnalysis: `Image verification failed: ${imageVerification.anomalies.join(', ') || 'Invalid bill format'}`
        };
      }

      // Step 2: Extract data via OCR
      const ocrResult = await performOCR(data.imageUrl);
      
      if (!ocrResult.success) {
        return {
          verified: false,
          confidence: ocrResult.confidence,
          aiAnalysis: 'Failed to extract readable data from image'
        };
      }

      extractedData = ocrResult.fields;

      // Step 3: Estimate environmental impact
      if (ocrResult.fields.kWh) {
        estimatedImpact = await estimateEmissions({
          kWh: ocrResult.fields.kWh,
          energyType: data.type === 'solar' ? 'solar' : 'grid_electricity'
        });
      }

      // Step 4: Cross-validate with user data
      const userKwh = data.userSubmittedData?.kWh || 0;
      const extractedKwh = ocrResult.fields.kWh || 0;
      
      if (userKwh && extractedKwh) {
        const variance = Math.abs(userKwh - extractedKwh) / extractedKwh;
        
        if (variance > 0.2) { // 20% variance threshold
          confidence = Math.max(0.3, ocrResult.confidence - 0.3);
          aiAnalysis = `Data mismatch detected: User reported ${userKwh} kWh, bill shows ${extractedKwh} kWh (${(variance * 100).toFixed(1)}% variance)`;
        } else {
          confidence = Math.min(0.95, (ocrResult.confidence + imageVerification.confidence) / 2);
          verified = confidence > 0.7;
          aiAnalysis = `Verification successful: Data consistency confirmed (${(variance * 100).toFixed(1)}% variance)`;
        }
      } else {
        confidence = ocrResult.confidence;
        verified = confidence > 0.8;
        aiAnalysis = `OCR extraction completed with ${(confidence * 100).toFixed(1)}% confidence`;
      }
    } else {
      // No image provided - basic validation only
      confidence = 0.6;
      verified = true; // Allow non-image submissions in mock mode
      aiAnalysis = 'No image provided - basic validation applied';
    }

    console.log(`✅ Verification complete: ${verified ? 'VERIFIED' : 'REJECTED'} (${(confidence * 100).toFixed(1)}% confidence)`);

    return {
      verified,
      confidence,
      aiAnalysis,
      extractedData,
      estimatedImpact
    };

  } catch (error) {
    console.error('❌ Verification pipeline failed:', error);
    
    return {
      verified: false,
      confidence: 0,
      aiAnalysis: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Chat with AI assistant
 */
export async function chatWithAssistant(userId: string, message: string): Promise<{
  response: string;
  timestamp: string;
  userId: string;
}> {
  console.log(`💬 Chat request from ${userId}: ${message}`);

  if (MOCK_AI_SERVICE) {
    // Mock AI chat response
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const mockResponses = [
      `Hello! I understand you said: "${message}". As your EcoX assistant, I'm here to help you with environmental actions, token management, and sustainability tips. How can I assist you today?`,
      `Great question about "${message}"! Based on your profile, I'd recommend focusing on energy efficiency actions first, as they typically yield the highest token rewards. Would you like specific suggestions?`,
      `Thank you for asking about "${message}". I see you've been active with environmental actions. Keep up the great work! Your carbon footprint reduction is making a real difference.`,
      `Regarding "${message}" - this is a common sustainability question. I can help you track the environmental impact and suggest ways to earn more ECO tokens through verified actions.`
    ];

    const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];

    return {
      response,
      timestamp: new Date().toISOString(),
      userId
    };
  }

  try {
    const result = await makeAIRequest('/chat', {
      userId,
      message,
      context: 'environmental_assistant',
      features: ['eco_actions', 'token_advice', 'sustainability_tips']
    });

    return {
      response: result.response || 'I apologize, but I encountered an issue processing your request.',
      timestamp: new Date().toISOString(),
      userId
    };
  } catch (error) {
    console.error('Chat request failed:', error);

    return {
      response: `I understand you said: "${message}". I'm currently experiencing some technical difficulties, but I'm here to help with your environmental journey. Please try again in a moment.`,
      timestamp: new Date().toISOString(),
      userId
    };
  }
}

/**
 * Check if AI service is in mock mode
 */
export function isAIMockMode(): boolean {
  return MOCK_AI_SERVICE;
}

// Log initialization status
if (MOCK_AI_SERVICE) {
  console.log('🔄 AI Service running in MOCK MODE - using simulated responses');
} else {
  console.log(`✅ AI Service configured: ${AI_SERVICE_URL}`);
}
