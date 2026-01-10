/**
 * Database Client Export
 *
 * Re-exports the Prisma client singleton for convenience.
 * This provides a consistent import path across the application.
 */

export { prisma, getPrismaClient, disconnectPrisma } from './prisma';
