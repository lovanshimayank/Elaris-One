/*
  Warnings:

  - You are about to drop the column `subject` on the `Note` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `PYQ` table. All the data in the column will be lost.
  - You are about to drop the column `subjectCode` on the `Subject` table. All the data in the column will be lost.
  - You are about to drop the column `subjectName` on the `Subject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `Department` table without a default value. This is not possible if the table is not empty.
  - Made the column `subjectId` on table `Note` required. This step will fail if there are existing NULL values in that column.
  - Made the column `subjectId` on table `PYQ` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subject` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."DepartmentType" AS ENUM ('ENGINEERING', 'MANAGEMENT', 'PHARMACY', 'LAW', 'DESIGN');

-- DropForeignKey
ALTER TABLE "public"."Note" DROP CONSTRAINT "Note_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PYQ" DROP CONSTRAINT "PYQ_subjectId_fkey";

-- DropIndex
DROP INDEX "public"."Subject_semester_idx";

-- DropIndex
DROP INDEX "public"."Subject_subjectCode_key";

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "type" "public"."DepartmentType" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Note" DROP COLUMN "subject",
ALTER COLUMN "subjectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."PYQ" DROP COLUMN "subject",
ALTER COLUMN "subjectId" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subject" DROP COLUMN "subjectCode",
DROP COLUMN "subjectName",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "public"."Subject"("code");

-- AddForeignKey
ALTER TABLE "public"."Note" ADD CONSTRAINT "Note_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PYQ" ADD CONSTRAINT "PYQ_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
