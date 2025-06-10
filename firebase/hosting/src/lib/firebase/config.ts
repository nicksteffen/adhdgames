
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
    console.error("[config.ts] Failed to initialize Firebase Analytics (client-side):", error);
  }
}

// Admin SDK - to be initialized and used only on the server
let adminAppInstance: import('firebase-admin/app').App | null = null;
let adminDbInstance: import('firebase-admin/firestore').Firestore | null = null;
let adminInitError: Error | null = null;
let adminInitialized = false;

async function initializeAdminSDK() {
  if (typeof window !== 'undefined') {
    console.warn("[config.ts] Attempted to initialize Firebase Admin SDK on the client. This is a misconfiguration and will be skipped.");
    adminInitError = new Error("Firebase Admin SDK cannot be initialized on the client.");
    return;
  }

  if (adminInitialized) {
    // console.log('[config.ts] Firebase Admin SDK initialization already attempted.');
    if (adminInitError) throw adminInitError; // Re-throw previous init error
    if (adminAppInstance && adminDbInstance) return; // Already successfully initialized
    // If somehow initialized but instances are null, this is an unexpected state
    throw new Error("Firebase Admin SDK was marked initialized but instances are missing.");
  }
  adminInitialized = true; // Mark that we are attempting/have attempted initialization

  try {
    // Dynamically import firebase-admin ONLY on the server
    const admin = (await import('firebase-admin')).default;
    if (!admin.apps.length) {
      console.log('[config.ts] Initializing Firebase Admin SDK...');
      // For Firebase App Hosting, initializeApp() without arguments works.
      // For local dev, GOOGLE_APPLICATION_CREDENTIALS env var should be set.
      // Check if GOOGLE_APPLICATION_CREDENTIALS is set for local dev
      if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.warn(`[config.ts] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set. 
                      Firebase Admin SDK might not initialize correctly for local development. 
                      You may see 'Could not refresh access token' or permission errors.
                      See https://firebase.google.com/docs/admin/setup#initialize-sdk for setup instructions.`);
      }
      adminAppInstance = admin.initializeApp();
      console.log('[config.ts] Firebase Admin SDK initialized successfully.');
    } else {
      adminAppInstance = admin.app();
      console.log('[config.ts] Firebase Admin SDK already initialized, using existing app.');
    }
    adminDbInstance = adminAppInstance.firestore();
    adminInitError = null; // Clear any previous error on successful init
  } catch (error: any) {
    console.error("[config.ts] CRITICAL: Firebase Admin SDK initialization failed:", error);
    adminInitError = error; // Store the initialization error
    // Rethrow or handle as appropriate for your app's error strategy
    throw error;
  }
}

export async function getAdminDb(): Promise<import('firebase-admin/firestore').Firestore> {
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminDb) can only be used on the server.");
  }
  if (!adminDbInstance || adminInitError) { // Check for init error too
    console.log('[config.ts] Admin DB instance not available or init error occurred, attempting to initialize Admin SDK for getAdminDb...');
    await initializeAdminSDK(); // This will throw if init fails
  }
  if (!adminDbInstance) {
    console.error("[config.ts] Admin DB instance is null after initialization attempt in getAdminDb.");
    throw new Error("Firebase Admin SDK Firestore instance could not be initialized or is not yet available after attempt.");
  }
  return adminDbInstance;
}

export async function getAdminApp(): Promise<import('firebase-admin/app').App> {
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminApp) can only be used on the server.");
  }
  if (!adminAppInstance || adminInitError) { // Check for init error too
    console.log('[config.ts] Admin App instance not available or init error occurred, attempting to initialize Admin SDK for getAdminApp...');
    await initializeAdminSDK(); // This will throw if init fails
  }
  if (!adminAppInstance) {
    console.error("[config.ts] Admin App instance is null after initialization attempt in getAdminApp.");
    throw new Error("Firebase Admin SDK App instance could not be initialized or is not yet available after attempt.");
  }
  return adminAppInstance;
}

// Export client SDK instances directly
export { app, auth, db, analytics };
