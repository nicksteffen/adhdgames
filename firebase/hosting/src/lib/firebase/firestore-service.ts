
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
  timestamp: AdminTimestamp | Date; // Firestore Admin SDK can handle JS Date objects for timestamps
  // Explicitly define round data using index signatures for flexibility,
  // but ensure values are primitives or simple objects/arrays.
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
  [key: string]: any; // Keep for flexibility for other potential top-level fields, but use with caution
}

// This type will be used by client components. Timestamp is now a string (ISO format).
// All other fields are explicitly typed to ensure serializability.
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
  // Add any other specific, serializable top-level fields you expect from stroopSessions documents.
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
    // Ensure the data being saved conforms to what Firestore expects.
    // JS Date objects will be converted to Firestore Timestamps by the Admin SDK.
    const sessionToSave: StroopSessionData = {
      ...sessionData, // Spread known, serializable properties
      userId,
      timestamp: sessionData.timestamp, // This is a JS Date object
    };
    console.log(`[firestore-service - admin] Attempting to save session for userId: ${userId}. Data (excluding large fields for brevity):`,
      { userId: sessionToSave.userId, timestamp: sessionToSave.timestamp, round1Id: sessionToSave.round1Id, round2Id: sessionToSave.round2Id }
    );

    const docRef = await adminDbInstance.collection('users').doc(userId).collection('stroopSessions').add(sessionToSave);
    console.log(`[firestore-service - admin] Session saved successfully for userId: ${userId}, sessionId: ${docRef.id}`);
    return { success: true, sessionId: docRef.id };
  } catch (error: any) {
    console.error(`[firestore-service - admin] Error saving Stroop session for userId: ${userId}. Error:`, error.message, error.code, error.details);
    // Ensure stack trace is not sent to client for security
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
      const docData = doc.data();
      let isoTimestamp: string;

      const timestampField = docData.timestamp;

      if (timestampField && typeof timestampField.toDate === 'function') {
        // Firestore Admin Timestamp
        isoTimestamp = (timestampField as AdminTimestamp).toDate().toISOString();
      } else if (timestampField && typeof timestampField === 'object' && timestampField.seconds !== undefined && timestampField.nanoseconds !== undefined) {
        // Firestore Client Timestamp (serialized)
        try {
            const clientTimestamp = new ClientTimestamp(timestampField.seconds, timestampField.nanoseconds);
            isoTimestamp = clientTimestamp.toDate().toISOString();
        } catch (e) {
            console.warn(`[firestore-service - admin] Error converting client-like timestamp for doc ${doc.id}:`, e);
            isoTimestamp = new Date(0).toISOString(); // Fallback
        }
      } else if (typeof timestampField === 'string') { // ISO string or other date string
        const parsedDate = new Date(timestampField);
        if (!isNaN(parsedDate.getTime())) {
            isoTimestamp = parsedDate.toISOString();
        } else {
            console.warn(`[firestore-service - admin] Invalid string timestamp found for doc ${doc.id}:`, timestampField);
            isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
        }
      } else if (typeof timestampField === 'number') { // Unix epoch milliseconds
        const parsedDate = new Date(timestampField);
        if (!isNaN(parsedDate.getTime())) {
            isoTimestamp = parsedDate.toISOString();
        } else {
            console.warn(`[firestore-service - admin] Invalid numeric timestamp found for doc ${doc.id}:`, timestampField);
            isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
        }
      } else if (timestampField instanceof Date) { // JS Date object
        isoTimestamp = timestampField.toISOString();
      }
      else {
        console.warn(`[firestore-service - admin] Missing or unparseable timestamp for doc ${doc.id}. Using epoch as fallback.`);
        isoTimestamp = new Date(0).toISOString(); // Fallback to epoch
      }

      // Explicitly map known fields to ensure serializability
      const session: FetchedStroopSession = {
        id: doc.id,
        userId: docData.userId as string, // Assuming userId is always a string
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

      // Filter out undefined properties before pushing, if desired, or handle them in components
      // For now, we'll push as is, as optional properties are fine.
      sessions.push(session);
    });
    console.log(`[firestore-service - admin] Fetched ${sessions.length} sessions for userId: ${userId}`);
    return { success: true, data: sessions };
  } catch (error: any) {
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected error occurred while fetching data.';
    const errorCode = typeof error.code === 'string' ? error.code : 'UNKNOWN_FETCH_ERROR';

    console.error(
      `[firestore-service - admin] Error fetching user Stroop sessions for userId: ${userId}. Code: ${errorCode}, Message: ${errorMessage}`,
       error // Log the full error object server-side for more details
    );
    // Provide a simpler, serializable error message to the client
    return { success: false, error: `Failed to fetch data. Server error: ${errorMessage}${errorCode !== 'UNKNOWN_FETCH_ERROR' ? ` (Code: ${errorCode})` : ''}` };
  }
}

