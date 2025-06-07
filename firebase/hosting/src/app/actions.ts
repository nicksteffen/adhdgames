
'use server';

import { getUserStroopSessions, type FetchedStroopSession } from '@/lib/firebase/firestore-service';

export async function fetchUserSessions(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[actions.ts] fetchUserSessions server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[actions.ts] fetchUserSessions: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided.' };
  }
  
  try {
    // Call the existing service function to get user sessions
    const result = await getUserStroopSessions(userId);
    console.log('[actions.ts] getUserStroopSessions result:', result);
    return result; // This already returns { success, data?, error? }
  } catch (error: any) {
    console.error('[actions.ts] Error in fetchUserSessions calling getUserStroopSessions:', error);
    // Ensure a simple, serializable error message is returned
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchUserSessions.';
    return { success: false, error: errorMessage };
  }
}
