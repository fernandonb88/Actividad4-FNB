import { z } from 'zod';

/**
 * ============================================================================
 * ESQUEMAS DE CONTRATO DE API - Task Manager
 * ============================================================================
 * 
 * Este archivo define los esquemas esperados para las respuestas de la API
 * que consume la aplicación Task Manager. Utiliza Zod para validación.
 * 
 * Endpoints Documentados:
 * - GET /tasks - Obtiene lista de tareas
 * - POST /tasks - Crea una nueva tarea
 * ============================================================================
 */

// ============================================================================
// 📋 ESQUEMA: Task (Tarea Individual)
// ============================================================================
/**
 * Estructura esperada para una tarea individual en las respuestas de la API
 * 
 * Campos Requeridos:
 * - id (string): Identificador único de la tarea, no puede estar vacío
 * - title (string): Título de la tarea, debe tener al menos 1 carácter
 * - status (enum): Estado de la tarea ('pending' o 'completed')
 * 
 * Campos Opcionales:
 * - createdAt (datetime): Fecha de creación en formato ISO 8601
 * - priority (enum): Prioridad de la tarea ('LOW', 'MEDIUM', 'HIGH')
 */
const TaskSchema = z.object({
  id: z.string().min(1, 'El ID debe ser no vacío'),
  title: z.string().min(1, 'El título debe tener al menos 1 carácter'),
  status: z.enum(['pending', 'completed'], {
    errorMap: () => ({ message: 'Status debe ser "pending" o "completed"' }),
  }),
  createdAt: z.string().datetime('Fecha debe ser ISO 8601').optional(),
  priority: z
    .enum(['LOW', 'MEDIUM', 'HIGH'], {
      errorMap: () => ({ message: 'Prioridad debe ser LOW, MEDIUM o HIGH' }),
    })
    .optional(),
});

// ============================================================================
// 📋 ESQUEMA: TaskArray (Lista de Tareas)
// ============================================================================
/**
 * Estructura esperada para la respuesta de GET /tasks
 * Debe ser un array de objetos Task válidos
 */
const TaskArraySchema = z.array(TaskSchema);

// ============================================================================
// 📋 ESQUEMA: CreateTaskRequest (Solicitud para crear tarea)
// ============================================================================
/**
 * Estructura esperada para la solicitud POST /tasks
 */
const CreateTaskRequestSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio y debe tener al menos 1 carácter'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

// ============================================================================
// 📋 ESQUEMA: CreateTaskResponse (Respuesta de crear tarea)
// ============================================================================
/**
 * Estructura esperada para la respuesta de POST /tasks
 * Debe ser una tarea individual válida
 */
const CreateTaskResponseSchema = TaskSchema;

// ============================================================================
// 🧪 TEST SUITE: Validación de Contrato de API
// ============================================================================

describe('📋 Task API Contract - GET /tasks', () => {
  /**
   * PRUEBA 1: Respuesta Válida del Endpoint GET /tasks
   * 
   * Objetivo: Verificar que el endpoint devuelve un array de tareas
   * en el formato esperado (respuesta CORRECTA)
   * 
   * Validaciones:
   * - Todos los campos requeridos están presentes
   * - Los tipos de datos son correctos
   * - Los valores cumplen con las restricciones del esquema
   */
  it('✅ VÁLIDO: Acepta respuesta válida con lista de tareas del endpoint GET /tasks', () => {
    // Arrange: Datos que sí cumplen con el contrato
    const validResponse = [
      {
        id: 'task-001',
        title: 'Completar Actividad 4',
        status: 'pending',
        createdAt: '2026-08-13T10:00:00.000Z',
        priority: 'HIGH',
      },
      {
        id: 'task-002',
        title: 'Revisar pruebas de seguridad',
        status: 'completed',
        createdAt: '2026-08-12T15:30:00.000Z',
        priority: 'MEDIUM',
      },
      {
        id: 'task-003',
        title: 'Implementar endpoint',
        status: 'pending',
        createdAt: '2026-08-14T08:00:00.000Z',
        // priority es opcional, no es necesario incluirlo
      },
    ];

    // Act: Validar con el esquema
    const result = TaskArraySchema.safeParse(validResponse);

    // Assert: Debe ser válido
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(3);
      expect(result.data[0].id).toBe('task-001');
      expect(result.data[0].title).toBe('Completar Actividad 4');
      expect(result.data[0].status).toBe('pending');
      expect(result.data[2].priority).toBeUndefined(); // Campo opcional
    }
  });

  /**
   * PRUEBA 2: Respuesta Inválida del Endpoint GET /tasks
   * 
   * Objetivo: Verificar que el endpoint RECHAZA respuestas que no cumplen
   * con el contrato definido (respuesta INCORRECTA)
   * 
   * Violaciones del Contrato:
   * - Campo 'title' vacío (viola min(1))
   * - Campo 'status' con valor inválido ('in-progress' no permitido)
   * - Campo 'priority' con valor inválido ('URGENT' no está en enum)
   * - Campo 'completed' usando boolean en lugar de 'status' con enum
   */
  it('❌ INVÁLIDO: Rechaza respuesta inválida que no cumple el contrato de GET /tasks', () => {
    // Arrange: Datos que NO cumplen con el contrato
    const invalidResponse = [
      {
        id: 'task-123',
        title: '', // ❌ VIOLACIÓN: título vacío (requiere min 1)
        completed: 'false', // ❌ VIOLACIÓN: campo 'completed' no existe, debe ser 'status'
        createdAt: 'fecha-invalida', // ❌ VIOLACIÓN: no es datetime ISO 8601
        priority: 'URGENT', // ❌ VIOLACIÓN: 'URGENT' no está en enum ['LOW', 'MEDIUM', 'HIGH']
      },
    ];

    // Act: Validar con el esquema
    const result = TaskArraySchema.safeParse(invalidResponse);

    // Assert: Debe fallar la validación
    expect(result.success).toBe(false);
    if (!result.success) {
      // Verificar que hay errores en los campos violados
      expect(result.error.issues.length).toBeGreaterThan(0);
      const errorMessages = result.error.issues.map((issue) => issue.code);
      expect(errorMessages).toContain('invalid_enum_value'); // priority inválida
    }
  });

  /**
   * PRUEBA 3: Array Vacío (Caso Límite)
   * 
   * Objetivo: Verificar que el endpoint puede devolver un array vacío
   * cuando no hay tareas, lo cual es una respuesta válida
   */
  it('✅ VÁLIDO: Acepta array vacío como respuesta válida de GET /tasks', () => {
    const validEmptyResponse: unknown[] = [];

    const result = TaskArraySchema.safeParse(validEmptyResponse);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(0);
    }
  });

  /**
   * PRUEBA 4: Campo Requerido Faltante
   * 
   * Objetivo: Verificar que el esquema rechaza respuestas que faltan campos
   * requeridos como 'id', 'title' o 'status'
   */
  it('❌ INVÁLIDO: Rechaza respuesta con campos requeridos faltantes', () => {
    const invalidResponse = [
      {
        // ❌ Falta 'id'
        title: 'Tarea sin ID',
        status: 'pending',
      },
      {
        id: 'task-456',
        // ❌ Falta 'title'
        status: 'completed',
      },
      {
        id: 'task-789',
        title: 'Tarea sin status',
        // ❌ Falta 'status'
      },
    ];

    const result = TaskArraySchema.safeParse(invalidResponse);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 🧪 TEST SUITE: Validación de Contrato POST /tasks
// ============================================================================

describe('📋 Task API Contract - POST /tasks', () => {
  /**
   * PRUEBA 5: Solicitud de Creación VÁLIDA
   * 
   * Objetivo: Verificar que la solicitud de creación cumple el contrato
   */
  it('✅ VÁLIDO: Acepta solicitud válida para crear tarea en POST /tasks', () => {
    const validCreateRequest = {
      title: 'Nueva tarea importante',
      priority: 'HIGH',
    };

    const result = CreateTaskRequestSchema.safeParse(validCreateRequest);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Nueva tarea importante');
      expect(result.data.priority).toBe('HIGH');
    }
  });

  /**
   * PRUEBA 6: Respuesta de Creación VÁLIDA
   * 
   * Objetivo: Verificar que la respuesta del servidor después de crear
   * una tarea cumple con el contrato esperado
   */
  it('✅ VÁLIDO: Acepta respuesta válida de creación de tarea (POST /tasks)', () => {
    const validCreateResponse = {
      id: 'task-new-001',
      title: 'Tarea recientemente creada',
      status: 'pending',
      createdAt: '2026-08-14T14:30:00.000Z',
      priority: 'MEDIUM',
    };

    const result = CreateTaskResponseSchema.safeParse(validCreateResponse);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBeDefined();
      expect(result.data.status).toBe('pending');
    }
  });

  /**
   * PRUEBA 7: Solicitud INVÁLIDA para Crear Tarea
   * 
   * Objetivo: Verificar que rechaza solicitudes que no cumplen el contrato
   * (ej: título vacío, priority inválida)
   */
  it('❌ INVÁLIDO: Rechaza solicitud inválida para crear tarea', () => {
    const invalidCreateRequest = {
      title: '', // ❌ Violación: título vacío
      priority: 'URGENT', // ❌ Violación: priority no válida
    };

    const result = CreateTaskRequestSchema.safeParse(invalidCreateRequest);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 🧪 TEST SUITE: Validación de Tipos de Datos
// ============================================================================

describe('📋 Task API Contract - Validación de Tipos de Datos', () => {
  /**
   * PRUEBA 8: Tipo de Dato Incorrecto (ID)
   * 
   * Objetivo: Verificar que se rechaza cuando 'id' no es string
   */
  it('❌ INVÁLIDO: Rechaza task con ID que no es string', () => {
    const invalidTask = {
      id: 123, // ❌ ID debe ser string, no number
      title: 'Tarea con ID número',
      status: 'pending',
    };

    const result = TaskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
  });

  /**
   * PRUEBA 9: Tipo de Dato Incorrecto (Status)
   * 
   * Objetivo: Verificar que se rechaza cuando 'status' es boolean
   */
  it('❌ INVÁLIDO: Rechaza task con status de tipo boolean', () => {
    const invalidTask = {
      id: 'task-001',
      title: 'Tarea con status boolean',
      status: true, // ❌ Status debe ser enum, no boolean
    };

    const result = TaskSchema.safeParse(invalidTask);

    expect(result.success).toBe(false);
  });
});

// ============================================================================
// 📊 RESUMEN DEL CONTRATO DE API
// ============================================================================
/**
 * RESUMEN DEL CONTRATO VALIDADO:
 * 
 * ✅ ENDPOINT: GET /tasks
 *    - Retorna: Array de objetos Task
 *    - Campos obligatorios: id (string), title (string), status (enum)
 *    - Campos opcionales: createdAt (ISO 8601), priority (enum)
 *    - Casos: Puede ser array vacío si no hay tareas
 * 
 * ✅ ENDPOINT: POST /tasks
 *    - Request: { title (string requerido), priority? (enum) }
 *    - Response: Task completo con id autogenerado
 *    - Status inicial: siempre "pending"
 * 
 * 🔍 VALIDACIONES:
 *    - Strings vacíos: RECHAZADOS
 *    - Enum values: ESTRICTAMENTE VALIDADOS
 *    - ISO 8601: REQUERIDO para createdAt
 *    - Tipos de datos: ESTRICTAMENTE VALIDADOS
 * 
 * 📝 TOTAL DE PRUEBAS: 9
 *    - Casos Válidos: 5 ✅
 *    - Casos Inválidos: 4 ❌
 */
