/*
  Warnings:

  - Made the column `content` on table `ticket_messages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ticket_messages" ALTER COLUMN "content" SET NOT NULL;
