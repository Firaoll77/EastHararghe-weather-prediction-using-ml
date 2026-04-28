# East Hararghe Weather Platform - Setup Guide

## Overview

This guide will help you set up the complete East Hararghe Weather Prediction Platform locally. The platform consists of three main services:

1. **Frontend** - Next.js application with modern UI
2. **Backend** - Express.js API server
3. **ML Service** - FastAPI machine learning service

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- pip (Python package manager)
- Git
- A Supabase account and project

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose your organization
5. Enter project name: `east-hararghe-weather`
6. Set a strong database password
7. Choose a region closest to you
8. Click "Create new project"

### 1.2 Create Database Tables

Go to the SQL Editor in your Supabase dashboard and run the following queries:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('resident', 'farmer', 'official')),
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create predictions table
CREATE TABLE predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  location TEXT NOT NULL,
  rainfall_prediction NUMERIC NOT NULL,
  confidence_score NUMERIC NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  input_features JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create weather_history table
CREATE TABLE weather_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location TEXT NOT NULL,
  raw_weather_data JSONB NOT NULL,
  temperature NUMERIC NOT NULL,
  humidity NUMERIC NOT NULL,
  pressure NUMERIC NOT NULL,
  wind_speed NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_location ON predictions(location);
CREATE INDEX idx_weather_history_location ON weather_history(location);
CREATE INDEX idx_weather_history_timestamp ON weather_history(timestamp);
```

### 1.3 Set Up Authentication

1. In Supabase dashboard, go to Authentication > Settings
2. Under "Site URL", add: `http://localhost:3000`
3. Under "Redirect URLs", add: `http://localhost:3000/auth/callback`
4. Enable email/password authentication if not already enabled

### 1.4 Get API Keys

1. In Supabase dashboard, go to Settings > API
2. Copy the following values:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service role key (SUPABASE_SERVICE_ROLE_KEY)

## 2. Environment Setup

### 2.1 Clone and Navigate

```bash
cd /home/slimbit/Desktop/CursorApps/HarargheWML
```

### 2.2 Create Environment Files

Create environment files for each service:

**Root Environment (.env)**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ML Service Configuration
ML_API_URL=http://localhost:8000

# Backend Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

**Backend Environment (backend/.env)**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ML_API_URL=http://localhost:8000
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

**Frontend Environment (frontend/.env.local)**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 3. ML Service Setup

### 3.1 Install Python Dependencies

```bash
cd ml-service
pip install -r requirements.txt
```

### 3.2 Add ML Models (Optional)

For production use, place your trained models in the `ml-service/models/` directory:
- `eastern_hararghe_final_model.pkl`
- `weather_scaler.pkl`

If no models are present, the service will create dummy models for development.

### 3.3 Test ML Service

```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

## 4. Backend Setup

### 4.1 Install Node.js Dependencies

```bash
cd backend
npm install
```

### 4.2 Start Backend Server

```bash
npm run dev
```

The backend should start on `http://localhost:3001`

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

## 5. Frontend Setup

### 5.1 Install Node.js Dependencies

```bash
cd frontend
npm install
```

### 5.2 Start Frontend Development Server

```bash
npm run dev
```

The frontend should start on `http://localhost:3000`

## 6. Running All Services

### 6.1 Option 1: Manual Start (Recommended for Development)

Open three terminal windows:

**Terminal 1 - ML Service:**
```bash
cd ml-service
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6.2 Option 2: Using Root Package Scripts

From the root directory:

```bash
# Install all dependencies
npm run install:all

# Start all services (requires separate terminals)
npm run dev:ml    # Terminal 1
npm run dev:backend # Terminal 2  
npm run dev:frontend # Terminal 3
```

## 7. Testing the Application

### 7.1 Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You should see the landing page with weather preview

### 7.2 Create User Account

1. Click "Sign Up"
2. Enter email and password
3. After email verification, sign in
4. Complete your profile:
   - Full name
   - Role (resident, farmer, or official)
   - Location (select from East Hararghe woredas)

### 7.3 Test Features

1. **Weather Data:** View current weather for different woredas
2. **ML Predictions:** Generate rainfall predictions
3. **Role-based Features:** 
   - Residents: Basic weather and predictions
   - Farmers: Enhanced agricultural insights
   - Officials: Analytics dashboard

## 8. Troubleshooting

### Common Issues

**ML Service Connection Error:**
- Ensure ML service is running on port 8000
- Check `ML_API_URL` in backend environment

**Supabase Connection Error:**
- Verify Supabase URL and keys in environment files
- Ensure Supabase project is active
- Check database tables exist

**Frontend Build Errors:**
- Run `npm install` in frontend directory
- Check TypeScript dependencies
- Verify environment variables in `.env.local`

**Backend API Errors:**
- Check backend environment variables
- Ensure all dependencies are installed
- Verify port 3001 is available

### Port Conflicts

If ports are in use, modify them in:
- ML Service: Change port in uvicorn command
- Backend: Change PORT in backend/.env
- Frontend: Update NEXT_PUBLIC_API_URL to match backend port

## 9. Production Deployment

### 9.1 Environment Variables

For production, update all environment variables:
- Use production Supabase credentials
- Set NODE_ENV=production
- Use secure JWT secrets
- Update URLs to match deployment domains

### 9.2 Build Commands

```bash
# Frontend
cd frontend
npm run build

# Backend (if needed)
cd backend
npm run build
```

### 9.3 Deployment Options

- **Frontend:** Vercel, Netlify, or any Node.js hosting
- **Backend:** Railway, Render, or AWS EC2
- **ML Service:** PythonAnywhere, Railway, or AWS Lambda
- **Database:** Supabase (already hosted)

## 10. Development Tips

### 10.1 Code Structure

```
HarargheWML/
frontend/          # Next.js frontend
backend/           # Express.js backend API
ml-service/        # FastAPI ML service
shared/            # Shared types and constants
docs/              # Documentation
```

### 10.2 API Endpoints

**Backend API (http://localhost:3001):**
- `/api/weather/current?woreda=<name>`
- `/api/weather/predict?woreda=<name>`
- `/api/auth/*` (authentication endpoints)
- `/api/predictions/*` (prediction history)
- `/api/admin/*` (admin analytics)

**ML Service (http://localhost:8000):**
- `/predict` (ML prediction endpoint)
- `/health` (health check)

### 10.3 Database Schema

The platform uses three main tables:
- `profiles` - User profiles and roles
- `predictions` - ML prediction results
- `weather_history` - Cached weather data

## 11. Support

For issues and questions:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all services are running on correct ports
4. Check Supabase project status and tables

## 12. Next Steps

Once setup is complete:

1. Add your actual ML models to the ml-service/models directory
2. Customize the UI components and styling
3. Add additional weather features or analytics
4. Set up monitoring and logging for production
5. Implement automated testing

The platform is now ready for development and testing!
