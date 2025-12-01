/*
  Warnings:

  - The `status` column on the `properties` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `type` on the `properties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'APARTMENT', 'STUDIO', 'KITNET', 'ROOM');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'DISABLED');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "type",
ADD COLUMN     "type" "PropertyType" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PropertyStatus" NOT NULL DEFAULT 'AVAILABLE';
