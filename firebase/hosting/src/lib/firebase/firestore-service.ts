
'use server';

import { db as clientDb, adminDb } from './config'; // Import both client and admin Firestore instances
import type { User } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp as ClientTimestamp, // Alias to avoid conflict if admin also has Timestamp
  DocumentData,
} from 'firebase/firestore';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';


export interface RoundResultData {
  roundId: string;
  title: string;
  score: number;
  trials: number;
  averageResponseTimeSeconds: number;
}

export interface StroopSessionData {
  userId: string;
  timestamp: ClientTimestamp | AdminTimestamp | Date; 
  [key: string]: any;
}

export interface FetchedStroopSession extends DocumentData {
  id: string;
  userId: string;
  timestamp: ClientTimestamp | AdminTimestamp; // Firestore Timestamps can be from client or admin SDK
  [key: string]: any;
}

export async function saveStroopSession(
  userId: string,
  sessionData: Omit<StroopSessionData, 'userId' | 'timestamp'> & { timestamp: Date }
): Promise<{ success: boolean; error?: any; sessionId?: string }> {
  if (!userId) {
    console.error('[firestore-service] User ID is required to save session.');
    return { success: false, error: 'User ID is required.' };
  }
  try {
    const sessionToSave: StroopSessionData = {
      ...sessionData,
      userId, 
      timestamp: sessionData.timestamp, // Keep as JS Date, Admin SDK handles conversion
    };
    console.log(`[firestore-service - admin] Attempting to save session for userId: ${userId}. Data to save:`, JSON.stringify(sessionToSave, null, 2));
    
    // Using Admin SDK for this server-side write
    const docRef = await adminDb.collection('users').doc(userId).collection('stroopSessions').add(sessionToSave);
    console.log(`[firestore-service - admin] Session saved successfully for userId: ${userId}, sessionId: ${docRef.id}`);
    return { success: true, sessionId: docRef.id };
  } catch (error: any) {
    console.error(`[firestore-service - admin] Error saving Stroop session for userId: ${userId}. Error:`, error);
    const clientError: { message: string; code?: string; details?: string } = {
      message: typeof error.message === 'string' ? error.message : 'Failed to save session.',
      code: typeof error.code === 'string' ? error.code : 'UNKNOWN_SAVE_ERROR',
      details: error.details || (error.toString ? error.toString() : "No additional details")
    };
    return { success: false, error: clientError };
  }
}

export async function getUserStroopSessions(
  userId: string
): Promise<{ success: boolean; data?: FetchedStroopSession[]; error?: string }> { 
  console.log('[firestore-service - admin] Attempting to fetch sessions for userId:', userId);
  if (!userId) {
    console.error('[firestore-service - admin] User ID is required to fetch sessions.');
     return { success: false, error: 'User ID is required.' };
  }
  try {
    // Using Admin SDK for this server-side read. This bypasses security rules.
    const sessionsColRef = adminDb.collection('users').doc(userId).collection('stroopSessions');
    const q = sessionsColRef.orderBy('timestamp', 'desc');
    console.log('[firestore-service - admin] Executing query for path:', `users/${userId}/stroopSessions with orderBy timestamp desc`);
    
    const querySnapshot = await q.get();
    console.log(`[firestore-service - admin] Query snapshot received. Empty: ${querySnapshot.empty}. Size: ${querySnapshot.size}`);
    
    const sessions: FetchedStroopSession[] = [];
    querySnapshot.forEach((doc) => {
      // Data from Admin SDK will have Admin Timestamps. Cast as FetchedStroopSession.
      sessions.push({ id: doc.id, ...doc.data() } as FetchedStroopSession);
    });
    console.log(`[firestore-service - admin] Fetched ${sessions.length} sessions for userId: ${userId}`);
    return { success: true, data: sessions };
  } catch (error: any) {
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected error occurred while fetching data.';
    const errorCode = typeof error.code === 'string' ? error.code : 'UNKNOWN_FETCH_ERROR';
    
    console.error(
      `[firestore-service - admin] Error fetching user Stroop sessions for userId: ${userId}. Code: ${errorCode}, Message: ${errorMessage}`,
      { originalErrorObjectDetails: JSON.stringify(error, Object.getOwnPropertyNames(error)) }
    );
    
    return { success: false, error: errorMessage };
  }
}
