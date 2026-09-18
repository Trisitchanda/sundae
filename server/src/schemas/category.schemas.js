import { z } from 'zod';

export const createCategorySchema = {
  body: z.object({
    name: z.string().min(1)
  })
};

export const updateCategorySchema = {
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID')
  }),
  body: z.object({
    budgetLimit: z.number().min(0).nullable().optional()
  })
};
