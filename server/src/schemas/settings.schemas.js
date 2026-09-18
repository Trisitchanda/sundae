import { z } from 'zod';

export const updateIncomeSchema = {
  body: z.object({
    baseSalary: z.number().min(0)
  })
};

export const updateSavingsGoalSchema = {
  body: z.object({
    savingsGoalRate: z.number().min(0).max(100)
  })
};
