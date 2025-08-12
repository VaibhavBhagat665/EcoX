# Firestore Schema Documentation

This document outlines the Firestore database schema for the EcoX application.

## Collections Overview

The EcoX application uses the following Firestore collections:

- `users/{uid}` - User profiles and account data
- `actions/{actionId}` - Environmental actions submitted by users
- `transactions/{txId}` - Token transactions (mint/burn operations)
- `leaderboard/{regionOrGlobal}` - Leaderboard data for different periods

## Collection Schemas

### users/{uid}

Stores user profile information and account statistics.

```typescript
interface User {
  uid: string;                    // Firebase user ID (document ID)
  name: string;                   // Display name
  email: string;                  // Email address
  photoURL: string;               // Profile photo URL
  walletAddress: string | null;   // Connected Web3 wallet address
  totalTokens: number;            // Total ECO tokens earned
  carbonSavedKg: number;          // Total carbon saved in kg
  joinedAt: Timestamp;            // Account creation date
  lastActionAt?: Timestamp;       // Last action submission date
  preferences?: {                 // User preferences
    notifications: boolean;
    publicProfile: boolean;
    language: string;
  };
  stats?: {                       // Additional statistics
    actionsSubmitted: number;
    actionsVerified: number;
    streakDays: number;
  };
}
```

**Example Document:**
```json
{
  "uid": "abc123def456",
  "name": "Alice Green",
  "email": "alice@example.com",
  "photoURL": "https://example.com/photo.jpg",
  "walletAddress": "0x1234567890123456789012345678901234567890",
  "totalTokens": 247,
  "carbonSavedKg": 156.7,
  "joinedAt": "2024-01-15T10:30:00Z",
  "lastActionAt": "2024-01-20T14:22:00Z",
  "preferences": {
    "notifications": true,
    "publicProfile": true,
    "language": "en"
  },
  "stats": {
    "actionsSubmitted": 12,
    "actionsVerified": 10,
    "streakDays": 7
  }
}
```

### actions/{actionId}

Stores environmental actions submitted by users for verification.

```typescript
interface Action {
  id: string;                     // Action ID (document ID)
  uid: string;                    // User ID who submitted the action
  type: 'lighting' | 'transport' | 'purchase' | 'tree_planting' | 'energy' | 'solar' | 'waste' | 'water';
  data: Record<string, any>;      // Raw submission payload
  imageUrl?: string;              // Optional supporting image
  status: 'pending' | 'verified' | 'rejected';
  tokensIssued: number;           // Tokens awarded (0 if not verified)
  predictedCO2Kg: number;         // Estimated CO2 impact in kg
  submitAt: Timestamp;            // Submission timestamp
  verifyAt: Timestamp | null;     // Verification timestamp
  txHash: string | null;          // Blockchain transaction hash
  aiAnalysis?: string;            // AI verification analysis
  confidence?: number;            // Verification confidence (0-1)
  metadata?: Record<string, any>; // Additional metadata
}
```

**Example Document:**
```json
{
  "id": "action_1642678900_xyz789",
  "uid": "abc123def456",
  "type": "energy",
  "data": {
    "kWh": 450,
    "billAmount": 89.50,
    "description": "Monthly electricity bill - LED upgrade completed"
  },
  "imageUrl": "https://storage.example.com/bills/bill_image.jpg",
  "status": "verified",
  "tokensIssued": 15,
  "predictedCO2Kg": 187.2,
  "submitAt": "2024-01-20T14:15:00Z",
  "verifyAt": "2024-01-20T14:25:00Z",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef12",
  "aiAnalysis": "Verification successful: Data consistency confirmed (5.2% variance)",
  "confidence": 0.92,
  "metadata": {
    "verificationMethod": "OCR + AI",
    "source": "mobile_app"
  }
}
```

### transactions/{txId}

Stores blockchain token transactions for audit and history tracking.

```typescript
interface Transaction {
  txId: string;                   // Transaction ID (document ID)
  uid: string;                    // User ID
  type: 'mint' | 'burn';          // Transaction type
  amount: number;                 // Token amount
  tokenSymbol: string;            // Token symbol (ECO)
  txHash: string;                 // Blockchain transaction hash
  createdAt: Timestamp;           // Transaction timestamp
  metadata: {                     // Transaction context
    actionId?: string;            // Related action ID (for mints)
    reason?: string;              // Transaction reason
    verificationConfidence?: number;
    [key: string]: any;
  };
  status?: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;           // Block number (for confirmed transactions)
  gasUsed?: number;              // Gas used for transaction
}
```

**Example Document:**
```json
{
  "txId": "mint_1642678950_abc123",
  "uid": "abc123def456",
  "type": "mint",
  "amount": 15,
  "tokenSymbol": "ECO",
  "txHash": "0xabcdef1234567890abcdef1234567890abcdef12",
  "createdAt": "2024-01-20T14:25:00Z",
  "metadata": {
    "actionId": "action_1642678900_xyz789",
    "reason": "Energy efficiency action verified",
    "verificationConfidence": 0.92,
    "co2Saved": 187.2
  },
  "status": "confirmed",
  "blockNumber": 12345678,
  "gasUsed": 45000
}
```

### leaderboard/{regionOrGlobal}

Stores aggregated leaderboard data for different time periods and regions.

```typescript
interface Leaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  region?: string;                // Optional region filter
  lastUpdated: Timestamp;         // Last calculation timestamp
  entries: LeaderboardEntry[];    // Ranked entries
}

interface LeaderboardEntry {
  uid: string;                    // User ID
  name: string;                   // Display name
  photoURL?: string;              // Profile photo
  score: number;                  // Calculated score
  tokens: number;                 // Total tokens
  carbonSaved: number;            // Total carbon saved (kg)
  rank: number;                   // Current rank
  change?: number;                // Rank change from previous period
}
```

**Example Document:**
```json
{
  "period": "monthly",
  "region": "global", 
  "lastUpdated": "2024-01-20T00:00:00Z",
  "entries": [
    {
      "uid": "abc123def456",
      "name": "Alice Green",
      "photoURL": "https://example.com/alice.jpg",
      "score": 342,
      "tokens": 1240,
      "carbonSaved": 890.5,
      "rank": 1,
      "change": 2
    },
    {
      "uid": "def456ghi789",
      "name": "Bob Earth",
      "photoURL": "https://example.com/bob.jpg",
      "score": 298,
      "tokens": 987,
      "carbonSaved": 654.2,
      "rank": 2,
      "change": -1
    }
  ]
}
```

## Indexes

### Required Firestore Indexes

1. **actions collection:**
   - `uid` (ascending) + `submitAt` (descending)
   - `status` (ascending) + `submitAt` (descending)
   - `type` (ascending) + `status` (ascending)

2. **transactions collection:**
   - `uid` (ascending) + `createdAt` (descending)
   - `type` (ascending) + `createdAt` (descending)

3. **users collection:**
   - `totalTokens` (descending) - for leaderboards
   - `carbonSavedKg` (descending) - for environmental impact rankings

## Security Rules

Basic security rules are defined in `firestore.rules`. Key principles:

- Users can read/write their own documents
- Public read access for leaderboards
- Server-side verification for sensitive operations
- Admin access for system operations

## Data Consistency

- Use Firestore transactions for critical operations
- Implement eventual consistency patterns for leaderboards
- Validate data on both client and server sides
- Use cloud functions for complex data transformations

## Backup and Monitoring

- Enable automatic backups for all collections
- Monitor collection sizes and query performance
- Set up alerts for unusual activity patterns
- Regular data validation and cleanup procedures
