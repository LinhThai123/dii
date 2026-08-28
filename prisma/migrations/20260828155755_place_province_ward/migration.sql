-- AlterTable
ALTER TABLE "places" ADD COLUMN     "province_id" TEXT,
ADD COLUMN     "ward_id" TEXT;

-- CreateIndex
CREATE INDEX "places_province_id_idx" ON "places"("province_id");

-- CreateIndex
CREATE INDEX "places_ward_id_idx" ON "places"("ward_id");

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_province_id_fkey" FOREIGN KEY ("province_id") REFERENCES "provinces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "places_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
