import z from "zod";
import { uploadImageSchema } from "./types";
import { cloudinary } from "@/lib/cloudinary";
import { adminOrEmployee, createTRPCRouter } from "@/trpc/init";

export const uploadRouter = createTRPCRouter({
  uploadImages: adminOrEmployee
    .input(
      z.object({
        images: z.array(uploadImageSchema),
        folder: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const folder = input.folder || process.env.CLOUDINARY_UPLOAD_FOLDER;
      const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET;

      const results = await Promise.all(
        input.images.map(async (image) => {
          const res = await cloudinary.uploader.upload(image.base64, {
            folder: image.folder || folder,
            resource_type: "image",
            overwrite: false,
            upload_preset,
          });

          return {
            url: res.secure_url,
            publicId: res.public_id,
          };
        })
      );

      return { data: results };
    }),

  deleteImage: adminOrEmployee
    .input(
      z.object({
        public_id: z.string({ message: "public_id is required " }),
      })
    )
    .mutation(async ({ input }) => {
      const res = await cloudinary.uploader.destroy(input.public_id, {
        resource_type: "image",
        invalidate: true,
      });

      return { data: res.result };
    }),
});
