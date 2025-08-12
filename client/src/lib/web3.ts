/**
 * Web3 utilities for EcoX frontend
 * Handles wallet connections and blockchain interactions
 */

import { ethers } from 'ethers';
import { getTokenBalance } from './api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Environment configuration
const BLOCKCHAIN_RPC_URL = import.meta.env.VITE_BLOCKCHAIN_RPC_URL || 'https://eth-mainnet.alchemyapi.io/v2/demo';
const CONTRACT_ADDRESS = import.meta.env.VITE_ECO_TOKEN_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';

// ERC-20 ABI for token balance reading
const ERC20_ABI = [
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function decimals() external view returns (uint8)',
  'function totalSupply() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
];

/**
 * Read token balance directly from blockchain
 */
export async function readTokenBalance(address: string): Promise<string> {
  try {
    // Try API first (faster and handles caching)
    const apiResult = await getTokenBalance(address);
    if (apiResult?.balance) {
      return apiResult.balance;
    }
  } catch (error) {
    console.warn('API balance call failed, falling back to direct RPC:', error);
  }

  try {
    // Fallback to direct RPC call
    const provider = new ethers.JsonRpcProvider(BLOCKCHAIN_RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ERC20_ABI, provider);
    
    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();
    
    return ethers.formatUnits(balance, decimals);
  } catch (error) {
    console.error('Direct RPC balance call failed:', error);
    return '0';
  }
}

/**
 * Connect to MetaMask
 */
export async function connectMetaMask(): Promise<string | null> {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    if (accounts.length > 0) {
      return accounts[0];
    }
    
    return null;
  } catch (error) {
    console.error('Failed to connect to MetaMask:', error);
    throw error;
  }
}

/**
 * Get connected accounts
 */
export async function getConnectedAccounts(): Promise<string[]> {
  if (!window.ethereum) {
    return [];
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    return accounts || [];
  } catch (error) {
    console.error('Failed to get connected accounts:', error);
    return [];
  }
}

/**
 * Check if MetaMask is available
 */
export function isMetaMaskAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.ethereum;
}

/**
 * Listen for account changes
 */
export function onAccountsChanged(callback: (accounts: string[]) => void): () => void {
  if (!window.ethereum) {
    return () => {};
  }

  window.ethereum.on('accountsChanged', callback);
  
  return () => {
    window.ethereum.removeListener('accountsChanged', callback);
  };
}

/**
 * Listen for chain changes
 */
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!window.ethereum) {
    return () => {};
  }

  window.ethereum.on('chainChanged', callback);
  
  return () => {
    window.ethereum.removeListener('chainChanged', callback);
  };
}

/**
 * Get current chain ID
 */
export async function getCurrentChainId(): Promise<string | null> {
  if (!window.ethereum) {
    return null;
  }

  try {
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch (error) {
    console.error('Failed to get chain ID:', error);
    return null;
  }
}

/**
 * Switch to a specific chain
 */
export async function switchChain(chainId: string): Promise<void> {
  if (!window.ethereum) {
    throw new Error('MetaMask not available');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    console.error('Failed to switch chain:', error);
    throw error;
  }
}

/**
 * Format address for display
 */
export function formatAddress(address: string, length = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`;
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}
