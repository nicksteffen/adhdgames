
'use server';

import { getAdminDb } from './admin';
import type { Timestamp as AdminTimestamp, DocumentData } from 'firebase-admin/firestore';


export interface RoundResultData {
  roundId: string;
  title: string;
  score: number;
  trials: number;
  averageResponseTimeSeconds: number;
}

export interface StroopSessionData {
  userId: string;
  timestamp: AdminTimestamp | Date; 
  [key: string]: any;
}

export interface FetchedStroopSession extends DocumentData {
  id: string;
  userId: string;
  timestamp: string; 
  [key: string]: any;
}

export async function saveStroopSession(
  userId: string,
  sessionData: Omit<StroopSessionData, 'userId' | 'timestamp'> & { timestamp: Date }
): Promise<{ success: boolean; error?: string; sessionId?: string }> { // Changed error type to string
  console.log(`[firestore-service - admin] saveStroopSession called for userId: ${userId}.`);
  if (!userId) {
    console.error('[firestore-service - admin] User ID is required to save session.');
    return { success: false, error: 'User ID is required.' };
  }
  try {
    const adminDbInstance = await getAdminDb();
    const sessionToSave: StroopSessionData = {
      ...sessionData,
      userId,
      timestamp: sessionData.timestamp, 
    };
    console.log(`[firestore-service - admin] Attempting to save session for userId: ${userId}. Data (excluding large fields for brevity):`,
      { userId: sessionToSave.userId, timestamp: sessionToSave.timestamp, round1Id: sessionToSave.round1Id, round2Id: sessionToSave.round2Id }
    );

    const docRef = await adminDbInstance.collection('users').doc(userId).collection('stroopSessions').add(sessionToSave);
    console.log(`[firestore-service - admin] Session saved successfully for userId: ${userId}, sessionId: ${docRef.id}`);
    return { success: true, sessionId: docRef.id };
  } catch (error: any) {
    console.error(`[firestore-service - admin] Error saving Stroop session for userId: ${userId}. Error:`, error.message, error.stack, error.code, error.details);
    const errorMessage = `Failed to save session. Server: ${error.message || 'Unknown error'}${error.code ? ` (Code: ${error.code})` : ''}`;
    return { success: false, error: errorMessage }; // Return a simple string error
  }
}

export async function getUserStroopSessions(
  userId: string
): Promise<{ success: boolean; data?: FetchedStroopSession[]; error?: string }> {
  console.log('[firestore-service - admin] getUserStroopSessions called for userId:', userId);
  if (!userId) {
    console.error('[firestore-service - admin] User ID is required to fetch sessions.');
     return { success: false, error: 'User ID is required.' };
  }
  try {
    const adminDbInstance = await getAdminDb();
    const sessionsColRef = adminDbInstance.collection('users').doc(userId).collection('stroopSessions');
    const q = sessionsColRef.orderBy('timestamp', 'desc');
    console.log('[firestore-service - admin] Executing query for path:', `users/${userId}/stroopSessions with orderBy timestamp desc`);

    const querySnapshot = await q.get();
    console.log(`[firestore-service - admin] Query snapshot received. Empty: ${querySnapshot.empty}. Size: ${querySnapshot.size}`);

    const sessions: FetchedStroopSession[] = [];
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      const timestamp = docData.timestamp as AdminTimestamp;
      sessions.push({
        id: doc.id,
        ...docData,
        timestamp: timestamp.toDate().toISOString(), 
      } as FetchedStroopSession); 
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
