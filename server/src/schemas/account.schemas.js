import { z } from 'zod';

export const createAccountSchema = {
  body: z.object({
    name: z.string().min(1),
    type: z.enum(['BANK', 'CASH', 'CREDIT_CARD', 'WALLET', 'SAVINGS']),
    balance: z.number().optional(),
    creditLimit: z.number().nullable().optional()
  })
};
