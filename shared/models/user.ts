import { z } from "zod";
import { UserRole } from "../types";

const ZedUser = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email format"),
  role: z.nativeEnum(UserRole),
  password: z.string().min(5, "Password must be at least 5 characters long"),
  lastSeen: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  updatedAt: z.number().int().positive(),
});

type TZedUser = z.infer<typeof ZedUser>;

type TUser = TZedUser & {};

export { type TUser, ZedUser, type TZedUser };
