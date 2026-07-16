import { prisma } from './db';
import { Prisma } from '@prisma/client';

export const storageService = {
  /**
   * Save a completed Stroop session to the SQLite database
   */
  async saveSession(data: Omit<Prisma.StroopSessionCreateInput, 'id' | 'timestamp'> & { id?: string }) {
    return await prisma.stroopSession.create({
      data: {
        id: data.id, // optional: keep if you generate IDs client-side
        userId: data.userId,
        
        // Round 1
        round1Id: data.round1Id,
        round1Title: data.round1Title,
        round1Score: data.round1Score,
        round1Trials: data.round1Trials,
        round1AverageResponseTimeSeconds: data.round1AverageResponseTimeSeconds,

        // Round 2
        round2Id: data.round2Id,
        round2Title: data.round2Title,
        round2Score: data.round2Score,
        round2Trials: data.round2Trials,
        round2AverageResponseTimeSeconds: data.round2AverageResponseTimeSeconds,

        overallAccuracy: data.overallAccuracy,
        totalGameTimeSeconds: data.totalGameTimeSeconds,
      },
    });
  },

  /**
   * Get all Stroop sessions for a specific user, sorted by most recent
   */
  async getSessionsByUser(userId: string) {
    return await prisma.stroopSession.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  },

  /**
   * Get a single Stroop session by its ID
   */
  async getSessionById(id: string) {
    return await prisma.stroopSession.findUnique({
      where: { id },
    });
  }
};