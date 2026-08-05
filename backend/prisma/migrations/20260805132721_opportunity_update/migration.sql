/*
  Warnings:

  - Added the required column `updatedAt` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Opportunity" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "company" DROP NOT NULL,
ALTER COLUMN "applyLink" DROP NOT NULL,
ALTER COLUMN "deadline" DROP NOT NULL;
