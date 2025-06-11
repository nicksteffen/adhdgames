
'use server';

// Removed unused client db import from config.ts
// import { db } from '../../firebase/hosting/src/lib/firebase/config';
import { getUserStroopSessions, type FetchedStroopSession } from '../../firebase/hosting/src/lib/firebase/firestore-service';

// This function is for the ROOT /src/app/actions.ts
// It will be called by the ROOT /src/app/test-page/page.tsx
export async function fetchTestDataForUser(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[ROOT src/app/actions.ts] fetchTestDataForUser server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[ROOT src/app/actions.ts] fetchTestDataForUser: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for (root) fetchTestDataForUser.' };
  }

  try {
    // Reusing getUserStroopSessions for simplicity
    const result = await getUserStroopSessions(userId);
    console.log('[ROOT src/app/actions.ts] getUserStroopSessions result from service (for root fetchTestDataForUser):', result.success, result.data?.length, result.error);
    return result;
  } catch (error: any) {
    console.error('[ROOT src/app/actions.ts] Error in fetchTestDataForUser calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in (root) fetchTestDataForUser.';
    return { success: false, error: errorMessage };
  }
}

// The dashboard page should import its actions from firebase/hosting/src/app/actions.ts
// This file (src/app/actions.ts) might be used if you have root-level pages/components
// that need server actions and are not part of the firebase/hosting structure.
// For clarity, the original fetchUserSessions that was here (and was essentially a duplicate)
// is removed to avoid confusion. The dashboard uses fetchUserSessions from firebase/hosting/src/app/actions.ts
    
