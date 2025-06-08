
'use server';

import { db } from '@/lib/firebase/config'; // Corrected import path
// We'll also need getUserStroopSessions from firestore-service
import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';

// This function is now aligned with what the dashboard/page.tsx expects
// when it imports `fetchUserSessions` from `@/app/actions`.
// It essentially acts as a wrapper around the firestore-service function.
export async function fetchUserSessions(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[src/app/actions.ts] Root fetchUserSessions server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[src/app/actions.ts] fetchUserSessions: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided.' };
  }
  
  try {
    const result = await getUserStroopSessions(userId);
    console.log('[src/app/actions.ts] getUserStroopSessions result from service:', result);
    return result; 
  } catch (error: any) {
    console.error('[src/app/actions.ts] Error in fetchUserSessions calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in root actions.ts.';
    return { success: false, error: errorMessage };
  }
}

// New server action to get the user ID
export async function getUserId(): Promise<string | null> {
  // For now, return a hardcoded ID. Replace with actual auth logic later.
  return "test-user-id-123";
}

// The original fetchUserSessionsGeneric and fetchUserSessionsFromService 
// are defined in firebase/hosting/src/app/actions.ts.
// The dashboard was importing `fetchUserSessions`, so we make sure this root
// actions.ts file provides a compatible version.
