
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore as getClientFirestore, type Firestore as ClientFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// Client Firebase App Initialization
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
// let adminAppInstance: import('firebase-admin/app').App | null = null;
// let adminDbInstance: import('firebase-admin/firestore').Firestore | null = null;
// let adminInitError: Error | null = null;
// let adminInitializedAttempted = false;

// async function initializeAdminSDK() {
//   if (typeof window !== 'undefined') {
//     console.warn("[config.ts] Attempted to initialize Firebase Admin SDK on the client. This is a misconfiguration and will be skipped.");
//     adminInitError = new Error("Firebase Admin SDK cannot be initialized on the client.");
//     adminInitializedAttempted = true; // Mark attempt even if skipped client-side
//     return;
//   }

//   if (adminInitializedAttempted) {
//     // console.log('[config.ts] Firebase Admin SDK initialization already attempted.');
//     if (adminInitError) throw adminInitError; 
//     if (adminAppInstance && adminDbInstance) return; 
//     if (!adminInitError && (!adminAppInstance || !adminDbInstance)) {
//         console.warn('[config.ts] Admin SDK was marked initialized but instances are missing. Re-attempting...');
//         // Resetting to allow re-attempt, this path should ideally not be hit often.
//         adminAppInstance = null;
//         adminDbInstance = null;
//         adminInitializedAttempted = false; 
//     } else if (adminInitError) {
//         throw adminInitError;
//     } else {
//          return; // Successfully initialized previously
//     }
//   }
//   adminInitializedAttempted = true;

//   console.log('[config.ts] Attempting to initialize Firebase Admin SDK...');
//   console.log(`[config.ts] NODE_ENV: ${process.env.NODE_ENV}`);
//   if (process.env.NODE_ENV === 'development') {
//     console.log(`[config.ts] GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? 'Set - Path: ' + process.env.GOOGLE_APPLICATION_CREDENTIALS : 'Not Set'}`);
//     if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//       console.warn(`[config.ts] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set for local development. 
//                     Firebase Admin SDK might not initialize correctly. 
//                     You may see 'Could not refresh access token' or permission errors.
//                     Ensure the variable points to your service account JSON key file.
//                     See https://firebase.google.com/docs/admin/setup#initialize-sdk for setup instructions.`);
//     }
//   }

//   try {
//     const admin = (await import('firebase-admin')).default;
//     if (!admin.apps.length) {
//       console.log('[config.ts] No existing admin apps. Calling admin.initializeApp()...');
//       adminAppInstance = admin.initializeApp();
//       console.log('[config.ts] Firebase Admin SDK initialized successfully via initializeApp().');
//     } else {
//       adminAppInstance = admin.app();
//       console.log('[config.ts] Firebase Admin SDK already initialized, using existing app.');
//     }
//     adminDbInstance = adminAppInstance.firestore();
//     adminInitError = null;
//   } catch (error: any) {
//     console.error("[config.ts] CRITICAL: Firebase Admin SDK initialization failed:", error.message, error.code, error.stack);
//     adminInitError = error; 
//     throw error;
//   }
// }

// export async function getAdminDb(): Promise<import('firebase-admin/firestore').Firestore> {
//   if (typeof window !== 'undefined') {
//     throw new Error("Firebase Admin SDK (getAdminDb) can only be used on the server.");
//   }
//   if (!adminDbInstance || adminInitError) {
//     console.log('[config.ts] Admin DB instance not available or init error, ensuring Admin SDK is initialized for getAdminDb...');
//     await initializeAdminSDK(); // This will throw if init fails
//   }
//   if (!adminDbInstance) {
//     console.error("[config.ts] Admin DB instance is null after initialization attempt in getAdminDb.");
//     throw new Error("Firebase Admin SDK Firestore instance could not be initialized or is not yet available after attempt.");
//   }
//   return adminDbInstance;
// }

// export async function getAdminApp(): Promise<import('firebase-admin/app').App> {
//   if (typeof window !== 'undefined') {
//     throw new Error("Firebase Admin SDK (getAdminApp) can only be used on the server.");
//   }
//   if (!adminAppInstance || adminInitError) {
//     console.log('[config.ts] Admin App instance not available or init error, ensuring Admin SDK is initialized for getAdminApp...');
//     await initializeAdminSDK(); // This will throw if init fails
//   }
//   if (!adminAppInstance) {
//     console.error("[config.ts] Admin App instance is null after initialization attempt in getAdminApp.");
//     throw new Error("Firebase Admin SDK App instance could not be initialized or is not yet available after attempt.");
//   }
//   return adminAppInstance;
// }

// Export client SDK instances directly
export { app, auth, db, analytics };
