
'use server';

import { db } from '@/lib/firebase/config'; 
import { getUserStroopSessions, saveStroopSession, type FetchedStroopSession, type StroopSessionData } from '@/lib/firebase/firestore-service';


// This function is now aligned with what the dashboard/page.tsx expects
// when it imports `fetchUserSessions` from `@/app/actions`.
// It essentially acts as a wrapper around the firestore-service function.
export async function fetchUserSessions(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[firebase/hosting/src/app/actions.ts] fetchUserSessions server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[firebase/hosting/src/app/actions.ts] fetchUserSessions: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for fetchUserSessions.' };
  }
  
  try {
    const result = await getUserStroopSessions(userId);
    console.log('[firebase/hosting/src/app/actions.ts] getUserStroopSessions result from service (for fetchUserSessions):', result.success, result.data?.length, result.error);
    return result; 
  } catch (error: any) {
    console.error('[firebase/hosting/src/app/actions.ts] Error in fetchUserSessions calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchUserSessions.';
    return { success: false, error: errorMessage };
  }
}


export async function fetchTestDataForUser(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[firebase/hosting/src/app/actions.ts] fetchTestDataForUser server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[firebase/hosting/src/app/actions.ts] fetchTestDataForUser: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for fetchTestDataForUser.' };
  }
  
  try {
    // Reusing getUserStroopSessions for simplicity
    const result = await getUserStroopSessions(userId);
    console.log('[firebase/hosting/src/app/actions.ts] getUserStroopSessions result from service (for fetchTestDataForUser):', result.success, result.data?.length, result.error);
    return result;
  } catch (error: any) {
    console.error('[firebase/hosting/src/app/actions.ts] Error in fetchTestDataForUser calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchTestDataForUser.';
    return { success: false, error: errorMessage };
  }
}


// Renamed from fetchUserSessionsFromService to avoid conflict with the above
// and to maintain its original specific purpose if it was different.
// The dashboard/page.tsx imports 'fetchUserSessions', which now points to the one defined above.
export async function fetchStroopSessionsViaService(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[firebase/hosting/src/app/actions.ts] fetchStroopSessionsViaService server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[firebase/hosting/src/app/actions.ts] fetchStroopSessionsViaService: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for fetchStroopSessionsViaService.' };
  }
  
  try {
    const result = await getUserStroopSessions(userId);
    console.log('[firebase/hosting/src/app/actions.ts] getUserStroopSessions result from service (for fetchStroopSessionsViaService):', result.success, result.data?.length, result.error);
    return result; 
  } catch (error: any) {
    console.error('[firebase/hosting/src/app/actions.ts] Error in fetchStroopSessionsViaService calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchStroopSessionsViaService.';
    return { success: false, error: errorMessage };
  }
}

// Removed fetchUserSessionsGeneric as it was unused and potentially confusing.

export async function addMockStroopSessionForUser(userId: string | undefined): Promise<{
  success: boolean;
  error?: string;
  sessionId?: string;
}> {
  console.log('[firebase/hosting/src/app/actions.ts] addMockStroopSessionForUser server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[firebase/hosting/src/app/actions.ts] addMockStroopSessionForUser: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided.' };
  }

  const mockSessionData: Omit<StroopSessionData, 'userId' | 'timestamp'> & { timestamp: Date } = {
    timestamp: new Date(),
    // Round 1 Data (Word Match)
    round1Id: "wordMatch",
    round1Title: "Mock Round 1: Match Word Meaning",
    round1Score: Math.floor(Math.random() * 18) + 7, // Score between 7-24
    round1Trials: 25 + Math.floor(Math.random() * 6), // Trials between 25-30
    round1AverageResponseTimeSeconds: parseFloat((Math.random() * 1.2 + 0.6).toFixed(2)), // Avg time 0.6s-1.8s
    
    // Round 2 Data (Color Match)
    round2Id: "colorMatch",
    round2Title: "Mock Round 2: Match Font Color",
    round2Score: Math.floor(Math.random() * 15) + 5, // Score between 5-19
    round2Trials: 20 + Math.floor(Math.random() * 6), // Trials between 20-25
    round2AverageResponseTimeSeconds: parseFloat((Math.random() * 1.8 + 0.8).toFixed(2)), // Avg time 0.8s-2.6s
    
    // Additional mock fields if your StroopSessionData expects more
    overallAccuracy: Math.random(),
    totalGameTimeSeconds: Math.floor(Math.random() * 60) + 120, // e.g. 120-180 seconds
  };

  try {
    const result = await saveStroopSession(userId, mockSessionData);
    if (result.success) {
      console.log(`[firebase/hosting/src/app/actions.ts] Mock session ${result.sessionId} added for user ${userId}`);
    } else {
      console.error(`[firebase/hosting/src/app/actions.ts] Failed to add mock session for user ${userId}:`, result.error);
    }
    return result;
  } catch (error: any) {
    console.error(`[firebase/hosting/src/app/actions.ts] Error in addMockStroopSessionForUser calling saveStroopSession for user ${userId}:`, error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred.';
    return { success: false, error: errorMessage };
  }
}
    
