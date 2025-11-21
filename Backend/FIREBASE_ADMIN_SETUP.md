# Firebase Admin SDK Setup Guide

## Quick Setup for Backend

To use Firebase Admin SDK in the backend, you need to get your Firebase service account credentials.

### Option 1: Service Account JSON (Recommended for Production)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **sky-hi-43d01**
3. Go to **Project Settings** (gear icon)
4. Click on **Service accounts** tab
5. Click **Generate new private key**
6. Download the JSON file

### Option 2: Use Project ID Only (For Development/Testing)

For development, you can use just the project ID. Add this to your `Backend/.env`:

```env
FIREBASE_PROJECT_ID=sky-hi-43d01
```

### Option 3: Full Service Account JSON (For Production)

If you have the service account JSON, you need to add it to `Backend/.env` as a single-line string:

```env
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"sky-hi-43d01","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Important**: The entire JSON must be on a single line with escaped quotes.

### Current Configuration

Your Firebase project details:
- **Project ID**: `sky-hi-43d01`
- **Auth Domain**: `sky-hi-43d01.firebaseapp.com`

### Testing

After setting up, test the authentication:
1. Start backend: `cd Backend && npm run dev`
2. Start frontend: `cd Frontend && npm run dev`
3. Try signing in with Google on the frontend
4. Check backend logs for any Firebase Admin initialization errors

### Troubleshooting

- **"Firebase Admin not configured"**: Add `FIREBASE_PROJECT_ID` or `FIREBASE_SERVICE_ACCOUNT` to `Backend/.env`
- **"Invalid token"**: Make sure Firebase Admin is properly initialized
- **"Permission denied"**: Check that the service account has proper permissions

