
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore as getClientFirestore, type Firestore as ClientFirestore } from "firebase/firestore"; // Renamed client Firestore
import { getAnalytics, type Analytics } from "firebase/analytics";

// Import Firebase Admin SDK
import admin from 'firebase-admin';
import type { App as AdminApp, Firestore as AdminFirestore } from 'firebase-admin/app';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:"AIzaSyCyIj3n7Ned3CycN1LuuNze0avQil8yjI8",
  authDomain:"adhdgames-15570.firebaseapp.com",
  projectId: "adhdgames-15570",
  storageBucket: "adhdgames-15570.firebasestorage.app",
  messagingSenderId: "32647423969",
  appId: "1:32647423969:web:b72420acb51a82545754a0",
  measurementId: "G-W5KQ1PX5B4"
};

// Client Firebase App Initialization
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

// Firebase Admin SDK Initialization
let adminApp: AdminApp;
let adminDb: AdminFirestore;

if (!admin.apps.length) {
  // For local development, you would typically use a service account:
  // import serviceAccount from './path/to/your/serviceAccountKey.json'; // YOU NEED TO PROVIDE THIS
  // adminApp = admin.initializeApp({
  //   credential: admin.credential.cert(serviceAccount),
  //   // databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com` // Optional if using default
  // });
  //
  // On Firebase App Hosting or Cloud Functions, it initializes with Application Default Credentials:
  adminApp = admin.initializeApp();
  console.log('[config.ts] Firebase Admin SDK initialized without explicit credentials (expected for App Hosting).');
} else {
  adminApp = admin.app();
  console.log('[config.ts] Firebase Admin SDK already initialized.');
}

adminDb = adminApp.firestore();

export { app, auth, db, analytics, adminDb, adminApp }; // Export adminDb and adminApp
