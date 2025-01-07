/*
  Warnings:

  - Added the required column `receiverId` to the `message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "message" ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'sent';

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
