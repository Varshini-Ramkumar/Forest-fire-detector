import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

interface FirebaseConfigType {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

// Check for vite env vars or external config
const envConfig: FirebaseConfigType = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
};

export const isFirebaseConfigured = Boolean(
  envConfig.apiKey &&
  envConfig.projectId &&
  envConfig.apiKey !== 'your-api-key' &&
  !envConfig.apiKey.includes('placeholder')
);

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firebaseDb: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(envConfig as Record<string, string>);
    } else {
      firebaseApp = getApps()[0];
    }
    firebaseAuth = getAuth(firebaseApp);
    if (envConfig.firestoreDatabaseId && envConfig.firestoreDatabaseId !== '(default)') {
      firebaseDb = getFirestore(firebaseApp, envConfig.firestoreDatabaseId);
    } else {
      firebaseDb = getFirestore(firebaseApp);
    }
  } catch (err) {
    console.warn('Firebase initialization failed, falling back to Demo Mode:', err);
    firebaseApp = null;
    firebaseAuth = null;
    firebaseDb = null;
  }
}

export const app = firebaseApp;
export const auth = firebaseAuth;
export const db = firebaseDb;
export const googleProvider = new GoogleAuthProvider();
