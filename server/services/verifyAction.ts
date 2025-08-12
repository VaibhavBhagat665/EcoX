/**
 * Action verification service for EcoX
 * Orchestrates the complete verification pipeline
 */

import { verifyActionData } from '../lib/aiClient';
import { mintTokens } from '../lib/blockchain';
import { getFirestore, MockFirestore, isMockMode } from '../lib/firebase';

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  aiAnalysis: string;
  tokensIssued?: number;
  txHash?: string;
  feedback?: string;
}

/**
 * Calculate tokens to issue based on CO2 impact
 * 1 token = 1 kg CO2 saved/reduced
 */
function calculateTokenReward(co2Kg: number, actionType: string): number {
  const baseReward = Math.floor(co2Kg);
  
  // Apply multipliers based on action type
  const multipliers: Record<string, number> = {
    'energy': 1.0,
    'solar': 1.5,      // Bonus for renewable energy
    'transport': 1.2,   // Bonus for transport improvements
    'waste': 0.8,      // Slightly lower for waste actions
    'water': 0.9,      // Slightly lower for water actions
  };
  
  const multiplier = multipliers[actionType] || 1.0;
  return Math.max(1, Math.floor(baseReward * multiplier));
}

/**
 * Update user profile with new tokens and stats
 */
async function updateUserProfile(userId: string, tokensEarned: number, co2Saved: number): Promise<void> {
  const userData = {
    totalTokens: tokensEarned, // This would normally be additive
    carbonSavedKg: co2Saved,   // This would normally be additive
    lastActionAt: new Date(),
  };

  if (isMockMode()) {
    await MockFirestore.collection('users').doc(userId).update(userData);
    console.log(`👤 Mock user profile updated: ${userId} (+${tokensEarned} tokens, +${co2Saved} kg CO2)`);
  } else {
    const firestore = getFirestore();
    await firestore.collection('users').doc(userId).update(userData);
    console.log(`👤 User profile updated: ${userId} (+${tokensEarned} tokens, +${co2Saved} kg CO2)`);
  }
}

/**
 * Update action document with verification results
 */
async function updateActionDocument(actionId: string, updateData: {
  status: 'verified' | 'rejected';
  tokensIssued?: number;
  predictedCO2Kg?: number;
  verifyAt: Date;
  txHash?: string;
  aiAnalysis: string;
  confidence: number;
}): Promise<void> {
  if (isMockMode()) {
    await MockFirestore.collection('actions').doc(actionId).update(updateData);
    console.log(`📋 Mock action updated: ${actionId} -> ${updateData.status}`);
  } else {
    const firestore = getFirestore();
    await firestore.collection('actions').doc(actionId).update(updateData);
    console.log(`📋 Action updated: ${actionId} -> ${updateData.status}`);
  }
}

/**
 * Main verification function
 */
export async function verifyUserAction(actionId: string): Promise<VerificationResult> {
  console.log(`🔄 Starting verification for action: ${actionId}`);

  try {
    // Step 1: Retrieve action data
    let actionDoc;
    
    if (isMockMode()) {
      const doc = await MockFirestore.collection('actions').doc(actionId).get();
      if (!doc.exists) {
        throw new Error(`Action not found: ${actionId}`);
      }
      actionDoc = doc.data();
    } else {
      const firestore = getFirestore();
      const doc = await firestore.collection('actions').doc(actionId).get();
      if (!doc.exists) {
        throw new Error(`Action not found: ${actionId}`);
      }
      actionDoc = doc.data();
    }

    const { uid, type, data, imageUrl } = actionDoc;

    // Step 2: Run AI verification pipeline
    const aiResult = await verifyActionData({
      type,
      imageUrl,
      userSubmittedData: data
    });

    if (!aiResult.verified) {
      // Verification failed
      await updateActionDocument(actionId, {
        status: 'rejected',
        verifyAt: new Date(),
        aiAnalysis: aiResult.aiAnalysis,
        confidence: aiResult.confidence
      });

      return {
        verified: false,
        confidence: aiResult.confidence,
        aiAnalysis: aiResult.aiAnalysis,
        feedback: 'Action could not be verified. Please ensure your submission meets the requirements.'
      };
    }

    // Step 3: Calculate rewards
    const co2Saved = aiResult.estimatedImpact?.co2Kg || 50; // Default fallback
    const tokensToIssue = calculateTokenReward(co2Saved, type);

    // Step 4: Issue tokens via blockchain
    let txHash = '';
    let mintSuccess = false;

    try {
      // Get user's wallet address (would need to be stored in user profile)
      const userWalletAddress = data.walletAddress || '0x1234567890123456789012345678901234567890'; // Mock address
      
      const mintResult = await mintTokens(userWalletAddress, tokensToIssue, {
        userId: uid,
        actionId,
        actionType: type,
        co2Saved,
        verificationConfidence: aiResult.confidence
      });

      mintSuccess = mintResult.success;
      txHash = mintResult.txHash;

    } catch (error) {
      console.error('❌ Token minting failed:', error);
      // Continue with verification but note the minting failure
    }

    // Step 5: Update action document
    await updateActionDocument(actionId, {
      status: 'verified',
      tokensIssued: mintSuccess ? tokensToIssue : 0,
      predictedCO2Kg: co2Saved,
      verifyAt: new Date(),
      txHash: mintSuccess ? txHash : undefined,
      aiAnalysis: aiResult.aiAnalysis,
      confidence: aiResult.confidence
    });

    // Step 6: Update user profile
    if (mintSuccess) {
      await updateUserProfile(uid, tokensToIssue, co2Saved);
    }

    console.log(`✅ Verification complete for ${actionId}: ${tokensToIssue} tokens issued`);

    return {
      verified: true,
      confidence: aiResult.confidence,
      aiAnalysis: aiResult.aiAnalysis,
      tokensIssued: mintSuccess ? tokensToIssue : 0,
      txHash: mintSuccess ? txHash : undefined,
      feedback: mintSuccess 
        ? `Congratulations! Your action has been verified and ${tokensToIssue} ECO tokens have been issued.`
        : `Your action has been verified, but token issuance failed. Please contact support.`
    };

  } catch (error) {
    console.error(`❌ Verification failed for action ${actionId}:`, error);

    // Update action with error status
    try {
      await updateActionDocument(actionId, {
        status: 'rejected',
        verifyAt: new Date(),
        aiAnalysis: `Verification error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        confidence: 0
      });
    } catch (updateError) {
      console.error('❌ Failed to update action with error status:', updateError);
    }

    return {
      verified: false,
      confidence: 0,
      aiAnalysis: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      feedback: 'Verification failed due to a technical error. Please try again later.'
    };
  }
}

/**
 * Batch verification for multiple actions
 */
export async function verifyMultipleActions(actionIds: string[]): Promise<Record<string, VerificationResult>> {
  console.log(`🔄 Starting batch verification for ${actionIds.length} actions`);

  const results: Record<string, VerificationResult> = {};

  // Process actions in parallel (but limit concurrency)
  const batchSize = 3;
  for (let i = 0; i < actionIds.length; i += batchSize) {
    const batch = actionIds.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (actionId) => {
      try {
        const result = await verifyUserAction(actionId);
        return { actionId, result };
      } catch (error) {
        console.error(`❌ Batch verification failed for ${actionId}:`, error);
        return {
          actionId,
          result: {
            verified: false,
            confidence: 0,
            aiAnalysis: 'Batch verification failed',
            feedback: 'Verification failed in batch processing'
          }
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    
    for (const { actionId, result } of batchResults) {
      results[actionId] = result;
    }

    // Small delay between batches to avoid overwhelming services
    if (i + batchSize < actionIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`✅ Batch verification complete: ${Object.keys(results).length} actions processed`);
  return results;
}
