-- CreateTable
CREATE TABLE "AnalyzeIndice" (
    "id" SERIAL NOT NULL,
    "pairID" INTEGER NOT NULL,
    "range" INTEGER NOT NULL,
    "pair" TEXT NOT NULL,
    "correlation" DOUBLE PRECISION NOT NULL,
    "gap" DOUBLE PRECISION NOT NULL,
    "sd" DOUBLE PRECISION NOT NULL,
    "xsd" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AnalyzeIndice_pkey" PRIMARY KEY ("id")
);
