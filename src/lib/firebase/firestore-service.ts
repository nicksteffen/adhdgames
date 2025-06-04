
'use server';

import { db } from '@/lib/firebase/config';
import type { User } from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';

export interface RoundResultData {
  roundId: string;
  title: string;
  score: number;
  trials: number;
  averageResponseTimeSeconds: number;
}

export interface StroopSessionData {
  userId: string;
  timestamp: Timestamp | Date; // Will be Date from client, Timestamp in Firestore
  // Dynamically added round data e.g. round1Score, round1Trials etc.
  [key: string]: any;
}

export interface FetchedStroopSession extends DocumentData {
  id: string;
  userId: string;
  timestamp: Timestamp; // Firestore Timestamps are fetched as such
  // Allows for any additional keys, which will include dynamic round data
  // e.g., round1Id, round1Score, round2Id, round2Score, etc.
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
      userId, // Ensure userId is part of the document
    };
    // Firestore will automatically convert the Date object in sessionData.timestamp to a Firestore Timestamp
    const docRef = await addDoc(collection(db, 'users', userId, 'stroopSessions'), sessionToSave);
    console.log(`[firestore-service] Session saved successfully for userId: ${userId}, sessionId: ${docRef.id}`);
    return { success: true, sessionId: docRef.id };
  } catch (error) {
    console.error('[firestore-service] Error saving Stroop session for userId:', userId, 'Error:', error);
    return { success: false, error };
  }
}

export async function getUserStroopSessions(
  userId: string
): Promise<{ success: boolean; data?: FetchedStroopSession[]; error?: any }> {
  console.log('[firestore-service] Attempting to fetch sessions for userId:', userId);
  if (!userId) {
    console.error('[firestore-service] User ID is required to fetch sessions.');
     return { success: false, error: 'User ID is required.' };
  }
  try {
    const sessionsColRef = collection(db, 'users', userId, 'stroopSessions');
    // Retain orderBy for proper diagnostics. If this fails, it's likely an index issue.
    const q = query(sessionsColRef, orderBy('timestamp', 'desc'));
    console.log('[firestore-service] Executing query for path:', `users/${userId}/stroopSessions with orderBy timestamp desc`);
    
    const querySnapshot = await getDocs(q);
    console.log(`[firestore-service] Query snapshot received. Empty: ${querySnapshot.empty}. Size: ${querySnapshot.size}`);
    
    const sessions: FetchedStroopSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as FetchedStroopSession);
    });
    console.log(`[firestore-service] Fetched ${sessions.length} sessions for userId: ${userId}`);
    return { success: true, data: sessions };
  } catch (error: any) {
    console.error(`[firestore-service] Error fetching user Stroop sessions for userId: ${userId}. Error Code: ${error.code}, Message: ${error.message}`, { errorObj: error });
    // Propagate the specific error message and code if available
    return { success: false, error: { message: error.message, code: error.code, originalError: error } };
  }
}
