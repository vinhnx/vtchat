#!/bin/bash

# VTChat Railway Deployment Script

echo "🚀 Starting VTChat deployment to Railway..."

# Check if railway CLI is available
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Check if logged in
if ! railway projects > /dev/null 2>&1; then
    echo "❌ Not logged in to Railway. Please run: railway login"
    exit 1
fi

echo "✅ Railway CLI ready"

# Deploy the application
echo "📦 Deploying to Railway..."
railway up

echo "🎉 Deployment initiated! Check Railway dashboard for build progress."
echo "📍 You can monitor the deployment at: https://railway.app"
