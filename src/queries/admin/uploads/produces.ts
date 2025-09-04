import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { cloudinary } from "@/lib/cloudinary";
import { adminOrEmployee, createTRPCRouter } from "@/trpc/init";

// Constants
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER;
const MAX_IMAGES_PER_REQUEST = 10;

// Input Schemas
const uploadImagesSchema = z.object({
  images: z
    .array(z.string().min(1, "Image data cannot be empty"))
    .min(1, "At least one image is required")
    .max(
      MAX_IMAGES_PER_REQUEST,
      `Maximum ${MAX_IMAGES_PER_REQUEST} images allowed per request`
    ),
});

const removeImagesSchema = z.object({
  publicIds: z
    .array(z.string().min(1, "Public ID cannot be empty"))
    .min(1, "At least one public ID is required")
    .max(
      MAX_IMAGES_PER_REQUEST,
      `Maximum ${MAX_IMAGES_PER_REQUEST} public IDs allowed per request`
    ),
});

// Types
interface UploadResult {
  imageUrl: string;
  publicId: string;
}

interface RemoveResult {
  publicId: string;
  success: boolean;
  error?: string;
}

// Utility Functions
const validateBase64Image = (base64String: string): boolean => {
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Pattern.test(base64String);
};

const uploadSingleImage = async (base64: string): Promise<UploadResult> => {
  // Validate base64 format
  if (!validateBase64Image(base64)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Invalid image format. Only JPEG, PNG, GIF, and WebP are supported.",
    });
  }

  try {
    const result = await cloudinary.uploader.upload(base64, {
      folder: UPLOAD_FOLDER,
      resource_type: "image",
      overwrite: false,
    });

    return {
      imageUrl: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload image to cloud storage",
    });
  }
};

const removeSingleImage = async (publicId: string): Promise<RemoveResult> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    const success = result.result === "ok" || result.result === "not found";

    return {
      publicId,
      success,
      error: success ? undefined : `Failed to delete: ${result.result}`,
    };
  } catch (error) {
    console.error(`Error removing image ${publicId}:`, error);
    return {
      publicId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Router
export const uploadRouter = createTRPCRouter({
  /**
   * Upload multiple images to Cloudinary
   */
  uploadImages: adminOrEmployee
    .input(uploadImagesSchema)
    .mutation(async ({ input }) => {
      const { images } = input;

      try {
        // Upload all images concurrently
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
          message: `Successfully uploaded ${results.length} image(s)`,
        };
      } catch (error) {
        console.error("Batch upload error:", error);

        // If it's already a TRPCError, re-throw it
        if (error instanceof TRPCError) {
          throw error;
        }

        // Otherwise, wrap in a generic error
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload images. Please try again.",
        });
      }
    }),

  /**
   * Remove multiple images from Cloudinary
   */
  removeImages: adminOrEmployee
    .input(removeImagesSchema)
    .mutation(async ({ input }) => {
      const { publicIds } = input;

      try {
        // Remove all images concurrently (don't fail fast)
        const removePromises = publicIds.map(removeSingleImage);
        const results = await Promise.all(removePromises);

        // Separate successful and failed removals
        const successful = results.filter((result) => result.success);
        const failed = results.filter((result) => !result.success);

        return {
          success: failed.length === 0,
          data: results,
          summary: {
            total: results.length,
            successful: successful.length,
            failed: failed.length,
          },
          message:
            failed.length === 0
              ? `Successfully removed ${successful.length} image(s)`
              : `Removed ${successful.length}/${results.length} images. ${failed.length} failed.`,
        };
      } catch (error) {
        console.error("Batch removal error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to remove images. Please try again.",
        });
      }
    }),

  /**
   * Get upload configuration and limits
   */
  getUploadConfig: adminOrEmployee.query(() => ({
    maxImagesPerRequest: MAX_IMAGES_PER_REQUEST,
    supportedFormats: ["JPEG", "PNG", "GIF", "WebP"],
    uploadFolder: UPLOAD_FOLDER,
    maxFileSize: "10MB", // Cloudinary default
  })),
});
