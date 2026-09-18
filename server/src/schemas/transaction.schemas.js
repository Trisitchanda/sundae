import { z } from 'zod';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createTransactionSchema = {
  body: z.object({
    type: z.enum(['EXPENSE', 'INCOME', 'TRANSFER', 'REFUND']),
    amount: z.number().positive(),
    date: z.string().datetime().or(z.string()),
    description: z.string().min(1),
    categoryId: z.string().regex(objectIdPattern, 'Invalid Category ID').optional().nullable(),
    accountId: z.string().regex(objectIdPattern, 'Invalid Account ID').optional().nullable(),
    sourceAccountId: z.string().regex(objectIdPattern, 'Invalid Source Account ID').optional().nullable(),
    destinationAccountId: z.string().regex(objectIdPattern, 'Invalid Destination Account ID').optional().nullable(),
    originalTransactionId: z.string().regex(objectIdPattern, 'Invalid Original Transaction ID').optional().nullable(),
    notes: z.string().optional()
  }).superRefine((data, ctx) => {
    if (['EXPENSE', 'INCOME', 'REFUND'].includes(data.type) && !data.accountId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'accountId is required for this transaction type',
        path: ['accountId']
      });
    }
    if (data.type === 'TRANSFER' && (!data.sourceAccountId || !data.destinationAccountId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Both sourceAccountId and destinationAccountId are required for TRANSFER',
        path: ['sourceAccountId'] // pointing it generally
      });
    }
  })
};

export const getTransactionsSchema = {
  query: z.object({
    month: z.string().regex(/^\d{1,2}$/).optional(),
    year: z.string().regex(/^\d{4}$/).optional(),
    sort: z.enum(['asc', 'desc']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().optional(),
    categoryId: z.string().optional()
  })
};
