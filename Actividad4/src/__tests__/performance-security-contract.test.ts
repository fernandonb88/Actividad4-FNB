import { z } from 'zod';

const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

describe('Task Manager quality gates', () => {
  it('validates a compliant task payload for the API contract', () => {
    const validPayload = {
      id: 'task-101',
      title: 'Revisar pruebas de rendimiento',
      completed: false,
      createdAt: '2026-08-14T09:30:00.000Z',
      priority: 'HIGH',
    };

    expect(TaskSchema.safeParse(validPayload).success).toBe(true);
  });

  it('rejects a payload with invalid data types or malformed ISO date', () => {
    const invalidPayload = {
      id: 'task-102',
      title: '',
      completed: 'false',
      createdAt: 'not-an-iso-date',
      priority: 'URGENT',
    };

    expect(TaskSchema.safeParse(invalidPayload).success).toBe(false);
  });

  it('accepts a task without priority as optional data', () => {
    const payloadWithoutPriority = {
      id: 'task-103',
      title: 'Validar compatibilidad móvil',
      completed: true,
      createdAt: '2026-08-14T10:00:00.000Z',
    };

    expect(TaskSchema.safeParse(payloadWithoutPriority).success).toBe(true);
  });

  it('ensures security-related validation constraints are enforced for risky payloads', () => {
    const riskyPayload = {
      id: 'task-104',
      title: '   ',
      completed: false,
      createdAt: '2026-08-14T11:00:00.000Z',
      priority: 'LOW',
    };

    const result = TaskSchema.safeParse(riskyPayload);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toContain('title');
  });
});
