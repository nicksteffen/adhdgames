
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore as getClientFirestore, type Firestore as ClientFirestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCyIj3n7Ned3CycN1LuuNze0avQil8yjI8",
  authDomain: "adhdgames-15570.firebaseapp.com",
  projectId: "adhdgames-15570",
  storageBucket: "adhdgames-15570.firebasestorage.app",
  messagingSenderId: "32647423969",
  appId: "1:32647423969:web:b72420acb51a82545754a0",
  measurementId: "G-W5KQ1PX5B4"
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: ClientFirestore | null = null;
let analyticsInstance: Analytics | null = null;

function initializeClientFirebase(): FirebaseApp {
  if (!app) {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
  }
  return app;
}

export function getClientAuth(): Auth {
  if (!authInstance) {
    if (typeof window === 'undefined') {
      // This case should ideally not be hit if only called from client components
      // but as a safeguard for build analysis:
      throw new Error("Firebase client auth (getClientAuth) should only be called on the client.");
    }
    const currentApp = initializeClientFirebase();
    authInstance = getAuth(currentApp);
  }
  return authInstance;
}

export function getClientDb(): ClientFirestore {
  if (!dbInstance) {
    if (typeof window === 'undefined') {
      throw new Error("Firebase client Firestore (getClientDb) should only be called on the client.");
    }
    const currentApp = initializeClientFirebase();
    dbInstance = getClientFirestore(currentApp);
  }
  return dbInstance;
}

export function getClientAnalytics(): Analytics | null {
  if (typeof window !== 'undefined') {
    if (!analyticsInstance) {
      try {
        const currentApp = initializeClientFirebase();
        analyticsInstance = getAnalytics(currentApp);
      } catch (error) {
        console.error("[config.ts] Failed to initialize Firebase Analytics (client-side):", error);
        analyticsInstance = null; 
      }
    }
    return analyticsInstance;
  }
  return null;
}

// Export the app instance if needed directly, but prefer getters for services
export { app as firebaseApp };
