# EcoX Backend - Node.js Express API Server

A complete Node.js Express backend for the EcoX sustainability platform featuring Firebase authentication, blockchain integration, AI verification services, and comprehensive admin APIs.

## 🚀 Features

- **Firebase Authentication**: Google OAuth integration with JWT token verification
- **REST APIs**: Complete user management, green action submission, and EcoToken operations
- **Blockchain Integration**: Ethereum/Polygon smart contract integration using ethers.js
- **AI Verification**: External Python microservice integration for green action verification
- **Admin Dashboard**: Comprehensive analytics and system monitoring APIs
- **PostgreSQL Database**: Robust data persistence with Drizzle ORM
- **Real-time Monitoring**: System status and performance tracking
- **Docker Support**: Containerized deployment with Docker

## 🏗️ Architecture

```
├── server/
│   ├── index.ts              # Express server entry point
│   ├── routes.ts             # API route definitions
│   ├── storage.ts            # Database abstraction layer
│   ├── vite.ts               # Vite integration for frontend
│   ├── middleware/
│   │   └── auth.ts           # Authentication middleware
│   └── services/
│       ├── firebase.ts       # Firebase Admin SDK integration
│       ├── blockchain.ts     # Ethereum blockchain service
│       └── ai-verification.ts # AI microservice client
├── shared/
│   └── schema.ts             # Database schema and types
└── docs/
    ├── api.md                # API documentation
    └── deployment.md         # Deployment guide
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Firebase project with Authentication enabled
- Python AI verification service (optional - has mock implementation)

## ⚡ Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ecox

# Firebase Admin SDK (for backend authentication)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# Blockchain Configuration
ECO_TOKEN_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY=your_ethereum_private_key_for_contract_operations

# AI Verification Service
AI_SERVICE_URL=http://localhost:8001
AI_SERVICE_API_KEY=your_ai_service_api_key

# Server Configuration
NODE_ENV=development
PORT=5000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

```bash
# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 🐳 Docker Deployment

### Build and Run with Docker

```bash
# Build the Docker image
docker build -t ecox-backend .

# Run the container
docker run -d \
  --name ecox-backend \
  -p 5000:5000 \
  --env-file .env \
  ecox-backend
```

### Docker Compose (with PostgreSQL)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f ecox-backend

# Stop services
docker-compose down
```

## 📚 API Documentation

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:

```bash
Authorization: Bearer <firebase_id_token>
```

### Core Endpoints

#### User Management
- `POST /api/auth/register` - Register new user
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - List all users (admin only)
- `GET /api/users/stats` - User statistics (admin only)

#### Green Actions
- `POST /api/green-actions` - Submit new green action
- `GET /api/green-actions` - List all actions (admin only)
- `GET /api/green-actions/recent` - Get recent actions with user data
- `GET /api/green-actions/user/:userId` - Get user's actions
- `GET /api/green-actions/stats` - Action statistics

#### EcoTokens
- `GET /api/tokens/stats` - Token statistics (admin only)
- `GET /api/tokens/user/:userId` - User's token transactions

#### Admin Dashboard
- `GET /api/admin/dashboard/stats` - Complete dashboard statistics
- `GET /api/status/firebase` - Firebase service status
- `GET /api/status/blockchain` - Blockchain network status
- `GET /api/status/ai` - AI verification service status

### Example API Calls

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firebaseUid": "firebase_user_id",
    "email": "user@example.com", 
    "name": "John Doe"
  }'

# Submit a green action
curl -X POST http://localhost:5000/api/green-actions \
  -H "Authorization: Bearer <firebase_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Recycled 5kg plastic",
    "description": "Sorted and recycled household plastic waste",
    "category": "recycling",
    "tokensEarned": "25.00000000",
    "proofImages": ["image_url_1", "image_url_2"]
  }'

# Get dashboard stats (admin only)
curl -H "Authorization: Bearer <admin_firebase_token>" \
  http://localhost:5000/api/admin/dashboard/stats
```

## 🔗 Service Integration

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication and add Google as a sign-in provider
3. Generate a service account key for the Firebase Admin SDK
4. Add your domain to the authorized domains list

### Blockchain Integration

The backend integrates with Ethereum/Polygon networks for EcoToken operations:

```typescript
// Example: Mint tokens after action verification
const result = await blockchainService.mintTokens(userAddress, amount);
if (result.success) {
  // Update database with transaction hash
  await storage.updateTokenTransaction(transactionId, {
    status: 'confirmed',
    blockchainTxHash: result.txHash
  });
}
```

### AI Verification Service

The backend communicates with a Python AI microservice for green action verification:

```typescript
// Verify submitted action
const verificationResult = await aiVerificationService.verifyGreenAction({
  actionId: action.id,
  actionType: action.category,
  description: action.description,
  proofImages: action.proofImages
});
```

## 📊 Database Schema

The application uses PostgreSQL with the following key tables:

- **users**: User profiles and token balances
- **green_actions**: Submitted environmental actions
- **eco_token_transactions**: Token mint/burn/transfer records
- **admin_users**: Administrative user accounts

## 🔧 Development

### Running Tests

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Watch mode
npm run test:watch
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

### Database Operations

```bash
# Generate migration
npm run db:generate

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset
```

## 🚀 Production Deployment

### Preparation

1. Set `NODE_ENV=production` in environment variables
2. Configure production database connection
3. Set up Firebase project for production domain
4. Deploy smart contracts and update contract addresses
5. Configure AI verification service endpoints

### Deployment Options

#### Option 1: Traditional VPS/Server
```bash
# Build the application
npm run build

# Start production server
npm start
```

#### Option 2: Docker Container
```bash
# Build and deploy with Docker
docker build -t ecox-backend .
docker run -d -p 5000:5000 --env-file .env.production ecox-backend
```

#### Option 3: Cloud Platforms
- **Heroku**: Deploy directly from Git repository
- **AWS ECS**: Use provided Dockerfile
- **Google Cloud Run**: Container-based deployment
- **Railway**: Automatic deployment from GitHub

### Environment Variables for Production

```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod-user:password@prod-host:5432/ecox_prod
FIREBASE_PROJECT_ID=your-prod-project
# ... other production configurations
```

## 🔐 Security Considerations

- Firebase ID tokens are verified on every protected request
- Admin routes require additional authorization checks
- Database queries use prepared statements via Drizzle ORM
- Environment variables store sensitive credentials
- CORS configuration restricts origins in production

## 📈 Monitoring & Logging

The backend provides comprehensive monitoring through:

- System status endpoints for Firebase, blockchain, and AI services
- Performance metrics collection
- Error logging and alerting
- Database query monitoring

## 🛠️ Troubleshooting

### Common Issues

1. **Firebase Authentication Errors**
   - Verify service account credentials
   - Check Firebase project configuration
   - Ensure authorized domains are set correctly

2. **Database Connection Issues**
   - Validate DATABASE_URL format
   - Check PostgreSQL server status
   - Verify user permissions

3. **Blockchain Integration Problems**
   - Confirm RPC endpoint accessibility
   - Validate contract address and ABI
   - Check account balance for gas fees

4. **AI Service Communication**
   - Verify AI service endpoint URL
   - Check API key configuration
   - Monitor service health status

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📞 Support

For questions and support:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review API examples and integration guides