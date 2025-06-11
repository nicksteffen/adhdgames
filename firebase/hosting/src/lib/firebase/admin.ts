
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminInitError: Error | null = null;
let initPromise: Promise<void> | null = null;

async function initializeAdmin() {
    // If already initialized successfully, return
    if (adminApp && adminDb && !adminInitError) {
        return;
    }
    // If initialization previously failed, throw the stored error
    if (adminInitError) {
        throw adminInitError;
    }

    // If initialization is already in progress, wait for it
    if (initPromise) {
        return initPromise;
    }

    // Start initialization
    initPromise = (async () => {
        if (typeof window !== 'undefined') {
            console.warn("[admin.ts] Firebase Admin SDK cannot be initialized on the client.");
            adminInitError = new Error("Firebase Admin SDK cannot be initialized on the client.");
            throw adminInitError;
        }

        console.log('[admin.ts] Attempting to initialize Firebase Admin SDK...');
        if (process.env.NODE_ENV === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            console.warn(`[admin.ts] WARNING: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set for local development. 
                    Firebase Admin SDK might not initialize correctly. 
                    You may see 'Could not refresh access token' or permission errors.
                    Ensure the variable points to your service account JSON key file.
                    See https://firebase.google.com/docs/admin/setup#initialize-sdk for setup instructions.`);
        }

        try {
            if (!admin.apps.length) {
                console.log('[admin.ts] No existing admin apps. Calling admin.initializeApp()...');
                adminApp = admin.initializeApp();
            } else {
                adminApp = admin.app();
                console.log('[admin.ts] Using existing Firebase Admin app.');
            }
            adminDb = adminApp.firestore();
            adminInitError = null; // Clear any previous error on success
            console.log('[admin.ts] Firebase Admin SDK initialized successfully.');
        } catch (error: any) {
            console.error("[admin.ts] CRITICAL: Firebase Admin SDK initialization failed:", error.message, error.code);
            // It's useful to log the stack in the server console but not necessarily send it to the client
            if (error.stack) {
                console.error("[admin.ts] Stack:", error.stack);
            }
            adminInitError = error;
            throw error; // Re-throw to be caught by callers or the top-level error handler
        } finally {
            initPromise = null; // Clear the promise once initialization attempt is done (success or fail)
        }
    })();
    
    return initPromise;
}

export async function getAdminDb(): Promise<Firestore> {
  if (typeof window !== 'undefined') {
    // This check is redundant if initializeAdmin handles it, but good for clarity
    throw new Error("Firebase Admin SDK (getAdminDb) can only be used on the server.");
  }
  
  if (!adminDb || adminInitError) {
    await initializeAdmin(); // Ensures initialization is attempted/completed
  }

  if (adminInitError) { // Check if initialization failed during the attempt
    throw adminInitError;
  }

  if (!adminDb) { // This should ideally not be reached if initializeAdmin works correctly
    console.error("[admin.ts] Admin DB instance is null after initialization attempt in getAdminDb.");
    throw new Error("Firebase Admin SDK Firestore instance is not available after initialization.");
  }
  return adminDb;
}

export async function getAdminApp(): Promise<App> {
   if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminApp) can only be used on the server.");
  }

  if (!adminApp || adminInitError) {
    await initializeAdmin(); // Ensures initialization is attempted/completed
  }

  if (adminInitError) { // Check if initialization failed
    throw adminInitError;
  }

  if (!adminApp) { // This should ideally not be reached
    console.error("[admin.ts] Admin App instance is null after initialization attempt in getAdminApp.");
    throw new Error("Firebase Admin SDK App instance is not available after initialization.");
  }
  return adminApp;
}
