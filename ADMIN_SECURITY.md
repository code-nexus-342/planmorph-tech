# 🔐 Admin Security & Access Control

## Admin Access Points

### ✅ Admin Login
- **URL**: http://localhost:8080/admin/login (local) or https://yourdomain.com/admin/login (production)
- **Email**: `admin@planmorph.com`
- **Default Password**: `Admin123!` ⚠️ **CHANGE THIS IMMEDIATELY**

### 🚫 Hidden from Public

The admin section is **completely hidden** from regular users:

1. **No Navigation Links**: Admin routes are NOT linked in Navbar or Footer
2. **No Sitemap**: Admin pages excluded from search engine indexing
3. **Direct URL Only**: Only accessible by typing the URL directly
4. **JWT Protected**: All admin APIs require valid authentication token

## Security Measures Implemented

### 1. **Route Protection** ✅
- Frontend uses `ProtectedRoute` component
- Checks for JWT token in localStorage
- Redirects to login if token missing
- Token expires after 24 hours

### 2. **Backend API Security** ✅
- All admin endpoints use `authMiddleware`
- JWT verification on every request
- Endpoints protected:
  - `GET /api/requests` - View all requests
  - `GET /api/requests/:id` - View single request
  - `PUT /api/requests/:id` - Update request status
  - `DELETE /api/requests/:id` - Delete request
  - `POST /api/quotes` - Create quotation
  - `GET /api/quotes/*` - View quotations
  - `DELETE /api/quotes/:id` - Delete quotation

### 3. **Rate Limiting** ✅
- **API Requests**: 10 requests/second max
- **Login Attempts**: 5 requests/minute max
- Prevents brute force attacks
- Configured in nginx reverse proxy

### 4. **robots.txt** ✅
```
Disallow: /admin/
Disallow: /admin/login
Disallow: /admin/dashboard
```
Search engines won't index admin pages

### 5. **Security Headers** ✅
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## How to Access Admin Dashboard

### For You (Admin):

**Method 1: Secret Triple-Click** 🔐
1. Go to any page on your website
2. **Triple-click the PlanMorph logo** (the "P" icon in the navbar)
3. You'll be automatically redirected to admin login
4. This is a hidden feature - clients won't discover it!

**Method 2: Direct URL**
1. Navigate to: http://localhost:8080/admin/login
2. Enter credentials
3. Access dashboard at: http://localhost:8080/admin/dashboard

### For Clients (Not Possible):
- ❌ No links on website
- ❌ No way to discover the URL
- ❌ Can't access even if they find URL (no credentials)
- ❌ Blocked from search results

## Change Admin Password

### Method 1: Generate New Hash
```bash
cd backend
node generateHash.js YourNewPassword123

# Copy the hash, then update database:
psql "YOUR_DATABASE_URL" -c "UPDATE users SET password_hash = 'NEW_HASH_HERE' WHERE email = 'admin@planmorph.com';"
```

### Method 2: Using Docker
```bash
# Connect to database
sudo docker exec -it planmorph-db psql -U planmorph_user -d planmorph_db

# Update password (replace with your new hash)
UPDATE users SET password_hash = '$2a$10$NEW_HASH_HERE' WHERE email = 'admin@planmorph.com';
```

## Additional Security Recommendations

### 🔒 Production Deployment

1. **Change Default Password** (Critical!)
   ```bash
   node backend/generateHash.js YourStrongPassword123!@#
   ```

2. **Use Strong JWT Secret**
   - Generate: `openssl rand -base64 64`
   - Update in `.env`: `JWT_SECRET=generated_secret_here`

3. **Enable HTTPS**
   - Use Let's Encrypt (free SSL)
   - See `DEPLOYMENT.md` for setup instructions

4. **Secure Environment Variables**
   ```bash
   # Never commit .env files to git
   # Store secrets in Digital Ocean or other secret manager
   ```

5. **Enable Firewall**
   ```bash
   # On Digital Ocean droplet
   ufw allow 22    # SSH
   ufw allow 80    # HTTP
   ufw allow 443   # HTTPS
   ufw enable
   ```

6. **Regular Updates**
   ```bash
   # Update dependencies monthly
   npm audit fix
   
   # Update system packages
   apt update && apt upgrade -y
   ```

7. **Database Backups**
   ```bash
   # Neon provides automatic backups
   # Or setup manual backups:
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

8. **Monitor Failed Login Attempts**
   ```bash
   # Check logs for suspicious activity
   sudo docker-compose logs backend | grep "Login failed"
   ```

## IP Whitelisting (Optional)

For extra security, restrict admin access to specific IPs:

```nginx
# In nginx/nginx.conf, add to admin locations:
location /admin/ {
    allow 41.90.x.x;     # Your office IP
    allow 105.163.x.x;   # Your home IP
    deny all;
    
    # ... rest of config
}
```

## Two-Factor Authentication (Future Enhancement)

Consider adding 2FA for production:
- Google Authenticator integration
- SMS verification via Africa's Talking
- Email verification codes

## Emergency Access Recovery

If you forget admin password:

```bash
# 1. Generate new hash
node backend/generateHash.js NewPassword123

# 2. Connect to database
psql "YOUR_DATABASE_URL"

# 3. Update password
UPDATE users SET password_hash = '$2a$10$NEW_HASH' WHERE email = 'admin@planmorph.com';
```

## Testing Security

```bash
# Test 1: Try accessing without token
curl http://localhost:8080/api/requests
# Should return: 401 Unauthorized

# Test 2: Try with invalid token
curl -H "Authorization: Bearer invalid_token" http://localhost:8080/api/requests
# Should return: 401 Unauthorized / Invalid token

# Test 3: Valid login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planmorph.com","password":"Admin123!"}'
# Should return: token and user info
```

## Security Checklist

Before going live, ensure:

- [ ] Changed default admin password
- [ ] Generated strong JWT secret (64+ characters)
- [ ] Email credentials configured properly
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall enabled and configured
- [ ] Database backups scheduled
- [ ] Rate limiting tested
- [ ] Error logging configured
- [ ] Admin access tested
- [ ] Client access verified (should NOT see admin)

---

## Support

If you need help with security:
- Check logs: `sudo docker-compose logs`
- Review `SECURITY.md` for best practices
- Contact: planmorph@gmail.com

**Remember**: Security is an ongoing process. Review and update regularly!
