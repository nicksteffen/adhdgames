
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore as getClientFirestore, type Firestore as ClientFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Client Firebase App Initialization (remains the same)
const firebaseConfig = {
  apiKey: "AIzaSyCyIj3n7Ned3CycN1LuuNze0avQil8yjI8",
  authDomain: "adhdgames-15570.firebaseapp.com",
  projectId: "adhdgames-15570",
  storageBucket: "adhdgames-15570.firebasestorage.app",
  messagingSenderId: "32647423969",
  appId: "1:32647423969:web:b72420acb51a82545754a0",
  measurementId: "G-W5KQ1PX5B4"
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: ClientFirestore = getClientFirestore(app); // This is the client Firestore instance

let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics", error);
  }
}

// Admin SDK - to be initialized and used only on the server
let adminAppInstance: import('firebase-admin/app').App | null = null;
let adminDbInstance: import('firebase-admin/firestore').Firestore | null = null;

async function initializeAdminSDK() {
  if (typeof window !== 'undefined') {
    // This function should ideally not even be callable from client-side code.
    // The dynamic import below is the primary guard.
    console.warn("Attempted to initialize Firebase Admin SDK on the client. This is a misconfiguration.");
    return;
  }
  if (!adminAppInstance) {
    // Dynamically import firebase-admin ONLY on the server
    const admin = (await import('firebase-admin')).default;
    if (!admin.apps.length) {
      // For Firebase App Hosting, initializeApp() without arguments works.
      // For local dev, GOOGLE_APPLICATION_CREDENTIALS env var should be set.
      // If you need to explicitly pass credentials (e.g., for local dev without env var):
      // const serviceAccount = require('/path/to/your/serviceAccountKey.json'); // Adjust path as needed
      // adminAppInstance = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      adminAppInstance = admin.initializeApp();
      console.log('[config.ts] Firebase Admin SDK initialized.');
    } else {
      adminAppInstance = admin.app();
      console.log('[config.ts] Firebase Admin SDK already initialized.');
    }
    adminDbInstance = adminAppInstance.firestore();
  }
}

// Getter for Admin DB to ensure it's initialized (server-side only)
export async function getAdminDb(): Promise<import('firebase-admin/firestore').Firestore> {
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminDb) can only be used on the server.");
  }
  if (!adminDbInstance) {
    await initializeAdminSDK();
  }
  if (!adminDbInstance) {
    // This case should ideally be prevented by initializeAdminSDK's logic
    throw new Error("Firebase Admin SDK Firestore instance could not be initialized or is not yet available.");
  }
  return adminDbInstance;
}

export async function getAdminApp(): Promise<import('firebase-admin/app').App> {
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminApp) can only be used on the server.");
  }
  if (!adminAppInstance) {
    await initializeAdminSDK();
  }
  if (!adminAppInstance) {
     // This case should ideally be prevented by initializeAdminSDK's logic
    throw new Error("Firebase Admin SDK App instance could not be initialized or is not yet available.");
  }
  return adminAppInstance;
}

// Export client SDK instances directly
export { app, auth, db, analytics };
