# EcoX Complete Database & ML Integration Setup Guide

## 🎯 Overview

This guide will help you set up a complete, production-ready EcoX system with:

1. **Full Database Integration** (Firestore + PostgreSQL)
2. **File Upload System** for carbon calculation documents
3. **Python ML Microservice** for advanced carbon analysis
4. **Real-time API Integration** between all services

## 📁 Project Structure

```
EcoX/
├── client/                     # React frontend
├── server/                     # Node.js backend
├── ml-service/                 # Python ML microservice
├── uploads/                    # File upload directory
└── docs/                       # Documentation
```

## 🚀 Step 1: Backend Database Setup

### Option A: Firestore Setup (Recommended)

1. **Create Firebase Project**:
   ```bash
   # Go to Firebase Console: https://console.firebase.google.com/
   # Create new project → Enable Firestore → Generate service account key
   ```

2. **Set Environment Variables**:
   ```bash
   # In Replit Secrets or .env file:
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   
   # Set mock mode to false for production
   MOCK_FIREBASE_SERVICE=false
   ```

### Option B: PostgreSQL Setup (Optional Backup)

1. **Database Setup**:
   ```bash
   # For local development with Docker:
   docker run --name ecox-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ecox_db -p 5432:5432 -d postgres:15
   
   # Or use cloud providers like:
   # - Supabase (https://supabase.com/)
   # - Neon (https://neon.tech/)
   # - Railway (https://railway.app/)
   ```

2. **Connection String**:
   ```bash
   DATABASE_URL=postgresql://username:password@localhost:5432/ecox_db
   ```

## 🐍 Step 2: Python ML Service Setup

### Install Python Dependencies

1. **Navigate to ML Service**:
   ```bash
   cd ml-service
   ```

2. **Create Virtual Environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\\Scripts\\activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Install System Dependencies**:
   ```bash
   # Ubuntu/Debian:
   sudo apt update
   sudo apt install tesseract-ocr
   
   # macOS:
   brew install tesseract
   
   # Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   ```

### Run ML Service

```bash
# From ml-service directory:
python app.py

# Service will start on http://localhost:8000
# Test with: curl http://localhost:8000/health
```

## 🔧 Step 3: Backend Configuration

### Environment Variables Setup

```bash
# Complete .env file for production:

# Database
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-service-email
DATABASE_URL=postgresql://user:pass@host:5432/db

# Services
ML_SERVICE_URL=http://localhost:8000
GEMINI_API_KEY=your-gemini-api-key

# Mock Modes (set to false for production)
MOCK_FIREBASE_SERVICE=false
MOCK_BLOCKCHAIN_SERVICE=true
MOCK_AI_SERVICE=false

# Blockchain (optional)
ECO_TOKEN_CONTRACT_ADDRESS=your-contract-address
BLOCKCHAIN_RPC_URL=your-rpc-endpoint
PRIVATE_KEY=your-ethereum-private-key

# File Upload
BASE_URL=http://localhost:5000
```

### Start Backend

```bash
npm run dev
```

## 🌐 Step 4: Frontend Integration

### New Features Available

1. **File Upload**: Users can upload bills, receipts, meter readings
2. **ML Carbon Calculation**: Advanced AI-powered carbon footprint analysis
3. **Real Database**: Persistent user data and action history
4. **Enhanced Verification**: ML-powered action verification

## 📱 Step 5: Usage Examples

### 1. Upload Energy Bill for Analysis

```javascript
// Frontend JavaScript example:
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  },
  body: formData
});

const result = await response.json();
// Result includes: processed file, OCR analysis, carbon calculation
```

### 2. Advanced Carbon Calculation

```javascript
// Calculate carbon footprint with ML enhancement:
const response = await fetch('/api/calculate-carbon', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    energyData: {
      kWh: 450,
      type: 'electricity_grid',
      household_size: 3,
      region: 'US'
    }
  })
});

const result = await response.json();
// Result includes: ML-enhanced calculation, savings potential, recommendations
```

### 3. Enhanced Action Submission

```javascript
// Submit action with image and get ML verification:
const formData = new FormData();
formData.append('type', 'energy');
formData.append('data', JSON.stringify({
  kWh: 400,
  description: 'LED lighting upgrade'
}));
formData.append('image', imageFile);

const response = await fetch('/api/actions/submit-enhanced', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`
  },
  body: formData
});
```

## 🔍 Step 6: Testing the System

### Test ML Service

```bash
# Test carbon calculation:
curl -X POST http://localhost:8000/calculate-carbon \
  -H "Content-Type: application/json" \
  -d '{"kWh": 500, "type": "electricity_grid"}'

# Test image analysis:
curl -X POST http://localhost:8000/analyze-image \
  -F "file=@path/to/bill.jpg"
```

### Test Backend API

```bash
# Test file upload:
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@path/to/bill.jpg"

# Test carbon calculation:
curl -X POST http://localhost:5000/api/calculate-carbon \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"energyData": {"kWh": 450}}'
```

## 🚀 Step 7: Production Deployment

### Docker Deployment

1. **Create docker-compose.yml**:
   ```yaml
   version: '3.8'
   services:
     frontend:
       build: ./client
       ports:
         - "3000:3000"
     
     backend:
       build: ./server
       ports:
         - "5000:5000"
       environment:
         - DATABASE_URL=${DATABASE_URL}
         - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
         - ML_SERVICE_URL=http://ml-service:8000
     
     ml-service:
       build: ./ml-service
       ports:
         - "8000:8000"
       
     postgres:
       image: postgres:15
       environment:
         - POSTGRES_DB=ecox_db
         - POSTGRES_PASSWORD=password
       volumes:
         - postgres_data:/var/lib/postgresql/data
   
   volumes:
     postgres_data:
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Cloud Deployment Options

1. **Replit** (Current): Already configured
2. **Vercel + Railway**: Frontend on Vercel, Backend on Railway
3. **AWS/GCP**: Full cloud deployment with managed services
4. **DigitalOcean**: App Platform deployment

## 🔧 Step 8: Advanced Features

### Machine Learning Models

The ML service includes:
- **Carbon Footprint Prediction**: Random Forest model for accurate calculations
- **OCR Text Extraction**: Tesseract integration for bill analysis
- **Recommendation Engine**: Personalized environmental suggestions
- **Image Classification**: Bill/receipt validation

### Database Features

- **Dual Database Support**: Firestore for real-time, PostgreSQL for analytics
- **Automatic Sync**: Data synced between both databases
- **File Management**: Metadata tracking with automatic cleanup
- **Transaction History**: Complete audit trail

### Security Features

- **Firebase Authentication**: Secure user management
- **File Validation**: Type and size restrictions
- **API Rate Limiting**: Prevent abuse
- **Data Encryption**: Sensitive data protection

## 📊 Step 9: Monitoring & Analytics

### Available Endpoints for Monitoring

- `GET /api/health` - Service health check
- `GET /api/uploads/stats` - File upload statistics
- `GET /health` (ML service) - ML service status

### Key Metrics to Monitor

1. **ML Service Performance**: Response times, accuracy rates
2. **File Upload Volume**: Size, frequency, processing times
3. **Carbon Calculations**: Accuracy, user engagement
4. **Database Performance**: Query times, connection pools

## 🎯 Next Steps

1. **Set up your databases** (Firestore/PostgreSQL)
2. **Configure ML service** with your specific needs
3. **Test file upload and analysis** with real utility bills
4. **Train ML models** with your user data
5. **Deploy to production** using your preferred cloud provider

## 🆘 Troubleshooting

### Common Issues

1. **ML Service Connection Failed**:
   ```bash
   # Check if Python service is running:
   curl http://localhost:8000/health
   
   # Check environment variable:
   echo $ML_SERVICE_URL
   ```

2. **File Upload Errors**:
   ```bash
   # Check uploads directory permissions:
   mkdir -p uploads
   chmod 755 uploads
   ```

3. **Database Connection Issues**:
   ```bash
   # Test PostgreSQL connection:
   psql $DATABASE_URL -c "SELECT 1;"
   
   # Check Firestore credentials:
   node -e "console.log(process.env.FIREBASE_PROJECT_ID)"
   ```

4. **OCR Not Working**:
   ```bash
   # Install Tesseract:
   # Ubuntu: sudo apt install tesseract-ocr
   # macOS: brew install tesseract
   # Windows: Download from official site
   ```

## 📚 API Documentation

### File Upload API
- **POST** `/api/upload` - Upload files for carbon analysis
- **GET** `/uploads/:filename` - Serve uploaded files
- **GET** `/api/uploads/stats` - Get upload statistics

### Carbon Calculation API
- **POST** `/api/calculate-carbon` - Advanced ML carbon calculation
- **POST** `/api/actions/submit-enhanced` - Submit action with ML verification
- **GET** `/api/recommendations` - Get ML-powered recommendations

### ML Service API
- **POST** `/calculate-carbon` - Raw carbon calculation
- **POST** `/analyze-image` - Image OCR and analysis
- **POST** `/recommendations` - Personalized recommendations
- **GET** `/health` - Service health check

Your EcoX system is now ready for production with full database integration and ML-powered carbon analysis! 🌟
