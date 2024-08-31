-- AlterTable
ALTER TABLE "measures" ALTER COLUMN "measure_datetime" DROP DEFAULT,
ALTER COLUMN "measure_datetime" SET DATA TYPE TEXT,
ALTER COLUMN "measure_value" DROP NOT NULL;
