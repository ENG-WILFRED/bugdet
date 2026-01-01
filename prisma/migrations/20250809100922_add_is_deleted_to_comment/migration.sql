/*
  Warnings:

  - Added the required column `updatedAt` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Comment" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "public"."CommentMentionedUser" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CommentMentionedUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentReaction" (
    "id" SERIAL NOT NULL,
    "emoji" TEXT NOT NULL,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CommentFlag" (
    "id" SERIAL NOT NULL,
    "reason" TEXT,
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommentMentionedUser_commentId_userId_key" ON "public"."CommentMentionedUser"("commentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReaction_commentId_userId_emoji_key" ON "public"."CommentReaction"("commentId", "userId", "emoji");

-- CreateIndex
CREATE UNIQUE INDEX "CommentFlag_commentId_userId_key" ON "public"."CommentFlag"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentMentionedUser" ADD CONSTRAINT "CommentMentionedUser_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentMentionedUser" ADD CONSTRAINT "CommentMentionedUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentReaction" ADD CONSTRAINT "CommentReaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentFlag" ADD CONSTRAINT "CommentFlag_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CommentFlag" ADD CONSTRAINT "CommentFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
