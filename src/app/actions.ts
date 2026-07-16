'use server';

import { storageService } from '@/lib/storage-service';
import { type StroopSession } from '@prisma/client';

// --- Shared Frontend types (replacing the old Firebase exports) ---

export interface RoundResultData {
  roundId: string;
  title: string;
  score: number;
  trials: number;
  averageResponseTimeSeconds: number;
}

export interface StroopSessionData {
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

// Keep the client-side happy if it expects this name
export type FetchedStroopSession = StroopSession;


// --- Real Application Database Actions ---

/**
 * Save a real completed Stroop session to the SQLite database
 */
export async function saveStroopSession(
  userId: string,
  sessionData: StroopSessionData & { timestamp: Date }
): Promise<{ success: boolean; error?: string; sessionId?: string }> {
  console.log(`[sqlite/src/app/actions.ts] saveStroopSession called for userId: ${userId}.`);
  if (!userId) {
    console.error('[sqlite/src/app/actions.ts] User ID is required to save session.');
    return { success: false, error: 'User ID is required.' };
  }

  try {
    const session = await storageService.saveSession({
      userId,
      ...sessionData,
    });
    console.log(`[sqlite/src/app/actions.ts] Session saved successfully for userId: ${userId}, sessionId: ${session.id}`);
    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error(`[sqlite/src/app/actions.ts] Error saving Stroop session for userId: ${userId}:`, error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected database error occurred.';
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetch all sessions for a specific user
 */
export async function fetchUserSessions(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[sqlite/src/app/actions.ts] fetchUserSessions server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[sqlite/src/app/actions.ts] fetchUserSessions: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for fetchUserSessions.' };
  }
  
  try {
    const data = await storageService.getSessionsByUser(userId);
    console.log('[sqlite/src/app/actions.ts] getSessionsByUser result from service:', true, data.length);
    return { success: true, data };
  } catch (error: any) {
    console.error('[sqlite/src/app/actions.ts] Error in fetchUserSessions calling getSessionsByUser:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected server error occurred in fetchUserSessions.';
    return { success: false, error: errorMessage };
  }
}


// --- Test / Mock Utilities ---

export async function fetchTestDataForUser(userId: string | undefined): Promise<{
  success: boolean;
  data?: FetchedStroopSession[];
  error?: string;
}> {
  console.log('[sqlite/src/app/actions.ts] fetchTestDataForUser server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[sqlite/src/app/actions.ts] fetchTestDataForUser: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided for fetchTestDataForUser.' };
  }
  
  try {
    const data = await storageService.getSessionsByUser(userId);
    console.log('[sqlite/src/app/actions.ts] getSessionsByUser result from service (for fetchTestDataForUser):', true, data.length);
    return { success: true, data };
  } catch (error: any) {
    console.error('[sqlite/src/app/actions.ts] Error in fetchTestDataForUser calling getSessionsByUser:', error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected server error occurred in fetchTestDataForUser.';
    return { success: false, error: errorMessage };
  }
}

export async function addMockStroopSessionForUser(userId: string | undefined): Promise<{
  success: boolean;
  error?: string;
  sessionId?: string;
}> {
  console.log('[sqlite/src/app/actions.ts] addMockStroopSessionForUser server action hit. Received userId:', userId);
  if (!userId) {
    console.error('[sqlite/src/app/actions.ts] addMockStroopSessionForUser: No userId provided.');
    return { success: false, error: 'User not authenticated or userId not provided.' };
  }

  const mockSessionData = {
    userId,
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
    const session = await storageService.saveSession(mockSessionData);
    console.log(`[sqlite/src/app/actions.ts] Mock session ${session.id} added for user ${userId}`);
    return { success: true, sessionId: session.id };
  } catch (error: any) {
    console.error(`[sqlite/src/app/actions.ts] Error in addMockStroopSessionForUser calling saveSession for user ${userId}:`, error);
    const errorMessage = (error instanceof Error) ? error.message : 'An unexpected server error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function testAdminSDKConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
  console.log('[actions.ts] testAdminSDKConnection called. (Deprecating - now using local SQLite)');
  return { success: true, message: 'SQLite active. Admin SDK is no longer needed.' };
}