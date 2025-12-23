#!/bin/bash

# SGM Multi-Tenancy Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 SGM Multi-Tenancy Quick Setup"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env

  # Generate NEXTAUTH_SECRET
  echo ""
  echo "🔑 Generating NEXTAUTH_SECRET..."
  SECRET=$(openssl rand -base64 32)

  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|your-nextauth-secret-here-generate-with-openssl-rand-base64-32|$SECRET|g" .env
  else
    # Linux
    sed -i "s|your-nextauth-secret-here-generate-with-openssl-rand-base64-32|$SECRET|g" .env
  fi

  echo "✅ NEXTAUTH_SECRET generated and saved to .env"
  echo ""
  echo "⚠️  IMPORTANT: You still need to configure:"
  echo "   - DATABASE_URL"
  echo "   - GOOGLE_CLIENT_ID"
  echo "   - GOOGLE_CLIENT_SECRET"
  echo ""
  echo "See MULTI_TENANCY_SETUP.md for instructions."
  echo ""
else
  echo "✅ .env file already exists"
  echo ""
fi

# Check if dependencies are installed
if [ ! -d "node_modules/next-auth" ]; then
  echo "📦 Installing authentication dependencies..."
  npm install next-auth@latest @next-auth/prisma-adapter
  echo "✅ Dependencies installed"
  echo ""
else
  echo "✅ Dependencies already installed"
  echo ""
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "🗄️  Generating Prisma client..."
  npm run db:generate
  echo "✅ Prisma client generated"
  echo ""
else
  echo "✅ Prisma client already generated"
  echo ""
fi

echo "📋 Setup Status:"
echo "================"
echo ""
echo "✅ .env file created"
echo "✅ NEXTAUTH_SECRET generated"
echo "✅ Dependencies installed"
echo "✅ Prisma client generated"
echo ""
echo "⏳ Still Required:"
echo "=================="
echo ""
echo "1. Configure DATABASE_URL in .env"
echo "2. Set up Google OAuth and add credentials to .env"
echo "3. Run database migration: npm run db:migrate -- --name add_multi_tenancy_and_auth"
echo "4. Seed tenants: npx tsx prisma/seed-tenants.ts"
echo "5. Update app/layout.tsx to include Providers"
echo "6. Start dev server: npm run dev"
echo ""
echo "📚 For detailed instructions, see:"
echo "   - MULTI_TENANCY_SETUP.md"
echo "   - IMPLEMENTATION_SUMMARY.md"
echo ""
echo "🎉 Quick setup complete!"
