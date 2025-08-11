import axios from 'axios';

interface VerificationRequest {
  actionId: string;
  actionType: string;
  description: string;
  proofImages?: string[];
  metadata?: any;
}

interface VerificationResult {
  verified: boolean;
  confidence: number;
  reason: string;
  aiScore: number;
}

class AIVerificationService {
  private apiUrl: string;
  private apiKey: string;
  private queueSize: number = 0;
  private successRate: number = 93.4;

  constructor() {
    this.apiUrl = process.env.AI_SERVICE_URL || 'http://localhost:8001';
    this.apiKey = process.env.AI_SERVICE_API_KEY || 'mock-api-key';
  }

  async verifyGreenAction(request: VerificationRequest): Promise<VerificationResult> {
    try {
      this.queueSize++;
      
      // Mock AI verification - replace with real API call
      const response = await this.mockAIVerification(request);
      
      this.queueSize--;
      
      return response;
    } catch (error) {
      this.queueSize--;
      console.error('AI verification failed:', error);
      
      // Return default verification result on error
      return {
        verified: false,
        confidence: 0,
        reason: 'AI service unavailable',
        aiScore: 0
      };
    }
  }

  private async mockAIVerification(request: VerificationRequest): Promise<VerificationResult> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2300));
    
    // Mock verification logic based on action type
    const verificationRules = {
      recycling: { baseScore: 0.85, confidenceThreshold: 0.8 },
      energy: { baseScore: 0.90, confidenceThreshold: 0.85 },
      transportation: { baseScore: 0.88, confidenceThreshold: 0.82 },
      community: { baseScore: 0.92, confidenceThreshold: 0.87 }
    };
    
    const rule = verificationRules[request.actionType as keyof typeof verificationRules] || 
                  { baseScore: 0.80, confidenceThreshold: 0.75 };
    
    const aiScore = rule.baseScore + (Math.random() * 0.15 - 0.075); // ±7.5% variance
    const confidence = Math.min(0.99, aiScore + (Math.random() * 0.1));
    const verified = aiScore >= rule.confidenceThreshold;
    
    let reason = '';
    if (verified) {
      reason = 'Action verified through image analysis and pattern recognition';
    } else {
      reason = 'Insufficient evidence or unclear proof in submitted materials';
    }
    
    console.log(`Mock AI verification for ${request.actionId}: ${verified ? 'VERIFIED' : 'REJECTED'} (confidence: ${confidence.toFixed(3)})`);
    
    return {
      verified,
      confidence: Math.round(confidence * 100) / 100,
      reason,
      aiScore: Math.round(aiScore * 100) / 100
    };
  }

  getServiceStatus() {
    return {
      status: 'Active',
      queueSize: this.queueSize,
      successRate: this.successRate,
      avgProcessing: '2.3s'
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Mock health check - replace with real endpoint
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const aiVerificationService = new AIVerificationService();
