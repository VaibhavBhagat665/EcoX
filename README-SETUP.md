# EcoX Full-Stack Setup Guide

This guide will help you set up the complete EcoX environmental tracking application with frontend, backend, and blockchain integration.

## 🚀 Quick Start

### Option 1: Replit (Recommended for Demo)

1. **Clone/Import to Replit**
   ```bash
   # The project is already configured for Replit
   # Just click "Run" to start both frontend and backend
   ```

2. **Set Replit Secrets** (Click the lock icon in sidebar)
   ```
   FIREBASE_PROJECT_ID=your-firebase-project-id
   FIREBASE_PRIVATE_KEY=your-firebase-private-key-json
   FIREBASE_CLIENT_EMAIL=your-firebase-client-email
   VITE_FIREBASE_API_KEY=your-frontend-firebase-api-key
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   ECO_TOKEN_CONTRACT_ADDRESS=your-token-contract-address
   BLOCKCHAIN_RPC_URL=your-blockchain-rpc-url
   PRIVATE_KEY=your-ethereum-private-key
   ```

3. **Run the Application**
   ```bash
   # Replit will automatically run: npm run start-dev
   # This starts both frontend (port 3000) and backend (port 5000)
   ```

### Option 2: Local Development

1. **Prerequisites**
   ```bash
   node >= 18.0.0
   npm >= 8.0.0
   docker (optional)
   ```

2. **Install Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env and fill in your actual values
   # Replace __SET_IN_REPLIT_SECRETS__ with real values
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run start-dev
   
   # Or start individually
   npm run start-frontend  # Frontend only (port 3000)
   npm run start-backend   # Backend only (port 5000)
   ```

### Option 3: Docker Development

1. **Start with Docker Compose**
   ```bash
   # Full stack with blockchain
   npm run docker:dev
   
   # Minimal stack (no blockchain)
   npm run docker:dev-minimal
   ```

2. **Seed Database**
   ```bash
   # Seed Firestore with sample data
   npm run seed:firestore
   ```

## 🔧 Configuration

### Required Replit Secrets

Set these in Replit Secrets (lock icon) for production:

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase admin private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase admin client email | Yes |
| `VITE_FIREBASE_API_KEY` | Frontend Firebase API key | Yes |
| `VITE_FIREBASE_PROJECT_ID` | Frontend Firebase project ID | Yes |
| `ECO_TOKEN_CONTRACT_ADDRESS` | ERC-20 token contract address | Yes |
| `BLOCKCHAIN_RPC_URL` | Ethereum RPC endpoint | Yes |
| `PRIVATE_KEY` | Ethereum private key for backend | Yes |
| `AI_SERVICE_URL` | AI verification service URL | Optional |
| `AI_SERVICE_API_KEY` | AI service API key | Optional |

### Mock Mode (Development)

The application runs in mock mode by default when secrets are not configured:

- `MOCK_FIREBASE_SERVICE=true` - Uses in-memory Firestore simulation
- `MOCK_BLOCKCHAIN_SERVICE=true` - Simulates token transactions
- `MOCK_AI_SERVICE=true` - Uses predetermined AI responses

## 📡 API Endpoints

### Frontend (Port 3000)
- `http://localhost:3000` - React application
- Built with Vite, TypeScript, Tailwind CSS

### Backend (Port 5000)
- `http://localhost:5000/api/profile` - User profile
- `http://localhost:5000/api/actions/submit` - Submit environmental action
- `http://localhost:5000/api/actions/verify` - Verify action
- `http://localhost:5000/api/leaderboard` - Leaderboard data
- `http://localhost:5000/api/tokens/balance` - Token balance
- `http://localhost:5000/api/tokens/mint` - Mint tokens (test)
- `http://localhost:5000/api/transactions/:userId` - Transaction history
- `http://localhost:5000/api/chat` - AI chat assistant

## 🧪 Testing the Application

### Manual Test Cases

1. **User Authentication & Profile**
   ```bash
   # Test: Login with Google → see profile populated
   # Expected: User profile loads with Firebase data
   # Mock mode: Returns sample user data
   ```

2. **Environmental Action Submission**
   ```bash
   # Test: Submit a sample action (upload a bill image)
   # Expected: Action marked as "pending" → verify → tokens credited
   # Mock mode: Uses simulated AI verification and blockchain
   ```

3. **Wallet Integration**
   ```bash
   # Test: Connect MetaMask → see ECO token balance update
   # Expected: Real-time balance display, mint test tokens
   # Mock mode: Shows simulated balance
   ```

### Automated Testing
```bash
# Run frontend tests
npm run test:frontend

# Run backend tests  
npm run test:backend

# Run all tests
npm run test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill processes on ports 3000/5000
   pkill -f "port 3000"
   pkill -f "port 5000"
   ```

2. **Firebase Authentication Errors**
   ```bash
   # Check Firebase console for project configuration
   # Verify FIREBASE_PRIVATE_KEY is properly formatted JSON
   # Ensure service account has proper permissions
   ```

3. **Blockchain Connection Failed**
   ```bash
   # Verify BLOCKCHAIN_RPC_URL is accessible
   # Check PRIVATE_KEY format (64 character hex without 0x)
   # Ensure contract address is valid
   ```

4. **Module Not Found Errors**
   ```bash
   # Reinstall dependencies
   npm run install:all
   
   # Clear cache
   rm -rf node_modules client/node_modules server/node_modules
   npm run install:all
   ```

### Development Commands

```bash
# Restart development servers
npm run start-dev

# Check TypeScript compilation
npm run check

# Seed sample data
npm run seed:firestore

# Clear sample data
npm run clear:firestore

# View Docker logs
npm run docker:logs

# Clean Docker containers
npm run docker:clean
```

## 🔒 Security Notes

- Never commit real secrets to git
- Use Replit Secrets for production deployment
- Firebase private keys should be base64 encoded in environment
- Ethereum private keys should never be logged or exposed
- Enable Firestore security rules in production

## 📚 Architecture

```
EcoX/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/          # API & Web3 utilities
│   │   └── hooks/        # React hooks
├── server/                # Node.js backend  
│   ├── lib/              # Core services
│   ├── middleware/       # Auth & CORS
│   ├── services/         # Business logic
│   └── scripts/          # Database seeding
├── docs/                 # Documentation
└── docker-compose.dev.yml # Development environment
```

## 🚢 Deployment

### Replit Deployment
- Configure secrets in Replit
- Push to main branch
- Application auto-deploys

### Manual Deployment
```bash
# Build for production
npm run build:all

# Deploy frontend to CDN
# Deploy backend to cloud service
# Configure environment variables
```

---

## 📞 Support

If you encounter issues:

1. Check this README for common solutions
2. Review the console logs for specific errors
3. Verify all required secrets are configured
4. Test in mock mode first before using real services

For additional help, check the inline code comments and documentation in the `docs/` folder.
