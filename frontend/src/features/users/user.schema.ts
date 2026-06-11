import { z } from 'zod';

// Mirrors the backend CreateUserDto validation so errors surface before the request.
export const createUserSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{7,15}$/, 'Enter a valid phone number (7-15 digits, optional +)'),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
