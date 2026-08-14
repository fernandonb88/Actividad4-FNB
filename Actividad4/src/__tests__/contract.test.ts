import { TaskSchema } from '../taskSchema';

describe('Task API Contract', () => {
  it('acepta una respuesta válida del endpoint de tareas', () => {
    const validResponse = {
      id: 'task-123',
      title: 'Completar actividad 4',
      completed: false,
      createdAt: '2026-08-13T10:00:00.000Z',
      priority: 'HIGH',
    };

    const result = TaskSchema.safeParse(validResponse);

    expect(result.success).toBe(true);
  });

  it('acepta una tarea sin prioridad opcional', () => {
    const responseWithoutPriority = {
      id: 'task-456',
      title: 'Tarea sin prioridad',
      completed: true,
      createdAt: '2026-08-14T12:30:00.000Z',
    };

    const result = TaskSchema.safeParse(responseWithoutPriority);

    expect(result.success).toBe(true);
  });

  it('rechaza una respuesta inválida del endpoint de tareas', () => {
    const invalidResponse = {
      id: 'task-123',
      title: '',
      completed: 'false',
      createdAt: 'fecha-invalida',
      priority: 'URGENT',
    };

    const result = TaskSchema.safeParse(invalidResponse);

    expect(result.success).toBe(false);
  });

  it('rechaza una tarea con createdAt inválido', () => {
    const invalidDateResponse = {
      id: 'task-789',
      title: 'Fecha inválida',
      completed: false,
      createdAt: 'not-a-date',
    };

    const result = TaskSchema.safeParse(invalidDateResponse);

    expect(result.success).toBe(false);
  });
});
