import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export type Task = z.infer<typeof TaskSchema>;
