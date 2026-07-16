import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const prismaClientSingleton = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Local development fallback
  if (!url) {
    const localLibsql = createClient({
      url: 'file:./prisma/dev.db',
    });
    const localAdapter = new PrismaLibSQL(localLibsql);
    return new PrismaClient({ adapter: localAdapter });
  }

  // Production Turso connection (Vercel environment)
  const libsql = createClient({
    url,
    authToken,
  });
  
  const adapter = new PrismaLibSQL(libsql);
  return new PrismaClient({ adapter });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;