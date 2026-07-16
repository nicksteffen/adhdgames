import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const prismaClientSingleton = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Local development fallback
  if (!url) {
    const localAdapter = new PrismaLibSql({
      url: 'file:./prisma/dev.db',
    });
    return new PrismaClient({ adapter: localAdapter });
  }

  // Production Turso connection (Vercel environment)
  const adapter = new PrismaLibSql({
    url,
    authToken,
  });
  
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;