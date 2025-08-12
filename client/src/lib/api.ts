/**
 * Central API utility for EcoX frontend
 * All backend communication goes through this module
 */

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface ApiOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Configure fetch wrapper that prepends API base URL and handles auth
 */
export async function fetchJSON(path: string, options: ApiOptions = {}): Promise<any> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  const url = `${API_BASE_URL}${path}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Add Firebase ID token if auth required and available
  if (requireAuth) {
    const token = localStorage.getItem('firebaseIdToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error ${response.status}: ${error}`);
  }

  return response.json();
}

/**
 * User Profile API
 * Route: GET /api/profile
 */
export async function getProfile(): Promise<any> {
  return fetchJSON('/api/profile');
}

/**
 * Submit user action for verification
 * Route: POST /api/actions/submit
 */
export async function submitAction(payload: {
  type: string;
  data: any;
  imageUrl?: string;
}): Promise<any> {
  return fetchJSON('/api/actions/submit', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get leaderboard data
 * Route: GET /api/leaderboard
 */
export async function getLeaderboard(): Promise<any> {
  return fetchJSON('/api/leaderboard');
}

/**
 * Get token balance for address
 * Route: GET /api/tokens/balance?address=...
 */
export async function getTokenBalance(address: string): Promise<any> {
  return fetchJSON(`/api/tokens/balance?address=${encodeURIComponent(address)}`);
}

/**
 * Get transaction history for user
 * Route: GET /api/transactions/:userId
 */
export async function getTransactions(userId: string): Promise<any> {
  return fetchJSON(`/api/transactions/${encodeURIComponent(userId)}`);
}

/**
 * Chat with AI assistant
 * Route: POST /api/chat
 */
export async function chatWithAssistant(userId: string, message: string): Promise<any> {
  return fetchJSON('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ userId, message }),
  });
}

/**
 * Mint tokens (test mode only)
 * Route: POST /api/tokens/mint
 */
export async function mintTokens(address: string, amount: number, metadata?: any): Promise<any> {
  return fetchJSON('/api/tokens/mint', {
    method: 'POST',
    body: JSON.stringify({ address, amount, metadata }),
  });
}

/**
 * Burn tokens
 * Route: POST /api/tokens/burn
 */
export async function burnTokens(address: string, amount: number): Promise<any> {
  return fetchJSON('/api/tokens/burn', {
    method: 'POST',
    body: JSON.stringify({ address, amount }),
  });
}

/**
 * Verify action (internal)
 * Route: POST /api/actions/verify
 */
export async function verifyAction(actionId: string): Promise<any> {
  return fetchJSON('/api/actions/verify', {
    method: 'POST',
    body: JSON.stringify({ actionId }),
  });
}

// Auth helper functions
export function setAuthToken(token: string): void {
  localStorage.setItem('firebaseIdToken', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('firebaseIdToken');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('firebaseIdToken');
}
