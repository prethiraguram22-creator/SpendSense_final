import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  email: z.string().trim().email().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'INR']).optional(),
  openingBalance: z.coerce.number().optional(),
  hideBalance: z.boolean().optional(),
  notifications: z
    .object({
      budgetAlerts: z.boolean().optional(),
      weeklyDigest: z.boolean().optional(),
      goalMilestones: z.boolean().optional(),
    })
    .optional(),
  dismissedRecommendations: z.array(z.string()).optional(),
});

