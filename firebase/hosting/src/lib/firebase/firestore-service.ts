
'use server';

import { getAdminDb } from './admin';
import type { Timestamp as AdminTimestamp, DocumentData } from 'firebase-admin/firestore';
// Removed direct import of ClientTimestamp as it's not needed for instanceof checks in admin context
// import { Timestamp as ClientTimestamp } from 'firebase/firestore'; 


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
  overallAccuracy?: number;
  totalGameTimeSeconds?: number;
  [key: string]: any; 
}

export interface FetchedStroopSession {
  id: string;
  userId: string;
  timestamp: string; // ISO string

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
  
  overallAccuracy?: number;
  totalGameTimeSeconds?: number;
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
    console.error(`[firestore-service - admin] Error saving Stroop session for userId: ${userId}. Error:`, error.message, error.code, error.details);
    const clientErrorMessage = `Failed to save session. Server error: ${error.message || 'Unknown error'}${error.code ? ` (Code: ${error.code})` : ''}`;
    return { success: false, error: clientErrorMessage };
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
      const docData = doc.data() as DocumentData; 
      let isoTimestamp: string;
      const timestampField = docData.timestamp;

      if (timestampField && typeof timestampField.toDate === 'function') {
        // Handles Firestore Admin Timestamps and JS Date objects
        try {
            isoTimestamp = timestampField.toDate().toISOString();
        } catch (e) {
             console.warn(`[firestore-service - admin] Error converting timestamp field with .toDate() for doc ${doc.id}:`, e);
             isoTimestamp = new Date(0).toISOString(); // Fallback
        }
      } else if (timestampField && typeof timestampField === 'object' && 
                 typeof timestampField.seconds === 'number' && 
                 typeof timestampField.nanoseconds === 'number') {
        // Handles plain objects resembling Firestore Timestamps (e.g., from client-side or direct JSON)
        try {
            const dateFromObject = new Date(timestampField.seconds * 1000 + timestampField.nanoseconds / 1000000);
            if (isNaN(dateFromObject.getTime())) {
                throw new Error("Invalid date created from object-like timestamp");
            }
            isoTimestamp = dateFromObject.toISOString();
        } catch (e) {
            console.warn(`[firestore-service - admin] Error converting object-like timestamp for doc ${doc.id}:`, timestampField, e);
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
      } else if (typeof timestampField === 'number') { // Assume Unix epoch milliseconds
        const parsedDate = new Date(timestampField);
         if (!isNaN(parsedDate.getTime())) {
            isoTimestamp = parsedDate.toISOString();
        } else {
            console.warn(`[firestore-service - admin] Invalid numeric timestamp found for doc ${doc.id}:`, timestampField);
            isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
        }
      } else {
        console.warn(`[firestore-service - admin] Missing or unparseable timestamp for doc ${doc.id}. Path: users/${userId}/stroopSessions/${doc.id}. Data:`, timestampField, `. Using epoch as fallback.`);
        isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
      }

      const session: FetchedStroopSession = {
        id: doc.id,
        userId: docData.userId as string, 
        timestamp: isoTimestamp,
        round1Id: docData.round1Id as string | undefined,
        round1Title: docData.round1Title as string | undefined,
        round1Score: docData.round1Score as number | undefined,
        round1Trials: docData.round1Trials as number | undefined,
        round1AverageResponseTimeSeconds: docData.round1AverageResponseTimeSeconds as number | undefined,
        round2Id: docData.round2Id as string | undefined,
        round2Title: docData.round2Title as string | undefined,
        round2Score: docData.round2Score as number | undefined,
        round2Trials: docData.round2Trials as number | undefined,
        round2AverageResponseTimeSeconds: docData.round2AverageResponseTimeSeconds as number | undefined,
        overallAccuracy: docData.overallAccuracy as number | undefined,
        totalGameTimeSeconds: docData.totalGameTimeSeconds as number | undefined,
      };
      sessions.push(session);
    });
    console.log(`[firestore-service - admin] Fetched ${sessions.length} sessions for userId: ${userId}`);
    return { success: true, data: sessions };
  } catch (error: any) {
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected error occurred while fetching data.';
    const errorCode = typeof error.code === 'string' ? error.code : 'UNKNOWN_FETCH_ERROR';

    console.error(
      `[firestore-service - admin] Error fetching user Stroop sessions for userId: ${userId}. Code: ${errorCode}, Message: ${errorMessage}`,
       error 
    );
    return { success: false, error: `Failed to fetch data. Server error: ${errorMessage}${errorCode !== 'UNKNOWN_FETCH_ERROR' ? ` (Code: ${errorCode})` : ''}` };
  }
}
