# Digital Ocean App Platform Deployment

Since you're getting 405 errors, your frontend and backend are deployed separately. Here's how to fix it:

## Option 1: Deploy as Separate Services (Current Setup)

You need to update your frontend to point to the backend URL.

### 1. Update Frontend API Configuration

In Digital Ocean App Platform:
- Go to your **frontend app** → Settings → Environment Variables
- Add: `VITE_API_URL` = `https://planmorph-tech-backend-znojx.ondigitalocean.app`

### 2. Update `frontend/src/utils/api.js`:

Change line 4 from:
```javascript
baseURL: '/api',
```

To:
```javascript
baseURL: import.meta.env.VITE_API_URL || '/api',
```

### 3. Redeploy frontend

---

## Option 2: Use App Spec (Recommended)

Deploy both services under one app:

1. **Delete current deployments**
2. **Create new app** in Digital Ocean
3. **Import the `.do/app.yaml` file** I just created
4. **Add environment secrets**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`

This will deploy both services under one domain with proper routing:
- `https://your-app.ondigitalocean.app/` → Frontend
- `https://your-app.ondigitalocean.app/api/` → Backend

---

## Option 3: Quick Fix (Fastest)

Update your backend URL in the deployed frontend:

1. Go to Digital Ocean Console for frontend app
2. Add environment variable:
   ```
   VITE_API_URL=https://planmorph-tech-backend-znojx.ondigitalocean.app/api
   ```
3. Redeploy

---

## Current Problem

Your logs show:
```
POST /api/requests HTTP/1.1" 405
```

This means the frontend is trying to reach `/api/requests` on the frontend server, which doesn't have an API. The frontend needs to know where your backend API is.

Which option would you like to try?
