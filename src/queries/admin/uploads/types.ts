import z from "zod";
import { MAX_IMAGES_PER_REQUEST } from "./utils";

export const UploadSingleImageSchema = z.object({
  image: z.string().min(1, "Image data cannot be empty"),
});

export const UploadImagesSchema = z.object({
  images: z
    .array(z.string().min(1, "Image data cannot be empty"))
    .min(2, "At least two image is required")
    .max(
      MAX_IMAGES_PER_REQUEST,
      `Maximum ${MAX_IMAGES_PER_REQUEST} images allowed per request`
    ),
});

export const DeleteSingleImageSchema = z.object({
  publicId: z.string().min(1, "Public ID cannot be empty"),
});

export const DeleteImagesSchema = z.object({
  publicIds: z
    .array(z.string().min(1, "Public ID cannot be empty"))
    .min(2, "At least two public ID is required")
    .max(
      MAX_IMAGES_PER_REQUEST,
      `Maximum ${MAX_IMAGES_PER_REQUEST} public IDs allowed per request`
    ),
});

export type UploadSingleImageType = z.infer<typeof UploadImagesSchema>;
export type UploadImagesType = z.infer<typeof UploadImagesSchema>;
export type DeleteSingleImageType = z.infer<typeof DeleteSingleImageSchema>;
export type DeleteImagesType = z.infer<typeof DeleteImagesSchema>;
