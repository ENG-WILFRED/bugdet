"use server";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function login(name: string, password: string) {
  const user = await prisma.user.findUnique({ where: { name } });
  if (!user || user.password !== password) {
    throw new Error('Invalid credentials');
  }
  // Return user details except password
  const { password: _, ...safeUser } = user;
  return safeUser;
}
