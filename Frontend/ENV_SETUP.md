# Environment Variables Setup

## Overview
All sensitive information in the frontend is now stored in the `.env` file. This includes Firebase configuration and API URLs.

## Required Environment Variables

### Firebase Configuration
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### API Configuration
```env
VITE_API_URL=http://localhost:5000
```

## Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values:**
   - Get Firebase config from [Firebase Console](https://console.firebase.google.com/)
   - Project Settings > Your apps > Web app
   - Copy the configuration values

3. **For Production:**
   - Update `VITE_API_URL` to your production backend URL
   - Example: `VITE_API_URL=https://sky-hi-pos-backend.vercel.app`

## Security Notes

- ✅ `.env` file is in `.gitignore` - it will NOT be committed to git
- ✅ `.env.example` is a template without sensitive data
- ✅ All sensitive values are loaded from environment variables
- ✅ Frontend code validates that required variables are present

## Files Using Environment Variables

- `firebase.js` - Firebase configuration
- `utils/api.js` - API base URL

## Troubleshooting

- **"Firebase configuration is incomplete"**: Check that all `VITE_FIREBASE_*` variables are set in `.env`
- **"Failed to fetch"**: Verify `VITE_API_URL` is correct and backend is running
- **Variables not loading**: Restart the dev server after changing `.env`

## Important

⚠️ **Never commit `.env` to version control!**
✅ Always use `.env.example` as a template for other developers

