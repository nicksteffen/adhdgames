
'use server';

import { db } from '@/lib/firebase/config'; 
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';


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

    