import { z } from "zod";

export const signUpInput = z.object({
  email: z.string(),
  password: z.string().min(4),
  name: z.string().optional(),
});

export const signInInput = z.object({
  password: z.string().min(4),
  name: z.string().optional(),
});

// Blogs ---------

export const createBlog = z.object({
  title: z.string(),
  content: z.string(),
});

export const updateBlog = z.object({
  blogId: z.string().uuid(),
  title: z.string(),
  content: z.string(),
});

export type SingUpInput = z.infer<typeof signUpInput>;
export type SingInInput = z.infer<typeof signInInput>;
export type CreateBlog = z.infer<typeof createBlog>;
export type UpdateBlog = z.infer<typeof updateBlog>;
