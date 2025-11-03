# 🚀 Quick Start Guide

Get PlanMorph Tech running locally in under 10 minutes!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check npm
npm --version

# Check PostgreSQL (or use Docker)
psql --version
```

## Option 1: Quick Start Script (Recommended)

```bash
# Make script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Follow the prompts
```

## Option 2: Manual Setup

### Step 1: Install Dependencies (2 min)

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Setup Environment (2 min)

```bash
# Backend environment
cd backend
cp .env.example .env

# Edit with your settings
nano .env
```

Minimum required in `.env`:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/planmorph_db"
JWT_SECRET="your_secret_key_minimum_32_chars"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### Step 3: Setup Database (2 min)

```bash
# Create database
createdb planmorph_db

# Run initialization script
psql planmorph_db < backend/init.sql
```

### Step 4: Create Admin User (1 min)

```bash
cd backend

# Generate password hash
node generateHash.js YourSecurePassword

# Copy the hash and edit init.sql
nano init.sql

# Uncomment and update the INSERT INTO users line
# Replace 'YOUR_GENERATED_HASH_HERE' with your hash

# Re-run init if already initialized
psql planmorph_db < init.sql
```

### Step 5: Start Development (1 min)

```bash
# From project root
npm run dev

# Or start separately:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Access Your App

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Login**: http://localhost:5173/admin/login
- **API Health**: http://localhost:5000/api/health

## Test the Flow

### 1. Test Public Quote Request
1. Go to http://localhost:5173
2. Click "Get a Quote"
3. Fill out the form
4. Submit
5. Check backend terminal for logs

### 2. Test Admin Dashboard
1. Go to http://localhost:5173/admin/login
2. Login with your admin credentials
3. View the submitted request
4. Create and send a quote

### 3. Test Email (Optional)
Make sure EMAIL_* variables are set correctly in backend/.env

## Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

### Database Connection Error
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (Mac)
brew services start postgresql

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Module Not Found
```bash
# Reinstall dependencies
cd backend && rm -rf node_modules && npm install
cd ../frontend && rm -rf node_modules && npm install
```

### Email Not Sending
1. Check EMAIL_* variables in backend/.env
2. For Gmail, use App Password (not regular password)
3. Enable "Less secure app access" or use App Password
4. Check backend logs for detailed error

## Using Docker Instead

If you prefer Docker (no local database needed):

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings
nano .env

# Start everything with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost
```

## Next Steps

1. ✅ Customize branding in components
2. ✅ Update service descriptions
3. ✅ Modify pricing tiers
4. ✅ Test email delivery
5. ✅ Review security settings
6. ✅ Deploy to production (see DEPLOYMENT.md)

## Development Tips

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Changes reflect instantly
- Backend: Restarts automatically (with nodemon)

### Debugging
```bash
# Backend logs
cd backend
npm run dev  # Shows all API requests

# Check database
psql planmorph_db
\dt  # List tables
SELECT * FROM project_requests;  # View requests
```

### Useful Commands
```bash
# Format code (add to package.json)
npm run format

# Check for updates
npm outdated

# Update dependencies
npm update
```

## Getting Help

- Check logs in terminal
- Review README.md for detailed docs
- See DEPLOYMENT.md for production setup
- Check SECURITY.md for best practices

## Ready to Deploy?

Once everything works locally:
1. Read DEPLOYMENT.md
2. Setup Digital Ocean droplet
3. Configure production environment
4. Deploy with Docker
5. Setup SSL certificate
6. Go live! 🎉

---

Happy coding! 🚀
