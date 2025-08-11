# replit.md

## Overview

EcoX is a complete Node.js Express backend API server for a sustainability platform that gamifies environmental actions through blockchain-based token rewards. The backend handles user authentication via Firebase, green action verification through AI services, EcoToken management via Ethereum/Polygon blockchain, and comprehensive admin dashboard APIs. The system is production-ready with Docker containerization, detailed API documentation, and deployment guides.

## User Preferences

Preferred communication style: Simple, everyday language.
Focus: Backend development only - frontend already exists and should not be modified.

## System Architecture

### Frontend Architecture (Existing - Not Modified)
- **Framework**: React with TypeScript using Vite for bundling and development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for client-side routing with simple path-based navigation
- **Authentication**: Firebase Authentication with Google OAuth integration

### Backend Architecture (Complete Implementation)
- **Runtime**: Node.js 20+ with Express.js framework
- **Language**: TypeScript with ES modules and strict type checking
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Firebase Admin SDK with JWT token verification middleware
- **API Design**: RESTful API with comprehensive route handlers and error handling
- **Services**: Modular service architecture for Firebase, blockchain, and AI integration
- **Storage**: Abstracted storage interface with in-memory development and PostgreSQL production
- **Containerization**: Docker support with multi-stage builds and health checks

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Key Entities**: 
  - Users with Firebase UID integration
  - Green actions with verification status tracking
  - EcoToken transactions with blockchain references
  - Admin users with role-based permissions

### Authentication & Authorization (Complete)
- **User Authentication**: Firebase Admin SDK with automatic token verification
- **Admin Access**: Separate admin user table with role-based permissions (admin/super_admin)
- **API Security**: Bearer token middleware with user/admin route protection
- **Mock Support**: Development mode with mock authentication for testing
- **Error Handling**: Comprehensive auth error responses and user management

### AI Integration (Complete Service)
- **Verification Service**: Python microservice integration with HTTP API calls
- **Image Processing**: Support for proof image analysis with confidence scoring
- **Mock Implementation**: Development-ready mock service with realistic verification logic
- **Queue Management**: Service status tracking with queue size and processing metrics
- **Health Monitoring**: AI service health checks and performance monitoring

### Blockchain Integration (Production Ready)
- **Token Standard**: ERC-20 compatible EcoToken on Ethereum/Polygon networks
- **Library**: Ethers.js v6 for blockchain interactions and smart contract calls
- **Transaction Tracking**: Complete on-chain transaction hash storage and status monitoring
- **Network Support**: Configurable RPC endpoints with gas price management
- **Mock Implementation**: Development mode with realistic transaction simulation
- **Contract Operations**: Mint, burn, and balance query functionality ready for production

## External Dependencies

### Core Infrastructure
- **Database**: PostgreSQL (Neon, AWS RDS, or self-hosted)
- **Authentication**: Firebase Admin SDK and Auth service
- **Hosting**: Docker-compatible (Replit, Heroku, Railway, AWS, GCP)
- **Blockchain**: Ethereum/Polygon RPC endpoints (Infura, Alchemy, etc.)

### Frontend Libraries
- **UI Components**: Radix UI primitives with shadcn/ui wrapper components
- **Charts**: Chart.js for dashboard analytics and data visualization
- **Forms**: React Hook Form with Zod validation schemas
- **Styling**: Tailwind CSS with custom CSS variables and design tokens

### Backend Services
- **Database Driver**: @neondatabase/serverless for PostgreSQL connection
- **Session Store**: connect-pg-simple for PostgreSQL session management
- **Development**: tsx for TypeScript execution and hot reloading

### Development Tools
- **Build System**: TypeScript compiler with ES modules
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Database Management**: Drizzle Kit for schema migrations and database introspection
- **Testing**: Jest with Supertest for API testing and coverage reporting
- **Process Management**: PM2 for production process management
- **Containerization**: Docker with multi-stage builds and health checks
- **Documentation**: Comprehensive API docs, deployment guides, and testing procedures

## Backend API Endpoints (Complete Implementation)

### Authentication & User Management
- `POST /api/auth/register` - User registration with Firebase integration
- `GET /api/users/me` - Current user profile (authenticated)
- `GET /api/users` - List all users (admin only)
- `GET /api/users/stats` - User growth statistics (admin only)

### Green Actions Management
- `POST /api/green-actions` - Submit green action with AI verification
- `GET /api/green-actions` - List all actions (admin only)
- `GET /api/green-actions/recent` - Recent actions with user data (admin only)
- `GET /api/green-actions/user/:userId` - User's action history
- `GET /api/green-actions/stats` - Action analytics by category (admin only)

### EcoToken Operations
- `GET /api/tokens/stats` - Token minting statistics (admin only)
- `GET /api/tokens/user/:userId` - User's token transaction history

### Admin Dashboard
- `GET /api/admin/dashboard/stats` - Complete dashboard analytics

### System Monitoring
- `GET /api/status/firebase` - Firebase service health check
- `GET /api/status/blockchain` - Blockchain network status
- `GET /api/status/ai` - AI verification service status

## Production Deployment

### Docker Support
- Multi-stage Dockerfile with security optimizations
- Docker Compose with PostgreSQL, Redis, and AI service
- Health checks and proper resource limits

### Cloud Platform Ready
- Heroku, Railway, Render deployment configurations
- AWS ECS/Fargate task definitions
- Google Cloud Run deployment support
- Kubernetes manifests with autoscaling

### Environment Management
- Comprehensive environment variable configuration
- Development/staging/production environment support
- Security best practices for credential management