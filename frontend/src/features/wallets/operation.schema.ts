import { z } from 'zod';

// Mirrors the backend WalletOperationDto: positive decimal string, max 2 decimals.
export const walletOperationSchema = z.object({
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a positive amount with up to 2 decimals')
    .refine((value) => parseFloat(value) > 0, 'Amount must be greater than zero'),
  referenceId: z.string().trim().min(1, 'Reference is required').max(128),
  description: z.string().trim().max(255).optional().or(z.literal('')),
});

export type WalletOperationFormValues = z.infer<typeof walletOperationSchema>;
