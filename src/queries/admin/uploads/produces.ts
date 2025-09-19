import { TRPCError } from "@trpc/server";
import { deleteSingleImage, uploadSingleImage } from "./utils";
import { adminOrEmployee, createTRPCRouter } from "@/trpc/init";
import {
  DeleteImagesSchema,
  DeleteSingleImageSchema,
  UploadImagesSchema,
  UploadSingleImageSchema,
} from "./types";

export const uploadRouter = createTRPCRouter({
  uploadImage: adminOrEmployee
    .input(UploadSingleImageSchema)
    .mutation(async ({ input }) => {
      const { image } = input;

      try {
        const result = await uploadSingleImage(image);

        return {
          success: true,
          data: result,
        };
      } catch (error) {
        console.error("Single upload error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload image. Please try again.",
        });
      }
    }),

  uploadImages: adminOrEmployee
    .input(UploadImagesSchema)
    .mutation(async ({ input }) => {
      const { images } = input;

      try {
        const uploadPromises = images.map((base64, index) =>
          uploadSingleImage(base64).catch((error) => {
            console.error(`Failed to upload image ${index + 1}:`, error);
            throw error;
          })
        );

        const results = await Promise.all(uploadPromises);

        return {
          success: true,
          data: results,
        };
      } catch (error) {
        console.error("Batch upload error:", error);
        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload images. Please try again.",
        });
      }
    }),

  deleteImage: adminOrEmployee
    .input(DeleteSingleImageSchema)
    .mutation(async ({ input }) => {
      const { publicId } = input;

      try {
        const result = await deleteSingleImage(publicId);

        return {
          success: result.success,
          data: result,
        };
      } catch (error) {
        console.error("Single delete error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete image. Please try again.",
        });
      }
    }),

  deleteImages: adminOrEmployee
    .input(DeleteImagesSchema)
    .mutation(async ({ input }) => {
      const { publicIds } = input;

      try {
        const deletePromises = publicIds.map(deleteSingleImage);
        const results = await Promise.all(deletePromises);

        const successful = results.filter((result) => result.success);
        const failed = results.filter((result) => !result.success);

        return {
          total: results.length,
          successful: successful.length,
          failed: failed.length,
        };
      } catch (error) {
        console.error("Batch deletion error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete images. Please try again.",
        });
      }
    }),
});
