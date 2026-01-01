"use server";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export interface RegisterData {
  name: string;
  password: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

export async function register(data: RegisterData) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { name: data.name } });
  if (existingUser) {
    throw new Error('Username already exists');
  }

  // Check if email already exists (if provided)
  // `email` is optional in the schema and therefore not a unique field,
  // use findFirst to search by email instead of findUnique to satisfy Prisma
  // TypeScript types.
  if (data.email) {
    const existingEmail = await prisma.user.findFirst({ where: { email: data.email } });
    if (existingEmail) {
      throw new Error('Email already in use');
    }
  }

  // Create new user
  const user = await prisma.user.create({
    data: {
      name: data.name,
      password: data.password, // In production, hash this!
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      country: data.country,
    },
  });

  // Return user details except password
  const { password: _, ...safeUser } = user;
  return safeUser;
}
