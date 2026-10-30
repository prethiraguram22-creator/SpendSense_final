import { z } from 'zod';

export const saveGoalSchema = z.object({
  name: z.string().trim().min(1, 'Goal name is required').max(100),
  target: z.coerce.number().positive('Target amount must be greater than zero'),
  saved: z.coerce.number().min(0, 'Saved amount cannot be negative').default(0),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be formatted as YYYY-MM-DD'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Color must be a valid hex string').default('#2dd4bf'),
});

export const updateGoalSchema = saveGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amount: z.coerce.number().positive('Contribution amount must be greater than zero'),
});

