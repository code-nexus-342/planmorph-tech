# PlanMorph Tech - AI-Driven Tech Consultancy Website

A complete full-stack web application for a Kenyan tech consultancy specializing in AI solutions and web development. Features a modern, futuristic design with glassmorphism effects and smooth animations.

## 🚀 Features

### Public-Facing Website
- **Modern UI/UX**: Glassmorphism design with Framer Motion animations
- **Floating Pill Navbar**: Unique, center-positioned navigation with smooth transitions
- **Service Showcase**: Detailed pages for AI chatbots, automation, analytics, and web development
- **Transparent Pricing**: Clear pricing tiers with comparison to competitors
- **Quote Request System**: Easy-to-use form for project submissions

### Admin Dashboard
- **Secure Authentication**: JWT-based admin login system
- **Request Management**: View, filter, and search all project requests
- **Quote Creation**: Generate and send professional quotes via email
- **Direct Contact**: Email, phone, and WhatsApp integration
- **Status Tracking**: Monitor request progress (Pending, Quoted, Approved, Rejected)

### Backend Features
- **RESTful API**: Express.js with comprehensive validation
- **PostgreSQL Database**: Robust data persistence with optimized queries
- **Email Service**: Automated professional quote emails via Nodemailer
- **Security**: Input validation, XSS protection, SQL injection prevention
- **Error Handling**: Comprehensive error management and logging

## 🛠️ Tech Stack

### Frontend
- **React 18+** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Axios** for API calls

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **JWT** authentication
- **Nodemailer** for emails
- **express-validator** for input validation
- **bcryptjs** for password hashing

### Deployment
- **Docker** & Docker Compose
- **Nginx** reverse proxy
- **Digital Ocean** ready

## 📁 Project Structure

```
planmorph-tech/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── requestRoutes.js
│   │   └── quoteRoutes.js
│   ├── services/
│   │   └── emailService.js
│   ├── db.js
│   ├── init.sql
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── ServiceCard.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ServicesPage.jsx
│   │   │   ├── PricingPage.jsx
│   │   │   ├── QuoteRequestPage.jsx
│   │   │   └── admin/
│   │   │       ├── AdminLoginPage.jsx
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── RequestDetailsModal.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── nginx.conf
│   └── Dockerfile
│
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚦 Quick Start

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+
- Git

### Local Development Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd planmorph-tech
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

3. **Setup Database**
```bash
# Create PostgreSQL database
createdb planmorph_db

# Run initialization script
psql planmorph_db < init.sql
```

4. **Create Admin User**
```bash
# The init.sql creates a default admin user:
# Email: admin@planmorph.com
# Password: admin123
# ⚠️ Change this password immediately after first login!
```

5. **Start Backend**
```bash
npm run dev
# Server runs on http://localhost:5000
```

6. **Setup Frontend** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

7. **Access the Application**
- Public Website: http://localhost:5173
- Admin Login: http://localhost:5173/admin/login
- API Health: http://localhost:5000/api/health

## 📧 Email Configuration

For quote emails to work, configure your SMTP settings in `backend/.env`:

### Using Gmail
1. Enable 2-Factor Authentication
2. Generate an App Password
3. Update `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### Other SMTP Providers
Update the EMAIL_* variables according to your provider's documentation.

## 🐳 Docker Deployment

### Using Docker Compose

1. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with production values
```

2. **Build and Start**
```bash
docker-compose up -d
```

3. **Initialize Database** (first time only)
```bash
docker-compose exec db psql -U planmorph_user -d planmorph_db -f /docker-entrypoint-initdb.d/init.sql
```

4. **Access Application**
- Website: http://your-server-ip
- Admin: http://your-server-ip/admin/login

5. **View Logs**
```bash
docker-compose logs -f
```

6. **Stop Services**
```bash
docker-compose down
```

## 🌊 Digital Ocean Deployment

### 1. Create Droplet
- Choose Ubuntu 22.04
- Select appropriate size (minimum: 2GB RAM)
- Add SSH key

### 2. Initial Server Setup
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y
```

### 3. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd planmorph-tech

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Setup Domain (Optional)
1. Point your domain's A record to your droplet IP
2. Install Certbot for SSL:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d yourdomain.com
```

### 5. Setup Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## 🔐 Security Considerations

### Production Checklist
- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (minimum 32 characters)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Setup firewall rules
- [ ] Regular database backups
- [ ] Update dependencies regularly
- [ ] Monitor logs for suspicious activity
- [ ] Setup rate limiting (already configured in nginx)

### Database Backups
```bash
# Backup
docker-compose exec db pg_dump -U planmorph_user planmorph_db > backup.sql

# Restore
docker-compose exec -T db psql -U planmorph_user planmorph_db < backup.sql
```

## 🎨 Customization

### Branding
Update the following files:
- `frontend/index.html` - Page title and meta tags
- `frontend/src/components/Navbar.jsx` - Logo and company name
- `frontend/src/components/Footer.jsx` - Footer content
- `backend/services/emailService.js` - Email templates

### Colors
Edit `frontend/tailwind.config.js` to customize the color scheme:
```javascript
colors: {
  primary: { /* your primary colors */ },
  secondary: { /* your secondary colors */ }
}
```

### Services & Pricing
- Update service details in respective page components
- Modify pricing tiers in `PricingPage.jsx`
- Update project types in `QuoteRequestPage.jsx`

## 📊 API Endpoints

### Public Endpoints
- `POST /api/requests` - Submit project request
- `POST /api/auth/login` - Admin login

### Protected Endpoints (Require JWT)
- `GET /api/requests` - List all requests
- `GET /api/requests/:id` - Get single request
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request
- `POST /api/quotes` - Create and send quote
- `GET /api/quotes/request/:id` - Get quotes for request
- `GET /api/quotes/:id` - Get single quote

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps db

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Email Not Sending
1. Check SMTP credentials in `.env`
2. Verify email provider allows SMTP
3. Check backend logs: `docker-compose logs backend`
4. Test with a simple email client first

### Frontend Not Loading
```bash
# Rebuild frontend
docker-compose build frontend
docker-compose up -d frontend

# Check nginx logs
docker-compose logs proxy
```

### Port Already in Use
```bash
# Find and kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in backend/.env
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your_secret_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
EMAIL_FROM=Company Name <noreply@company.com>
FRONTEND_URL=http://localhost:5173
```

### Docker (.env in root)
```env
DB_PASSWORD=secure_password
JWT_SECRET=secure_jwt_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-password
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Email: support@planmorph.com

## 🎯 Roadmap

- [ ] Payment integration (M-Pesa)
- [ ] Client portal for tracking projects
- [ ] Advanced analytics for admin
- [ ] Multi-language support
- [ ] Mobile app
- [ ] AI-powered quote generation

---

Built with ❤️ for Kenyan businesses by PlanMorph Tech
