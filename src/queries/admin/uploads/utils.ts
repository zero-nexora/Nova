import { TRPCError } from "@trpc/server";
import { cloudinary } from "@/lib/cloudinary";

export const MAX_IMAGES_PER_REQUEST = 10;
export const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER;

interface UploadResult {
  imageUrl: string;
  publicId: string;
}

interface DeleteResult {
  publicId: string;
  success: boolean;
  error?: string;
}

const validateBase64Image = (base64String: string): boolean => {
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Pattern.test(base64String);
};

export const uploadSingleImage = async (
  base64: string
): Promise<UploadResult> => {
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

export const deleteSingleImage = async (
  publicId: string
): Promise<DeleteResult> => {
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
    console.error(`Error deleting image ${publicId}:`, error);
    return {
      publicId,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
