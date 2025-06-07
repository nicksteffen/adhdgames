
'use server';

import { db } from '@/lib/firebase/config'; // Corrected import path
import { collection, getDocs } from 'firebase/firestore';
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';


// This server action was previously unused and incomplete for the dashboard.
// It is being kept here for reference but the dashboard now uses fetchUserSessionsFromService.
export async function fetchUserSessionsGeneric() {
  console.log('[actions.ts] fetchUserSessionsGeneric server action hit (currently unused by dashboard)');
  try {
    // This is a generic fetch of all sessions, not specific to a user.
    // This is likely NOT what you want for a user-specific dashboard.
    // The dashboard should use fetchUserSessionsFromService below.
    const sessionsCollection = collection(db, 'sessions'); // Assuming a top-level 'sessions' collection
    const sessionSnapshot = await getDocs(sessionsCollection);
    const sessionList = sessionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('[actions.ts] Fetched generic sessions:', sessionList.length);
    return { success: true, data: sessionList };
  } catch (error: any) {
    console.error('[actions.ts] Error fetching generic sessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred.';
    return { success: false, error: errorMessage };
  }
}


// Renamed from fetchUserSessions to avoid conflict and clarify its role
export async function fetchUserSessionsFromService(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[actions.ts] fetchUserSessionsFromService server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[actions.ts] fetchUserSessionsFromService: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided.' };
  }
  
  try {
    // Call the existing service function to get user sessions
    const result = await getUserStroopSessions(userId);
    console.log('[actions.ts] getUserStroopSessions result from service:', result);
    // The result from getUserStroopSessions is already in the desired { success, data?, error? } format
    return result; 
  } catch (error: any) {
    console.error('[actions.ts] Error in fetchUserSessionsFromService calling getUserStroopSessions:', error);
    // Ensure a simple, serializable error message is returned
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchUserSessionsFromService.';
    return { success: false, error: errorMessage };
  }
}
