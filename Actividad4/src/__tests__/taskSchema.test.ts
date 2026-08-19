import { TaskSchema } from '../taskSchema';

describe('Task API contract', () => {
  it('accepts a valid task with an optional priority', () => {
    const result = TaskSchema.safeParse({
      id: 'task-001',
      title: 'Completar Actividad 4',
      completed: false,
      createdAt: '2026-08-18T10:00:00.000Z',
      priority: 'HIGH',
    });

    expect(result.success).toBe(true);
  });

  it('rejects invalid types and values', () => {
    const result = TaskSchema.safeParse({
      id: '',
      title: '   ',
      completed: 'false',
      createdAt: 'not-a-date',
      priority: 'URGENT',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(4);
    }
  });
});
