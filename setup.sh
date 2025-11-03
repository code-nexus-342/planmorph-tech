#!/bin/bash

# Quick Start Script for PlanMorph Tech
# This script helps you get started quickly in development

echo "🚀 PlanMorph Tech Quick Start"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed. You'll need it for the database."
    echo "   Install it or use Docker instead."
fi

echo ""
echo "📦 Installing dependencies..."

# Install backend dependencies
echo "Installing backend packages..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Backend dependencies already installed"
fi

# Install frontend dependencies
echo "Installing frontend packages..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed"
fi
cd ..

# Setup environment files
echo ""
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from template..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env - Please edit it with your configuration"
else
    echo "backend/.env already exists"
fi

# Database setup
echo ""
echo "💾 Database Setup"
echo "=================="
echo "To initialize the database:"
echo "1. Create database: createdb planmorph_db"
echo "2. Run init script: psql planmorph_db < backend/init.sql"
echo ""
echo "Or use Docker: docker-compose up -d"
echo ""

# Done
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your database and email settings"
echo "2. Initialize the database (see instructions above)"
echo "3. Run 'npm run dev' to start both frontend and backend"
echo ""
echo "🌐 Access points:"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend API: http://localhost:5000"
echo "   - Admin Login: http://localhost:5173/admin/login"
echo ""
echo "📚 Default admin credentials (CHANGE IMMEDIATELY):"
echo "   Email: admin@planmorph.com"
echo "   Password: admin123"
echo ""
echo "Happy coding! 🎉"
