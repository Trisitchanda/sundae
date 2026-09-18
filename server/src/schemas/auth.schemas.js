import { z } from 'zod';

export const registerSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
  })
};

export const loginSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  })
};

export const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string(),
    newPassword: z.string().min(8),
  })
};
