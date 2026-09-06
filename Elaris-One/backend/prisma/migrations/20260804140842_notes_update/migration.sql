/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Note` table. All the data in the column will be lost.
  - Added the required column `branch` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pdfUrl` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semester` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_subjectId_fkey";

-- AlterTable
ALTER TABLE "public"."Note" DROP COLUMN "fileUrl",
ADD COLUMN     "branch" TEXT NOT NULL,
ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pdfUrl" TEXT NOT NULL,
ADD COLUMN     "semester" INTEGER NOT NULL,
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "subjectId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
