# Deployment Guide - PlanMorph Tech

Complete guide for deploying the PlanMorph Tech website to production on Digital Ocean.

## 📋 Prerequisites

- Digital Ocean account
- Domain name (optional but recommended)
- SSH key pair
- Basic command line knowledge

## 🚀 Step-by-Step Deployment

### 1. Create a Digital Ocean Droplet

1. Log in to [Digital Ocean](https://www.digitalocean.com/)
2. Click "Create" → "Droplets"
3. Choose configuration:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic
   - **CPU Options**: Regular (2GB RAM minimum recommended)
   - **Datacenter**: Choose closest to your users (e.g., Frankfurt for Kenya)
   - **Authentication**: SSH Key (add your public key)
   - **Hostname**: planmorph-tech
4. Click "Create Droplet"
5. Note your droplet's IP address

### 2. Initial Server Setup

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Update system packages
apt update && apt upgrade -y

# Create a new sudo user (recommended)
adduser planmorph
usermod -aG sudo planmorph

# Setup firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Switch to new user
su - planmorph
```

### 3. Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Verify installations
docker --version
docker-compose --version

# Log out and back in for group changes to take effect
exit
# SSH back in
```

### 4. Clone and Setup Project

```bash
# Install git if not present
sudo apt install git -y

# Clone repository
cd /home/planmorph
git clone YOUR_REPOSITORY_URL planmorph-tech
cd planmorph-tech

# Create environment file
cp .env.example .env
nano .env
```

### 5. Configure Environment Variables

Edit `.env` with your production values:

```env
# Database
DB_PASSWORD=YOUR_STRONG_DB_PASSWORD_HERE

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=YOUR_SUPER_SECRET_JWT_KEY_32_CHARS_MIN

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-business-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=PlanMorph Tech <noreply@yourcompany.com>

# Frontend URL
FRONTEND_URL=http://YOUR_DROPLET_IP
# or if you have a domain:
# FRONTEND_URL=https://yourdomain.com

# Production
NODE_ENV=production
```

### 6. Setup Email (Gmail Example)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable it)
3. Security → App passwords
4. Generate password for "Mail"
5. Use this password in EMAIL_PASS

### 7. Create Admin User

```bash
# Generate password hash
cd backend
npm install
node generateHash.js YourSecurePassword123

# Copy the generated hash
# Edit init.sql and uncomment the INSERT statement
# Replace 'YOUR_GENERATED_HASH_HERE' with your hash
nano init.sql
```

### 8. Deploy with Docker

```bash
# Return to project root
cd /home/planmorph/planmorph-tech

# Build and start containers
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs
docker-compose logs -f

# Initialize database (if needed)
docker-compose exec db psql -U planmorph_user -d planmorph_db -f /docker-entrypoint-initdb.d/init.sql
```

### 9. Verify Deployment

```bash
# Check if services are responding
curl http://localhost/api/health
curl http://localhost

# Check container logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs proxy
```

### 10. Setup Domain (Optional but Recommended)

#### A. Point Domain to Droplet

1. Go to your domain registrar
2. Add an A record:
   - Host: @ (or yourdomain.com)
   - Value: YOUR_DROPLET_IP
   - TTL: 3600
3. Wait for DNS propagation (5-30 minutes)

#### B. Install SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop nginx temporarily
docker-compose stop proxy

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be saved in /etc/letsencrypt/live/yourdomain.com/
```

#### C. Update Nginx Configuration

```bash
# Edit nginx config
nano nginx/nginx.conf

# Uncomment the SSL server block and update:
# - Replace 'yourdomain.com' with your domain
# - Update SSL certificate paths
# - Uncomment the HTTP to HTTPS redirect block

# Restart proxy
docker-compose restart proxy
```

#### D. Auto-renew SSL

```bash
# Test renewal
sudo certbot renew --dry-run

# Add cron job for auto-renewal
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet && docker-compose restart proxy
```

### 11. Update Frontend URL

```bash
# Update .env with your domain
nano .env

# Change:
FRONTEND_URL=https://yourdomain.com

# Restart backend
docker-compose restart backend
```

### 12. Security Hardening

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Enable automatic security updates
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades

# Install fail2ban (protection against brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## 🔄 Maintenance Tasks

### Update Application

```bash
cd /home/planmorph/planmorph-tech

# Pull latest changes
git pull

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

### Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
docker-compose exec db pg_dump -U planmorph_user planmorph_db > ~/backups/db_backup_$(date +%Y%m%d).sql

# Restore from backup
docker-compose exec -T db psql -U planmorph_user planmorph_db < ~/backups/db_backup_20240101.sql
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
```

## 🐛 Troubleshooting

### Services Won't Start

```bash
# Check status
docker-compose ps

# View detailed logs
docker-compose logs backend
docker-compose logs db

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(80|443|5432|5000)'

# Restart everything
docker-compose down
docker-compose up -d
```

### Database Connection Issues

```bash
# Check database logs
docker-compose logs db

# Check if database is ready
docker-compose exec db pg_isready -U planmorph_user

# Restart database
docker-compose restart db

# Verify credentials in .env match docker-compose.yml
```

### Email Not Sending

```bash
# Test SMTP connection
docker-compose exec backend node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify((err, success) => {
  console.log(err || 'SMTP Connection: OK');
});
"
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check nginx configuration
docker-compose exec proxy nginx -t
```

## 📊 Monitoring

### Setup Basic Monitoring

```bash
# Install htop for server monitoring
sudo apt install htop -y

# Monitor containers
docker stats

# Monitor disk usage
df -h

# Monitor logs in real-time
docker-compose logs -f --tail=100
```

### Setup Uptime Monitoring (Optional)

Use services like:
- [UptimeRobot](https://uptimerobot.com/) (Free)
- [Pingdom](https://www.pingdom.com/)
- Digital Ocean Monitoring (Built-in)

## 🔐 Security Checklist

- [ ] Changed default admin password
- [ ] Strong JWT_SECRET set
- [ ] Firewall enabled (UFW)
- [ ] SSH root login disabled
- [ ] SSL/HTTPS enabled
- [ ] Automatic security updates enabled
- [ ] Fail2ban installed
- [ ] Regular database backups scheduled
- [ ] Environment variables secured
- [ ] Strong database password used
- [ ] Email credentials secured

## 📈 Optimization Tips

### Enable Compression

```bash
# Already configured in nginx.conf
# Verify it's working:
curl -H "Accept-Encoding: gzip" -I http://yourdomain.com
```

### Setup CDN (Optional)

Use Cloudflare for:
- Free SSL
- DDoS protection
- Global CDN
- DNS management

### Database Optimization

```bash
# Monitor database performance
docker-compose exec db psql -U planmorph_user planmorph_db -c "
SELECT schemaname,relname,n_live_tup 
FROM pg_stat_user_tables 
ORDER BY n_live_tup DESC;
"

# Vacuum database
docker-compose exec db psql -U planmorph_user planmorph_db -c "VACUUM ANALYZE;"
```

## 🆘 Getting Help

- Check logs: `docker-compose logs -f`
- Verify environment variables: `cat .env`
- Check service status: `docker-compose ps`
- Test endpoints: `curl http://localhost/api/health`
- Review documentation: `README.md`

## 📞 Support

For deployment issues:
- Email: support@planmorph.com
- Open GitHub issue
- Check SECURITY.md for security concerns

---

**Congratulations!** 🎉 Your PlanMorph Tech website is now deployed and live!

Remember to:
1. Change default admin password immediately
2. Setup regular backups
3. Monitor server health
4. Keep dependencies updated
