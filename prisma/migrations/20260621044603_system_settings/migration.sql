-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON');

-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "value_type" "SettingValueType" NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "updated_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "admin_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
