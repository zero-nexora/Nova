/*
  Warnings:

  - You are about to drop the `Category_Images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Category_Images" DROP CONSTRAINT "Category_Images_category_id_fkey";

-- AlterTable
ALTER TABLE "public"."Categories" ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "public_id" TEXT;

-- DropTable
DROP TABLE "public"."Category_Images";
