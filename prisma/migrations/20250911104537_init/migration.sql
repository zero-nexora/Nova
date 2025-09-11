/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Cart_Items` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Cart_Items` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Carts` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Carts` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Coupons` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Coupons` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Notifications` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Order_Items` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Order_Items` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Payments` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Product_Images` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Product_Images` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Product_Variant_Attributes` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Product_Variant_Attributes` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Review_Images` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Review_Images` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Reviews` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `User_Addresses` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `User_Addresses` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `Wishlists` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `Wishlists` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Cart_Items" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Carts" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Coupons" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted",
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "public"."Notifications" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Order_Items" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Orders" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Payments" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Product_Images" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Product_Variant_Attributes" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Review_Images" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Reviews" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."User_Addresses" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "public"."Wishlists" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";
