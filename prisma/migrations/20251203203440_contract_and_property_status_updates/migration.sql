/*
  Warnings:

  - The values [FINISHED] on the enum `ContractStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContractStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'CANCELED', 'REJECTED', 'EXPIRED');
ALTER TABLE "rental_contracts" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rental_contracts" ALTER COLUMN "status" TYPE "ContractStatus_new" USING ("status"::text::"ContractStatus_new");
ALTER TYPE "ContractStatus" RENAME TO "ContractStatus_old";
ALTER TYPE "ContractStatus_new" RENAME TO "ContractStatus";
DROP TYPE "ContractStatus_old";
ALTER TABLE "rental_contracts" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "PropertyStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "reserved_at" TIMESTAMP(3),
ADD COLUMN     "reserved_until" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "rental_contracts" ADD COLUMN     "activated_at" TIMESTAMP(3),
ADD COLUMN     "cancel_reason" TEXT,
ADD COLUMN     "cancelled_at" TIMESTAMP(3),
ADD COLUMN     "expired_at" TIMESTAMP(3),
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejected_reason" TEXT;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
