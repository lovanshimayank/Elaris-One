-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "branch" TEXT,
ADD COLUMN     "college" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "linkedin" TEXT,
ADD COLUMN     "profileImage" TEXT,
ADD COLUMN     "section" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "year" INTEGER;
