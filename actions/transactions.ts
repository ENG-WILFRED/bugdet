"use server";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addTransaction(
  userId: number,
  description: string,
  amount: number,
  category: string,
  date: Date = new Date()
) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        description,
        amount,
        category,
        date,
        userId,
      },
    });
    return transaction;
  } catch (error) {
    console.error("Error adding transaction:", error);
    throw error;
  }
}

export async function getTransactions(userId: number, limit: number = 50) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    });
    return transactions;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
}

export async function deleteTransaction(id: number) {
  try {
    const transaction = await prisma.transaction.delete({
      where: { id },
    });
    return transaction;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}
