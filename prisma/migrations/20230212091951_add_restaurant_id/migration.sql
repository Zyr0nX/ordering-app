/*
  Warnings:

  - A unique constraint covering the columns `[restaurantId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "restaurantId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_restaurantId_key" ON "User"("restaurantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
