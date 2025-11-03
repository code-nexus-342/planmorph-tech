# SECURITY.md

## Security Policy

### Reporting a Vulnerability

If you discover a security vulnerability, please email us at security@planmorph.com instead of using the issue tracker.

### Security Best Practices

1. **Never commit sensitive data**
   - API keys, passwords, or tokens
   - Use environment variables

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use strong passwords**
   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols

4. **Enable 2FA** where possible

5. **Regular backups**
   - Database backups daily
   - Store securely off-site

6. **Monitor logs** for suspicious activity

### Secure Configuration

#### Production Checklist
- [ ] Change all default passwords
- [ ] Use HTTPS/SSL certificates
- [ ] Set secure JWT_SECRET (32+ chars)
- [ ] Configure firewall (UFW)
- [ ] Enable rate limiting
- [ ] Sanitize all user inputs
- [ ] Use prepared statements (SQL)
- [ ] Set secure HTTP headers
- [ ] Regular security audits

#### Environment Variables
Never hardcode:
- Database credentials
- API keys
- JWT secrets
- Email passwords
- Third-party tokens

### Known Security Features

1. **Input Validation**: All API inputs validated with express-validator
2. **SQL Injection Prevention**: Parameterized queries
3. **XSS Protection**: Input sanitization
4. **Authentication**: JWT with httpOnly cookies (optional)
5. **Rate Limiting**: Configured in nginx
6. **Password Hashing**: bcrypt with salt rounds
7. **CORS**: Configured for specific origins

### Security Updates

We take security seriously. Updates are released as needed for:
- Critical vulnerabilities
- Dependency updates
- Security patches

Stay updated by watching this repository.
