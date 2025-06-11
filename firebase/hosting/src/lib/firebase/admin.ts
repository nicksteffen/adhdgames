
import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let initializationStatus: 'uninitialized' | 'initializing' | 'initialized' | 'failed' = 'uninitialized';
let initErrorDetails: string | null = null; 

// A simple promise to ensure performInitialization only runs once concurrently
let initPromise: Promise<void> | null = null;

async function performInitialization(): Promise<void> {
    if (typeof window !== 'undefined') {
        initErrorDetails = "Firebase Admin SDK cannot be initialized on the client.";
        initializationStatus = 'failed';
        console.warn(`[admin.ts] ${initErrorDetails}`);
        adminApp = null;
        adminDb = null;
        return;
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
        initErrorDetails = null; // Clear any previous error on success
        initializationStatus = 'initialized';
        console.log('[admin.ts] Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
        console.error("[admin.ts] CRITICAL: Firebase Admin SDK initialization failed. Message:", error.message, "Code:", error.code);
        initErrorDetails = `Admin SDK Init Failed: ${error.message || 'Unknown initialization error'}${error.code ? ` (Code: ${error.code})` : ''}`;
        initializationStatus = 'failed';
        adminApp = null; // Ensure they are null on failure
        adminDb = null;
    }
}

async function ensureInitialized(): Promise<void> {
    if (initializationStatus === 'initialized' || (initializationStatus === 'failed' && initErrorDetails?.includes("cannot be initialized on the client"))) {
        return;
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = performInitialization().finally(() => {
        initPromise = null; // Clear the promise once it's settled
    });

    return initPromise;
}

export async function getAdminDb(): Promise<Firestore> {
  if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminDb) attempted to run on the client. This should not happen.");
  }
  
  await ensureInitialized();

  if (initializationStatus === 'failed' || !adminDb) {
    console.error(`[admin.ts] getAdminDb: Admin SDK failed or db not available. Status: ${initializationStatus}. Error: ${initErrorDetails}`);
    throw new Error(`Admin SDK not initialized. Reason: ${initErrorDetails || 'Unknown initialization failure.'}`);
  }
  return adminDb;
}

export async function getAdminApp(): Promise<App> {
   if (typeof window !== 'undefined') {
    throw new Error("Firebase Admin SDK (getAdminApp) attempted to run on the client. This should not happen.");
  }

  await ensureInitialized();

  if (initializationStatus === 'failed' || !adminApp) {
     console.error(`[admin.ts] getAdminApp: Admin SDK failed or app not available. Status: ${initializationStatus}. Error: ${initErrorDetails}`);
    throw new Error(`Admin SDK App not initialized. Reason: ${initErrorDetails || 'Unknown initialization failure.'}`);
  }
  return adminApp;
}
