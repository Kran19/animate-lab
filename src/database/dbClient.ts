import { PrismaClient } from '@prisma/client';
import { defaultWorkspaceConfig } from '../engine/storage/workspaceConfig';

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (!prismaInstance) {
    const paths = defaultWorkspaceConfig.ensureDirectoryStructure();
    const dbPath = paths.databasePath;

    // Set DATABASE_URL if not set
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = `file:${dbPath}`;
    }

    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export async function disconnectPrisma(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance = null;
  }
}
