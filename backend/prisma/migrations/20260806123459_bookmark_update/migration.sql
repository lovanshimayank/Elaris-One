-- AlterTable
ALTER TABLE "public"."Bookmark" ADD COLUMN     "opportunityId" TEXT,
ADD COLUMN     "pyqId" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_pyqId_fkey" FOREIGN KEY ("pyqId") REFERENCES "public"."PYQ"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "public"."Opportunity"("id") ON DELETE SET NULL ON UPDATE CASCADE;
