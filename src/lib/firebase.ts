import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: config.apiKey,
  authDomain: config.authDomain,
  projectId: config.projectId,
  storageBucket: config.storageBucket,
  messagingSenderId: config.messagingSenderId,
  appId: config.appId,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const databaseId = config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
  ? config.firestoreDatabaseId
  : undefined;

export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Strict Undefined-Stripping (Zero-Crash Payload Hygiene)
 * Eliminates undefined properties from payloads before saving to Firestore.
 */
export function sanitizePayload<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_, value) => (value === undefined ? null : value)));
}
