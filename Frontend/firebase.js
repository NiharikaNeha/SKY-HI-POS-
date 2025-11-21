import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// Your web app's Firebase configuration
// Uses environment variables from .env (local) or Vercel (production)
// Falls back to hardcoded values if env vars are not available
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA_bwMMYfg0SWHt2fx7G11TFxHVI_0G3V8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sky-hi-43d01.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sky-hi-43d01",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sky-hi-43d01.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "4432498974",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:4432498974:web:58a46c74fab757956b390f"
}

// Note: Firebase client config is public and safe to include in the bundle
// The fallback values ensure the app works even if env vars aren't set in production

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export default app

