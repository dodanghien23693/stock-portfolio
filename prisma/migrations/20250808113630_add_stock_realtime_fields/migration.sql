-- AlterTable
ALTER TABLE "public"."Stock" ADD COLUMN     "change" DOUBLE PRECISION,
ADD COLUMN     "changePercent" DOUBLE PRECISION,
ADD COLUMN     "currentPrice" DOUBLE PRECISION,
ADD COLUMN     "volume" INTEGER;
