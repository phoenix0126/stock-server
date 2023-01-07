-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MailSetting" (
    "id" SERIAL NOT NULL,
    "timeframe" INTEGER NOT NULL,
    "minXSD" DOUBLE PRECISION NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MailSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Indice" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "close" INTEGER NOT NULL,

    CONSTRAINT "Indice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
