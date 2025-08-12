/**
 * Blockchain helper module for EcoX backend
 * Handles token minting, burning, and balance queries with mock fallback
 */

import { ethers } from 'ethers';
import { getFirestore, MockFirestore, isMockMode } from './firebase';

// Environment configuration
const BLOCKCHAIN_RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo';
const ECO_TOKEN_CONTRACT_ADDRESS = process.env.ECO_TOKEN_CONTRACT_ADDRESS || '__SET_IN_REPLIT_SECRETS__';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '__SET_IN_REPLIT_SECRETS__';
const GAS_LIMIT = parseInt(process.env.GAS_LIMIT || '100000');
const GAS_PRICE_GWEI = parseInt(process.env.GAS_PRICE_GWEI || '30');

const MOCK_BLOCKCHAIN_SERVICE = process.env.MOCK_BLOCKCHAIN_SERVICE === 'true' ||
                                ECO_TOKEN_CONTRACT_ADDRESS === '__SET_IN_REPLIT_SECRETS__' ||
                                PRIVATE_KEY === '__SET_IN_REPLIT_SECRETS__' ||
                                !PRIVATE_KEY || !ECO_TOKEN_CONTRACT_ADDRESS;

// ERC-20 ABI for token operations
const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)',
  'function mint(address to, uint256 amount) external',
  'function burn(address from, uint256 amount) external',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Mint(address indexed to, uint256 amount)',
  'event Burn(address indexed from, uint256 amount)'
];

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

/**
 * Initialize blockchain connection
 */
export function initializeBlockchain(): void {
  if (MOCK_BLOCKCHAIN_SERVICE) {
    console.log('🔄 WARNING: BACKEND RUNNING IN MOCK BLOCKCHAIN MODE — NO REAL TRANSACTIONS WILL BE SENT');
    return;
  }

  try {
    provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    contract = new ethers.Contract(ECO_TOKEN_CONTRACT_ADDRESS, ERC20_ABI, wallet);

    console.log('✅ Blockchain service initialized successfully');
    console.log(`📝 Contract Address: ${ECO_TOKEN_CONTRACT_ADDRESS}`);
    console.log(`👛 Wallet Address: ${wallet.address}`);
  } catch (error) {
    console.error('❌ Failed to initialize blockchain service:', error);
    console.log('🔄 Falling back to mock mode');
  }
}

/**
 * Generate mock transaction hash
 */
function generateMockTxHash(): string {
  return `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Save transaction to Firestore (real or mock)
 */
async function saveTransaction(txData: {
  txId: string;
  uid: string;
  type: 'mint' | 'burn';
  amount: number;
  tokenSymbol: string;
  txHash: string;
  metadata?: any;
}): Promise<void> {
  const transactionData = {
    ...txData,
    createdAt: new Date(),
  };

  if (isMockMode()) {
    // Use mock Firestore
    await MockFirestore.collection('transactions').doc(txData.txId).set(transactionData);
    console.log(`📝 Mock transaction saved: ${txData.txId}`);
  } else {
    // Use real Firestore
    const firestore = getFirestore();
    await firestore.collection('transactions').doc(txData.txId).set(transactionData);
    console.log(`📝 Transaction saved to Firestore: ${txData.txId}`);
  }
}

/**
 * Mint tokens to an address
 */
export async function mintTokens(
  toAddress: string,
  amount: number,
  metadata?: any
): Promise<{ txHash: string; success: boolean }> {
  const txId = `mint_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (MOCK_BLOCKCHAIN_SERVICE) {
    // Mock mode - simulate transaction
    const mockTxHash = generateMockTxHash();
    
    await saveTransaction({
      txId,
      uid: metadata?.userId || 'unknown',
      type: 'mint',
      amount,
      tokenSymbol: 'ECO',
      txHash: mockTxHash,
      metadata,
    });

    console.log(`🔄 Mock mint: ${amount} ECO to ${toAddress} (${mockTxHash})`);
    return { txHash: mockTxHash, success: true };
  }

  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain service not initialized');
    }

    // Convert amount to token units (assuming 18 decimals)
    const tokenAmount = ethers.parseUnits(amount.toString(), 18);

    // Estimate gas
    const gasEstimate = await contract.mint.estimateGas(toAddress, tokenAmount);
    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

    // Send transaction
    const tx = await contract.mint(toAddress, tokenAmount, {
      gasLimit,
      gasPrice: ethers.parseUnits(GAS_PRICE_GWEI.toString(), 'gwei'),
    });

    console.log(`⏳ Minting ${amount} ECO to ${toAddress}... TX: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      await saveTransaction({
        txId,
        uid: metadata?.userId || 'unknown',
        type: 'mint',
        amount,
        tokenSymbol: 'ECO',
        txHash: tx.hash,
        metadata,
      });

      console.log(`✅ Mint successful: ${amount} ECO to ${toAddress} (${tx.hash})`);
      return { txHash: tx.hash, success: true };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('❌ Mint transaction failed:', error);
    return { txHash: '', success: false };
  }
}

/**
 * Burn tokens from an address
 */
export async function burnTokens(
  fromAddress: string,
  amount: number,
  metadata?: any
): Promise<{ txHash: string; success: boolean }> {
  const txId = `burn_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (MOCK_BLOCKCHAIN_SERVICE) {
    // Mock mode - simulate transaction
    const mockTxHash = generateMockTxHash();
    
    await saveTransaction({
      txId,
      uid: metadata?.userId || 'unknown',
      type: 'burn',
      amount,
      tokenSymbol: 'ECO',
      txHash: mockTxHash,
      metadata,
    });

    console.log(`🔄 Mock burn: ${amount} ECO from ${fromAddress} (${mockTxHash})`);
    return { txHash: mockTxHash, success: true };
  }

  try {
    if (!contract || !wallet) {
      throw new Error('Blockchain service not initialized');
    }

    // Convert amount to token units (assuming 18 decimals)
    const tokenAmount = ethers.parseUnits(amount.toString(), 18);

    // Estimate gas
    const gasEstimate = await contract.burn.estimateGas(fromAddress, tokenAmount);
    const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // Add 20% buffer

    // Send transaction
    const tx = await contract.burn(fromAddress, tokenAmount, {
      gasLimit,
      gasPrice: ethers.parseUnits(GAS_PRICE_GWEI.toString(), 'gwei'),
    });

    console.log(`⏳ Burning ${amount} ECO from ${fromAddress}... TX: ${tx.hash}`);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      await saveTransaction({
        txId,
        uid: metadata?.userId || 'unknown',
        type: 'burn',
        amount,
        tokenSymbol: 'ECO',
        txHash: tx.hash,
        metadata,
      });

      console.log(`✅ Burn successful: ${amount} ECO from ${fromAddress} (${tx.hash})`);
      return { txHash: tx.hash, success: true };
    } else {
      throw new Error('Transaction failed');
    }
  } catch (error) {
    console.error('❌ Burn transaction failed:', error);
    return { txHash: '', success: false };
  }
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(address: string): Promise<string> {
  if (MOCK_BLOCKCHAIN_SERVICE) {
    // Mock mode - return random balance for demo
    const mockBalance = (Math.random() * 1000).toFixed(2);
    console.log(`🔄 Mock balance for ${address}: ${mockBalance} ECO`);
    return mockBalance;
  }

  try {
    if (!contract) {
      throw new Error('Blockchain service not initialized');
    }

    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    const formattedBalance = ethers.formatUnits(balance, decimals);

    console.log(`💰 Balance for ${address}: ${formattedBalance} ECO`);
    return formattedBalance;
  } catch (error) {
    console.error('❌ Failed to get token balance:', error);
    return '0';
  }
}

/**
 * Check if service is in mock mode
 */
export function isBlockchainMockMode(): boolean {
  return MOCK_BLOCKCHAIN_SERVICE;
}

// Initialize blockchain service on module load
initializeBlockchain();
