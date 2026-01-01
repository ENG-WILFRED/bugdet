"use server";
import { PrismaClient } from "@prisma/client";
import { broadcast } from "./websocket/connection";

const prisma = new PrismaClient();

// Get all comments for an item (with author, replies, mentions, reactions, flags)
export async function getCommentsByItem(itemId: number) {
  console.log(Comment)
  return prisma.comment.findMany({
    where: { itemId, parentId: null },
    include: {
      author: true,
      replies: {
        include: { author: true }
      },
      mentions: { include: { user: true } },
      reactions: { include: { user: true } },
      flags: { include: { user: true } }
    },
    orderBy: { createdAt: "asc" }
  });
}

// Add a comment (top-level or reply)
export async function addComment({
  itemId,
  authorId,
  message,
  parentId,
  mentionUserIds = [],
}: {
  itemId: number;
  authorId: number;
  message: string;
  parentId?: number;
  mentionUserIds?: number[];
}) {
  const comment = await prisma.comment.create({
    data: {
      message,
      itemId,
      authorId,
      parentId: parentId ?? null,
      mentions: {
        create: mentionUserIds.map(userId => ({
          user: { connect: { id: userId } }
        }))
      }
    },
    include: {
      author: true,
      mentions: { include: { user: true } },
      replies: { include: { author: true } }
    }
  });
  broadcast("comment:add", comment);
  return comment;
}

// Edit a comment
export async function editComment({
  commentId,
  message
}: {
  commentId: number;
  message: string;
}) {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      message,
      editedAt: new Date()
    }
  });
  broadcast("comment:edit", comment);
  return comment;
}

// Soft delete a comment
export async function deleteComment(commentId: number) {
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: { isDeleted: true }
  });
  broadcast("comment:delete", comment);
  return comment;
}

// Add a reaction (emoji) to a comment
export async function addReaction({
  commentId,
  userId,
  emoji
}: {
  commentId: number;
  userId: number;
  emoji: string;
}) {
  const reaction = await prisma.commentReaction.upsert({
    where: { commentId_userId_emoji: { commentId, userId, emoji } },
    update: {},
    create: { commentId, userId, emoji }
  });
  broadcast("comment:react", { commentId, userId, emoji });
  return reaction;
}

// Remove a reaction
export async function removeReaction({
  commentId,
  userId,
  emoji
}: {
  commentId: number;
  userId: number;
  emoji: string;
}) {
  return prisma.commentReaction.deleteMany({
    where: { commentId, userId, emoji }
  });
}

// Flag a comment
export async function flagComment({
  commentId,
  userId,
  reason
}: {
  commentId: number;
  userId: number;
  reason?: string;
}) {
  return prisma.commentFlag.upsert({
    where: { commentId_userId: { commentId, userId } },
    update: { reason },
    create: { commentId, userId, reason }
  });
}

export async function removeFlag({
  commentId,
  userId
}: {
  commentId: number;
  userId: number;
}) {
  return prisma.commentFlag.deleteMany({
    where: { commentId, userId }
  });
}

/**
 * Get all comments for an item, nested by parentId.
 * Each comment includes its replies recursively.
 */
export async function getNestedCommentsByItem(itemId: number) {
  console.log("Fetching nested comments for item:", itemId);
  // Fetch all comments for the item, with all needed relations
  const flatComments = await prisma.comment.findMany({
    where: { itemId },
    include: {
      author: true,
      reactions: { include: { user: true } },
      flags: { include: { user: true } },
      mentions: { include: { user: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Build a map of id -> comment
  const commentMap: Record<number, any> = {};
  flatComments.forEach((c) => {
    commentMap[c.id] = { ...c, replies: [] };
  });

  // Build the tree
  const roots: any[] = [];
  flatComments.forEach((c) => {
    if (c.parentId == null) {
      roots.push(commentMap[c.id]);
    } else if (commentMap[c.parentId]) {
      commentMap[c.parentId].replies.push(commentMap[c.id]);
    }
  });
console.log("Nested comments built:", roots);
  return roots;
}