import { z } from 'zod';

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: "Type must be either 'income' or 'expense'" }),
  }),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().trim().min(1, 'Description is required').max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const queryTransactionSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['income', 'expense']).optional(),
  categoryId: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sort: z.enum(['date', 'amount', 'created_at']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(500).default(200),
  offset: z.coerce.number().int().min(0).default(0),
});

