/*
  Warnings:

  - You are about to drop the column `change` on the `Stock` table. All the data in the column will be lost.
  - You are about to drop the `StockData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."StockData" DROP CONSTRAINT "StockData_stockId_fkey";

-- AlterTable
ALTER TABLE "public"."Stock" DROP COLUMN "change",
ADD COLUMN     "changeValue" DOUBLE PRECISION,
ADD COLUMN     "close" DOUBLE PRECISION,
ADD COLUMN     "eps" DOUBLE PRECISION,
ADD COLUMN     "high" DOUBLE PRECISION,
ADD COLUMN     "low" DOUBLE PRECISION,
ADD COLUMN     "open" DOUBLE PRECISION,
ADD COLUMN     "pb" DOUBLE PRECISION,
ADD COLUMN     "pe" DOUBLE PRECISION,
ADD COLUMN     "roa" DOUBLE PRECISION,
ADD COLUMN     "roe" DOUBLE PRECISION,
ADD COLUMN     "tradingDate" TEXT,
ALTER COLUMN "exchange" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."StockData";

-- CreateTable
CREATE TABLE "public"."StockHistory" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockHistory_symbol_date_idx" ON "public"."StockHistory"("symbol", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StockHistory_symbol_date_key" ON "public"."StockHistory"("symbol", "date");
