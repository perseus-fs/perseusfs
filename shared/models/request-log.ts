import { z } from "zod";

const ZedRequestLog = z.object({
  id: z.number().int().positive(),
  method: z.string().min(1, "Method cannot be empty"),
  address: z.string().min(1, "Address cannot be empty"),
  path: z.string().min(1, "Path cannot be empty"),
  status: z.number().int().positive(),
  time: z.number().positive(),
  country: z.string().nullable(),
  createdAt: z.number().int().positive(),
});

type TZedRequestLog = z.infer<typeof ZedRequestLog>;

type TRequestLog = TZedRequestLog & {};

export { type TRequestLog, ZedRequestLog, type TZedRequestLog };
