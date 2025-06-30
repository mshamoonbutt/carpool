# 🚀 UniPool Deployment Guide

This guide will help you deploy your UniPool carpool application to Vercel (frontend) and Railway (backend + database).

## 📁 Project Structure

```
carpool/
├── app/                    # Next.js app directory
├── components/             # React components
├── backend/               # FastAPI backend
├── public/                # Static assets
├── styles/                # CSS styles
├── package.json           # Frontend dependencies
├── next.config.js         # Next.js configuration
├── vercel.json           # Vercel deployment config
└── README.md
```

## 🔧 Step 1: Deploy Backend to Railway

### 1.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### 1.2 Deploy Backend
1. **Connect GitHub Repository**:
   - Click "Deploy from GitHub repo"
   - Select your carpool repository
   - Choose the `backend` folder as the root directory

2. **Add PostgreSQL Database**:
   - In Railway dashboard, click "New" → "Database" → "PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable

3. **Configure Environment Variables**:
   Add these environment variables in Railway dashboard:
   ```
   FRONTEND_URL=https://your-app-name.vercel.app
   JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
   ENVIRONMENT=production
   ```

4. **Generate JWT Secret**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

5. **Deploy**:
   - Railway will automatically build and deploy your backend
   - Note the generated URL (e.g., `https://your-backend.railway.app`)

### 1.3 Run Database Migrations
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link to your project
railway login
railway link [your-project-id]

# Run migrations
railway run alembic upgrade head
```

## 🌐 Step 2: Deploy Frontend to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### 2.2 Deploy Frontend
1. **Import Project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Next.js project

2. **Configure Environment Variables**:
   Add this environment variable in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your Next.js app
   - Note the generated URL (e.g., `https://your-app.vercel.app`)

### 2.3 Update Backend CORS
Update the `FRONTEND_URL` environment variable in Railway with your Vercel URL:
```
FRONTEND_URL=https://your-app.vercel.app
```

## ✅ Step 3: Verification

### 3.1 Test Backend
Visit your Railway backend URL:
- `https://your-backend.railway.app/health` → Should return `{"status": "healthy"}`
- `https://your-backend.railway.app/docs` → Should show FastAPI documentation

### 3.2 Test Frontend
Visit your Vercel frontend URL:
- Should load the UniPool homepage
- Test user registration and login
- Test ride creation and search

## 🔄 Step 4: Automatic Deployments

Both services support automatic deployments:
- **Frontend**: Automatically deploys when you push to your main branch
- **Backend**: Automatically deploys when you push changes to the backend folder

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure `FRONTEND_URL` is set correctly in Railway
   - Check that your Vercel URL matches the CORS configuration

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` environment variable
   - Run migrations: `railway run alembic upgrade head`

3. **Build Failures**:
   - Check build logs in Railway/Vercel dashboards
   - Ensure all dependencies are in requirements.txt/package.json

4. **API Connection Issues**:
   - Verify `NEXT_PUBLIC_API_URL` in Vercel
   - Test backend health endpoint manually

## 🎉 You're Live!

Once deployed, your UniPool application will be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`

## 📊 Monitoring

- **Railway**: View logs and monitor database usage in the dashboard
- **Vercel**: Monitor performance and view deployment logs

---

### 🔧 Quick Deploy Commands

```bash
# Deploy frontend to Vercel (from root directory)
npx vercel

# Deploy backend to Railway (from backend directory)
railway up
```

Share your app with users and start carpooling! 🚗💨 