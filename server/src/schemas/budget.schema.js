import { z } from 'zod';

export const saveBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  limit: z.coerce.number().positive('Budget limit must be greater than zero'),
});

export const updateBudgetSchema = z.object({
  limit: z.coerce.number().positive('Budget limit must be greater than zero'),
});

