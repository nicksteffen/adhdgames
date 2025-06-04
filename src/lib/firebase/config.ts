
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCyIj3n7Ned3CycN1LuuNze0avQil8yjI8",
  authDomain: "adhdgames-15570.firebaseapp.com",
  projectId: "adhdgames-15570",
  storageBucket: "adhdgames-15570.firebasestorage.app",
  messagingSenderId: "32647423969",
  appId: "1:32647423969:web:b72420acb51a82545754a0",
  measurementId: "G-W5KQ1PX5B4"
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

// Initialize Analytics only in the browser environment
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Analytics", error);
    // Analytics might not be available in all environments (e.g. server-side during build)
    // Or if not correctly set up in Firebase console.
  }
}


export { app, auth, db, analytics };
