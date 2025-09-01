import z from "zod";

export const uploadImageSchema = z.object({
  base64: z.string({ message: "Image is required " }),
  filename: z.string().optional(),
  folder: z.string().optional(),
});
