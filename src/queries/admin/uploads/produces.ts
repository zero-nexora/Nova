import { z } from "zod";
import { cloudinary } from "@/lib/cloudinary";
import { adminOrEmployee, createTRPCRouter } from "@/trpc/init";

const folder = process.env.CLOUDINARY_UPLOAD_FOLDER;

export const uploadRouter = createTRPCRouter({
  uploadImages: adminOrEmployee
    .input(
      z.object({ images: z.array(z.string({ message: "Image is required" })) })
    )
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.images.map((base64) =>
          cloudinary.uploader
            .upload(base64, {
              folder,
              resource_type: "image",
              overwrite: false,
            })
            .then(({ secure_url, public_id }) => ({
              imageUrl: secure_url,
              publicId: public_id,
            }))
        )
      );

      return { data: results };
    }),
  removeImages: adminOrEmployee
    .input(
      z.object({
        publicIds: z.array(z.string({ message: "Public ID is required" })),
      })
    )
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.publicIds.map((publicId) =>
          cloudinary.uploader
            .destroy(publicId, { resource_type: "image" })
            .then(() => ({ publicId, success: true }))
            .catch(() => ({ publicId, success: false }))
        )
      );

      return { data: results };
    }),
});
