// Lightweight Firebase setup (client-side). Replace env vars in .env with your Firebase project values.
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as firebaseSignInWithEmail,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyACto2hBVADZibEYoSpXSQF0z6TeDhwOcc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'curlai.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'curlai',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:942693885359:web:a735fe345498389cd57b5a',
  storageBucket: "curlai.firebasestorage.app",
  messagingSenderId: "942693885359",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  return firebaseSignInWithEmail(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export { auth };
