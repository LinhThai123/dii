/**
 * Standalone seed for VN admin divisions.
 * Usage: npx ts-node prisma/seed-vn-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import { seedVnAdminDivisions } from './seed-vn-admin';

const prisma = new PrismaClient();

seedVnAdminDivisions(prisma)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
