import { z } from 'zod';
import { USER_ROLES } from '../config/constants.js';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters long'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().trim().optional().default(''),
  role: z.enum([USER_ROLES.CUSTOMER, USER_ROLES.OPERATOR, USER_ROLES.ADMIN]).optional().default(USER_ROLES.CUSTOMER),
  operatorId: z.string().optional().nullable()
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

