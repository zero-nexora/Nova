-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PENDING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('STRIPE', 'CASH_ON_DELIVERY');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('ORDER_UPDATE', 'PROMOTION', 'ACCOUNT', 'SYSTEM', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PRODUCT_RESTOCK');

-- CreateEnum
CREATE TYPE "public"."CouponType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');

-- CreateEnum
CREATE TYPE "public"."RoleName" AS ENUM ('ADMIN', 'MANAGE_PRODUCT', 'MANAGE_CATEGORY', 'MANAGE_STAFF', 'MANAGE_ORDER');

-- CreateEnum
CREATE TYPE "public"."PermissionName" AS ENUM ('CREATE_PRODUCT', 'READ_PRODUCT', 'UPDATE_PRODUCT', 'DELETE_PRODUCT', 'CREATE_CATEGORY', 'READ_CATEGORY', 'UPDATE_CATEGORY', 'DELETE_CATEGORY', 'CREATE_STAFF', 'READ_STAFF', 'UPDATE_STAFF', 'DELETE_STAFF', 'CREATE_ORDER', 'READ_ORDER', 'UPDATE_ORDER', 'DELETE_ORDER');

-- CreateTable
CREATE TABLE "public"."Users" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Roles" (
    "id" TEXT NOT NULL,
    "name" "public"."RoleName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permissions" (
    "id" TEXT NOT NULL,
    "name" "public"."PermissionName" NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User_Roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "User_Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role_Permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "Role_Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_id" TEXT,
    "image_url" TEXT,
    "public_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product_Images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Product_Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product_Variants" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "slug" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock_quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Product_Variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product_Attributes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Product_Attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product_Attribute_Values" (
    "id" TEXT NOT NULL,
    "attribute_id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Product_Attribute_Values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product_Variant_Attributes" (
    "id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "attribute_value_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Product_Variant_Attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Carts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Cart_Items" (
    "id" TEXT NOT NULL,
    "cart_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Cart_Items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orders" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address_id" TEXT NOT NULL,
    "status" "public"."OrderStatus" NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL,
    "payment_status" "public"."PaymentStatus" NOT NULL,
    "coupon_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Order_Items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Order_Items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "method" "public"."PaymentMethod" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "public"."PaymentStatus" NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reviews" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "parent_review_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Review_Images" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Review_Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Wishlists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_variant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User_Addresses" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_Addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."NotificationType" NOT NULL,
    "link" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Coupons" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" "public"."CouponType" NOT NULL,
    "discount_value" DOUBLE PRECISION NOT NULL,
    "min_order_amount" DOUBLE PRECISION,
    "max_uses" INTEGER,
    "used_count" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_clerkId_key" ON "public"."Users"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "public"."Users"("email");

-- CreateIndex
CREATE INDEX "Users_clerkId_idx" ON "public"."Users"("clerkId");

-- CreateIndex
CREATE INDEX "Users_email_idx" ON "public"."Users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Roles_name_key" ON "public"."Roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "public"."Permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_Roles_user_id_role_id_key" ON "public"."User_Roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "Role_Permissions_role_id_permission_id_key" ON "public"."Role_Permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "Categories_slug_key" ON "public"."Categories"("slug");

-- CreateIndex
CREATE INDEX "Categories_slug_idx" ON "public"."Categories"("slug");

-- CreateIndex
CREATE INDEX "Categories_parent_id_idx" ON "public"."Categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "Products_slug_key" ON "public"."Products"("slug");

-- CreateIndex
CREATE INDEX "Products_slug_idx" ON "public"."Products"("slug");

-- CreateIndex
CREATE INDEX "Products_category_id_idx" ON "public"."Products"("category_id");

-- CreateIndex
CREATE INDEX "Product_Images_product_id_idx" ON "public"."Product_Images"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Product_Variants_slug_key" ON "public"."Product_Variants"("slug");

-- CreateIndex
CREATE INDEX "Product_Variants_product_id_idx" ON "public"."Product_Variants"("product_id");

-- CreateIndex
CREATE INDEX "Product_Variants_slug_idx" ON "public"."Product_Variants"("slug");

-- CreateIndex
CREATE INDEX "Product_Attributes_name_idx" ON "public"."Product_Attributes"("name");

-- CreateIndex
CREATE INDEX "Product_Attribute_Values_attribute_id_idx" ON "public"."Product_Attribute_Values"("attribute_id");

-- CreateIndex
CREATE INDEX "Product_Variant_Attributes_product_variant_id_idx" ON "public"."Product_Variant_Attributes"("product_variant_id");

-- CreateIndex
CREATE INDEX "Product_Variant_Attributes_attribute_value_id_idx" ON "public"."Product_Variant_Attributes"("attribute_value_id");

-- CreateIndex
CREATE INDEX "Product_Variant_Attributes_product_variant_id_attribute_val_idx" ON "public"."Product_Variant_Attributes"("product_variant_id", "attribute_value_id");

-- CreateIndex
CREATE INDEX "Carts_user_id_idx" ON "public"."Carts"("user_id");

-- CreateIndex
CREATE INDEX "Cart_Items_cart_id_idx" ON "public"."Cart_Items"("cart_id");

-- CreateIndex
CREATE INDEX "Cart_Items_product_variant_id_idx" ON "public"."Cart_Items"("product_variant_id");

-- CreateIndex
CREATE INDEX "Cart_Items_cart_id_product_variant_id_idx" ON "public"."Cart_Items"("cart_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "Orders_user_id_idx" ON "public"."Orders"("user_id");

-- CreateIndex
CREATE INDEX "Orders_address_id_idx" ON "public"."Orders"("address_id");

-- CreateIndex
CREATE INDEX "Orders_status_idx" ON "public"."Orders"("status");

-- CreateIndex
CREATE INDEX "Orders_payment_method_idx" ON "public"."Orders"("payment_method");

-- CreateIndex
CREATE INDEX "Orders_payment_status_idx" ON "public"."Orders"("payment_status");

-- CreateIndex
CREATE INDEX "Orders_coupon_id_idx" ON "public"."Orders"("coupon_id");

-- CreateIndex
CREATE INDEX "Order_Items_order_id_idx" ON "public"."Order_Items"("order_id");

-- CreateIndex
CREATE INDEX "Order_Items_product_variant_id_idx" ON "public"."Order_Items"("product_variant_id");

-- CreateIndex
CREATE INDEX "Order_Items_order_id_product_variant_id_idx" ON "public"."Order_Items"("order_id", "product_variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_transaction_id_key" ON "public"."Payments"("transaction_id");

-- CreateIndex
CREATE INDEX "Payments_order_id_idx" ON "public"."Payments"("order_id");

-- CreateIndex
CREATE INDEX "Payments_method_idx" ON "public"."Payments"("method");

-- CreateIndex
CREATE INDEX "Payments_status_idx" ON "public"."Payments"("status");

-- CreateIndex
CREATE INDEX "Payments_transaction_id_idx" ON "public"."Payments"("transaction_id");

-- CreateIndex
CREATE INDEX "Reviews_product_id_idx" ON "public"."Reviews"("product_id");

-- CreateIndex
CREATE INDEX "Reviews_user_id_idx" ON "public"."Reviews"("user_id");

-- CreateIndex
CREATE INDEX "Reviews_parent_review_id_idx" ON "public"."Reviews"("parent_review_id");

-- CreateIndex
CREATE INDEX "Review_Images_review_id_idx" ON "public"."Review_Images"("review_id");

-- CreateIndex
CREATE INDEX "Wishlists_user_id_idx" ON "public"."Wishlists"("user_id");

-- CreateIndex
CREATE INDEX "Wishlists_product_variant_id_idx" ON "public"."Wishlists"("product_variant_id");

-- CreateIndex
CREATE INDEX "Wishlists_user_id_product_variant_id_idx" ON "public"."Wishlists"("user_id", "product_variant_id");

-- CreateIndex
CREATE INDEX "User_Addresses_user_id_idx" ON "public"."User_Addresses"("user_id");

-- CreateIndex
CREATE INDEX "Notifications_user_id_idx" ON "public"."Notifications"("user_id");

-- CreateIndex
CREATE INDEX "Notifications_type_idx" ON "public"."Notifications"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_code_key" ON "public"."Coupons"("code");

-- CreateIndex
CREATE INDEX "Coupons_code_idx" ON "public"."Coupons"("code");

-- CreateIndex
CREATE INDEX "Coupons_discount_type_idx" ON "public"."Coupons"("discount_type");

-- CreateIndex
CREATE INDEX "Coupons_start_date_idx" ON "public"."Coupons"("start_date");

-- CreateIndex
CREATE INDEX "Coupons_end_date_idx" ON "public"."Coupons"("end_date");

-- AddForeignKey
ALTER TABLE "public"."User_Roles" ADD CONSTRAINT "User_Roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User_Roles" ADD CONSTRAINT "User_Roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role_Permissions" ADD CONSTRAINT "Role_Permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Role_Permissions" ADD CONSTRAINT "Role_Permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Categories" ADD CONSTRAINT "Categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Products" ADD CONSTRAINT "Products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."Categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product_Images" ADD CONSTRAINT "Product_Images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product_Variants" ADD CONSTRAINT "Product_Variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product_Attribute_Values" ADD CONSTRAINT "Product_Attribute_Values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."Product_Attributes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product_Variant_Attributes" ADD CONSTRAINT "Product_Variant_Attributes_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."Product_Variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product_Variant_Attributes" ADD CONSTRAINT "Product_Variant_Attributes_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."Product_Attribute_Values"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Carts" ADD CONSTRAINT "Carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart_Items" ADD CONSTRAINT "Cart_Items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."Carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Cart_Items" ADD CONSTRAINT "Cart_Items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."Product_Variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."User_Addresses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "public"."Coupons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order_Items" ADD CONSTRAINT "Order_Items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Order_Items" ADD CONSTRAINT "Order_Items_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."Product_Variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payments" ADD CONSTRAINT "Payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."Products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reviews" ADD CONSTRAINT "Reviews_parent_review_id_fkey" FOREIGN KEY ("parent_review_id") REFERENCES "public"."Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review_Images" ADD CONSTRAINT "Review_Images_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."Reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wishlists" ADD CONSTRAINT "Wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Wishlists" ADD CONSTRAINT "Wishlists_product_variant_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "public"."Product_Variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."User_Addresses" ADD CONSTRAINT "User_Addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
