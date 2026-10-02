-- AlterTable
ALTER TABLE "Offer" ADD COLUMN "courseId" TEXT;

-- CreateIndex
CREATE INDEX "Offer_courseId_idx" ON "Offer"("courseId");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
