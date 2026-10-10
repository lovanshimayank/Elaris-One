-- CreateEnum
CREATE TYPE "public"."QuizType" AS ENUM ('GENERAL', 'CHUNK', 'FINAL');

-- CreateEnum
CREATE TYPE "public"."ReadingResourceType" AS ENUM ('NOTE', 'PYQ');

-- CreateTable
CREATE TABLE "public"."Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "subjectId" TEXT,
    "noteId" TEXT,
    "createdById" TEXT NOT NULL,
    "quizType" "public"."QuizType" NOT NULL DEFAULT 'GENERAL',
    "sourceType" "public"."ReadingResourceType",
    "sourceId" TEXT,
    "startPage" INTEGER,
    "endPage" INTEGER,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizQuestion" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" TEXT[],
    "correctOption" INTEGER NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."QuizAttempt" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "answers" JSONB NOT NULL,
    "idempotencyKey" TEXT,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceType" "public"."ReadingResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "totalPages" INTEGER NOT NULL,
    "lastPage" INTEGER NOT NULL DEFAULT 1,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReadingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ReadingPageProgress" (
    "id" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "pageNumber" INTEGER NOT NULL,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingPageProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_idempotencyKey_key" ON "public"."Quiz"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Quiz_subjectId_idx" ON "public"."Quiz"("subjectId");

-- CreateIndex
CREATE INDEX "Quiz_sourceType_sourceId_idx" ON "public"."Quiz"("sourceType", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestion_quizId_order_key" ON "public"."QuizQuestion"("quizId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "QuizAttempt_idempotencyKey_key" ON "public"."QuizAttempt"("idempotencyKey");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_quizId_idx" ON "public"."QuizAttempt"("userId", "quizId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_completedAt_idx" ON "public"."QuizAttempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "ReadingProgress_userId_updatedAt_idx" ON "public"."ReadingProgress"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingProgress_userId_resourceType_resourceId_key" ON "public"."ReadingProgress"("userId", "resourceType", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "ReadingPageProgress_progressId_pageNumber_key" ON "public"."ReadingPageProgress"("progressId", "pageNumber");

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."Note"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Quiz" ADD CONSTRAINT "Quiz_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "public"."Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingProgress" ADD CONSTRAINT "ReadingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ReadingPageProgress" ADD CONSTRAINT "ReadingPageProgress_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "public"."ReadingProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;
