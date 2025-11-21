# Vercel Deployment Guide for SKY-HI Backend

## Prerequisites
- Vercel account
- MongoDB Atlas account (or your MongoDB connection string)
- Cloudinary account (for image uploads)

## Deployment Steps

### 1. Install Vercel CLI (if deploying via CLI)
```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository (or upload the Backend folder)
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `Backend` (if deploying from monorepo)
   - **Build Command**: Leave empty (or `npm install`)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 3. Environment Variables

Add these environment variables in Vercel Dashboard (Settings → Environment Variables):

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAILS=admin@example.com,admin2@example.com
FRONTEND_URL=https://your-frontend-url.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
NODE_ENV=production
```

### 4. Deploy via CLI (Alternative)

```bash
cd Backend
vercel login
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **sky-hi-backend** (or your choice)
- Directory? **./**
- Override settings? **No**

### 5. Production Deployment

```bash
vercel --prod
```

## Important Notes

1. **Entry Point**: The `vercel.json` file is configured to use `server.js` as the entry point
2. **CORS**: Make sure to add your Vercel frontend URL to the CORS allowed origins in `server.js`
3. **Environment Variables**: All sensitive data must be added in Vercel Dashboard
4. **MongoDB**: Ensure your MongoDB Atlas allows connections from Vercel IPs (or use 0.0.0.0/0 for all IPs)
5. **API Base URL**: After deployment, update your frontend `.env` to use the Vercel backend URL

## Post-Deployment

1. Get your Vercel deployment URL (e.g., `https://sky-hi-backend.vercel.app`)
2. Update frontend `.env`:
   ```
   VITE_API_URL=https://sky-hi-backend.vercel.app/api
   ```
3. Update backend CORS in `server.js` to include your frontend Vercel URL
4. Test the API endpoints

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **CORS errors**: Verify frontend URL is in allowed origins
- **MongoDB connection fails**: Check MongoDB Atlas network access settings
- **Environment variables not working**: Ensure they're set in Vercel Dashboard, not just `.env` file

