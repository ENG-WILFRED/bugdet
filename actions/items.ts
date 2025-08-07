"use server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getItems() {
  const items = await prisma.item.findMany({
    include: { author: true, comments: { include: { author: true } } }
  });
  // Map 'date' to 'createdAt' for frontend compatibility
  return items.map(item => ({
    ...item,
    createdAt: item.date,
    comments: item.comments.map(comment => ({
      ...comment,
      createdAt: comment.createdAt,
      author: comment.author,
    })),
    author: item.author,
  }));
}

export async function addItem({ name, cost, comment, authorId }: { name: string, cost: number, comment: string, authorId: number }) {
  const item = await prisma.item.create({
    data: {
      name,
      cost,
      comment,
      authorId,
    },
    include: { author: true, comments: { include: { author: true } } }
  });
  return {
    ...item,
    createdAt: item.date,
    comments: item.comments,
    author: item.author,
  };
}

export async function editItem(item: { id: number, name: string, cost: number, comment: string, authorId: number }) {
  const updated = await prisma.item.update({
    where: { id: item.id },
    data: {
      name: item.name,
      cost: item.cost,
      comment: item.comment,
      authorId: item.authorId,
    },
    include: { author: true, comments: { include: { author: true } } }
  });
  return {
    ...updated,
    createdAt: updated.date,
    comments: updated.comments,
    author: updated.author,
  };
}

export async function deleteItem(id: number) {
  await prisma.item.delete({ where: { id } });
}

export async function addComment(itemId: number, authorName: string, message: string) {
  const user = await prisma.user.findUnique({ where: { name: authorName } });
  if (!user) throw new Error('User not found');
  return prisma.comment.create({
    data: {
      message,
      itemId,
      authorId: user.id,
    },
    include: { author: true }
  });
}
