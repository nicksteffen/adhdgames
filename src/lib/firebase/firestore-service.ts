
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
  // round data
  round1Id?: string;
  round1Title?: string;
  round1Score?: number;
  round1Trials?: number;
  round1AverageResponseTimeSeconds?: number;
  round2Id?: string;
  round2Title?: string;
  round2Score?: number;
  round2Trials?: number;
  round2AverageResponseTimeSeconds?: number;
  // Add more rounds if configured in the game
}

export async function saveStroopSession(
  userId: string,
  sessionData: Omit<StroopSessionData, 'userId' | 'timestamp'> & { timestamp: Date }
): Promise<{ success: boolean; error?: any; sessionId?: string }> {
  if (!userId) {
    console.error('User ID is required to save session.');
    return { success: false, error: 'User ID is required.' };
  }
  try {
    const sessionToSave: StroopSessionData = {
      ...sessionData,
      userId, // Ensure userId is part of the document
    };
    const docRef = await addDoc(collection(db, 'users', userId, 'stroopSessions'), sessionToSave);
    return { success: true, sessionId: docRef.id };
  } catch (error) {
    console.error('Error saving Stroop session:', error);
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
    // Temporarily remove orderBy for diagnostics. If this works, an index is needed.
    // const q = query(sessionsColRef, orderBy('timestamp', 'desc'));
    const q = query(sessionsColRef); // Query without orderBy
    console.log('[firestore-service] Executing query for path:', `users/${userId}/stroopSessions`);
    const querySnapshot = await getDocs(q);
    const sessions: FetchedStroopSession[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as FetchedStroopSession);
    });
    console.log(`[firestore-service] Fetched ${sessions.length} sessions for userId: ${userId}`);
    return { success: true, data: sessions };
  } catch (error) {
    console.error('[firestore-service] Error fetching user Stroop sessions:', error);
    return { success: false, error };
  }
}

