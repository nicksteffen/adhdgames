
'use server';

import { getAdminDb } from './admin';
import type { Timestamp as AdminTimestamp, DocumentData } from 'firebase-admin/firestore';
import { Timestamp as ClientTimestamp } from 'firebase/firestore'; // For type checking client-like timestamps


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

// This type will be used by client components. Timestamp is now a string (ISO format).
export interface FetchedStroopSession extends DocumentData {
  id: string;
  userId: string;
  timestamp: string;
  [key: string]: any;
}

export async function saveStroopSession(
  userId: string,
  sessionData: Omit<StroopSessionData, 'userId' | 'timestamp'> & { timestamp: Date }
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
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
    return { success: false, error: errorMessage };
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
      let isoTimestamp: string;

      const timestampField = docData.timestamp;

      if (timestampField && typeof timestampField.toDate === 'function') {
        // Likely a Firestore Admin Timestamp
        isoTimestamp = (timestampField as AdminTimestamp).toDate().toISOString();
      } else if (timestampField && typeof timestampField === 'object' && timestampField.seconds !== undefined && timestampField.nanoseconds !== undefined) {
        // Likely a Firestore Client Timestamp that was serialized directly
        // Note: This uses the Client Timestamp constructor, ensure 'firebase/firestore' is available if this path is hit server-side
        // For server actions, it's generally better to ensure data is saved as AdminTimestamp or JS Date.
        try {
            const clientTimestamp = new ClientTimestamp(timestampField.seconds, timestampField.nanoseconds);
            isoTimestamp = clientTimestamp.toDate().toISOString();
        } catch (e) {
            console.warn(`[firestore-service - admin] Error converting client-like timestamp for doc ${doc.id}:`, e);
            isoTimestamp = new Date(0).toISOString(); // Fallback
        }
      } else if (typeof timestampField === 'string') {
        const parsedDate = new Date(timestampField);
        if (!isNaN(parsedDate.getTime())) {
            isoTimestamp = parsedDate.toISOString();
        } else {
            console.warn(`[firestore-service - admin] Invalid string timestamp found for doc ${doc.id}:`, timestampField);
            isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
        }
      } else if (typeof timestampField === 'number') { // Handle Unix epoch milliseconds
        const parsedDate = new Date(timestampField);
        if (!isNaN(parsedDate.getTime())) {
            isoTimestamp = parsedDate.toISOString();
        } else {
            console.warn(`[firestore-service - admin] Invalid numeric timestamp found for doc ${doc.id}:`, timestampField);
            isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
        }
      }
      else {
        console.warn(`[firestore-service - admin] Missing or unparseable timestamp for doc ${doc.id}. Using epoch as fallback.`);
        isoTimestamp = new Date(0).toISOString(); // Fallback to epoch or a very old date
      }

      sessions.push({
        id: doc.id,
        ...docData,
        timestamp: isoTimestamp,
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
