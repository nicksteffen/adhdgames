
'use server';

import { getAdminDb } from '@/lib/firebase/admin'; 
import { getUserStroopSessions, saveStroopSession, type FetchedStroopSession, type StroopSessionData } from '@/lib/firebase/firestore-service';

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
    const result = await getUserStroopSessions(userId);
    console.log('[firebase/hosting/src/app/actions.ts] getUserStroopSessions result from service (for fetchTestDataForUser):', result.success, result.data?.length, result.error);
    return result;
  } catch (error: any) {
    console.error('[firebase/hosting/src/app/actions.ts] Error in fetchTestDataForUser calling getUserStroopSessions:', error);
    const errorMessage = typeof error.message === 'string' ? error.message : 'An unexpected server error occurred in fetchTestDataForUser.';
    return { success: false, error: errorMessage };
  }
}

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
    round1Id: "wordMatch",
    round1Title: "Mock Round 1: Match Word Meaning",
    round1Score: Math.floor(Math.random() * 18) + 7,
    round1Trials: 25 + Math.floor(Math.random() * 6),
    round1AverageResponseTimeSeconds: parseFloat((Math.random() * 1.2 + 0.6).toFixed(2)), 
    round2Id: "colorMatch",
    round2Title: "Mock Round 2: Match Font Color",
    round2Score: Math.floor(Math.random() * 15) + 5,
    round2Trials: 20 + Math.floor(Math.random() * 6), 
    round2AverageResponseTimeSeconds: parseFloat((Math.random() * 1.8 + 0.8).toFixed(2)), 
    overallAccuracy: Math.random(), 
    totalGameTimeSeconds: Math.floor(Math.random() * 60) + 120, 
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

export async function testAdminSDKConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
  console.log('[actions.ts] testAdminSDKConnection server action hit.');
  try {
    const adminDb = await getAdminDb();
    // Using non-reserved names
    const testDocRef = adminDb.collection('adminSdkTestCollection').doc('adminSdkTestDocument'); 
    await testDocRef.get(); 
    console.log('[actions.ts] Admin SDK connection test: Successfully performed a Firestore get operation with non-reserved names.');
    return { success: true, message: 'Admin SDK connected and performed a test Firestore read successfully.' };
  } catch (error: any) {
    console.error('[actions.ts] Admin SDK connection test FAILED:');
    console.error(`  Message: ${error.message}`);
    if (error.code) console.error(`  Code: ${error.code}`);
    // console.error(`  Stack: ${error.stack}`); // Stack can be very long

    // Simplified error message for the client
    let clientErrorMessage = 'Admin SDK connection test failed.';
    if (error.message) clientErrorMessage += ` Server Message: ${error.message}`;
    if (error.code) clientErrorMessage += ` (Code: ${error.code})`;
    
    return { 
      success: false, 
      error: clientErrorMessage // Changed to use 'error' field
    };
  }
}
