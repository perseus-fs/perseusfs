import { z } from "zod";

const ZedFile = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name cannot be empty"),
  originalName: z.string().min(1, "Original name cannot be empty"),
  size: z.number().int().positive(),
  contentType: z.string().min(1, "Content type cannot be empty"),
  uploadedBy: z.number().int().positive().nullable(),
  path: z.string().min(1, "Path cannot be empty").nullable(),
  hash: z.string().min(1, "Hash cannot be empty"),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

type TZedFile = z.infer<typeof ZedFile>;

type TFile = TZedFile & {};

export { type TFile, ZedFile, type TZedFile };
