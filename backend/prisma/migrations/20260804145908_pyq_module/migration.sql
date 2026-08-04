/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `PYQ` table. All the data in the column will be lost.
  - Added the required column `branch` to the `PYQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfUrl` to the `PYQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `PYQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `PYQ` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PYQ` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."PYQ" DROP CONSTRAINT "PYQ_subjectId_fkey";

-- AlterTable
ALTER TABLE "public"."PYQ" DROP COLUMN "fileUrl",
ADD COLUMN     "branch" TEXT NOT NULL,
ADD COLUMN     "downloads" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pdfUrl" TEXT NOT NULL,
ADD COLUMN     "semester" INTEGER NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "subjectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PYQ" ADD CONSTRAINT "PYQ_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
