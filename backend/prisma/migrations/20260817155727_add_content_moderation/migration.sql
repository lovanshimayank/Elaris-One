-- CreateEnum
CREATE TYPE "public"."ModerationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Note" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategories" TEXT[],
ADD COLUMN     "moderationReasons" TEXT[],
ADD COLUMN     "moderationScore" DOUBLE PRECISION,
ADD COLUMN     "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "moderationSummary" TEXT,
ALTER COLUMN "isPublic" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."Opportunity" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategories" TEXT[],
ADD COLUMN     "moderationReasons" TEXT[],
ADD COLUMN     "moderationScore" DOUBLE PRECISION,
ADD COLUMN     "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "moderationSummary" TEXT,
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "public"."PYQ" ADD COLUMN     "moderatedAt" TIMESTAMP(3),
ADD COLUMN     "moderationCategories" TEXT[],
ADD COLUMN     "moderationReasons" TEXT[],
ADD COLUMN     "moderationScore" DOUBLE PRECISION,
ADD COLUMN     "moderationStatus" "public"."ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "moderationSummary" TEXT;
