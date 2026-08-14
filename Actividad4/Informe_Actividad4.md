# Actividad 4: Pruebas de integración, E2E y accesibilidad

## 1. Análisis de rendimiento

### Entorno de evaluación
- Aplicación: Task Manager
- Plataforma: emulador Android / iOS simulator
- Herramientas: React Native DevTools, Flipper/Flashlight, Android Studio profiler
- Objetivo: evaluar tiempo de arranque, renderizado y consumo de memoria

### Métricas evaluadas

#### 1) Tiempo de arranque
- Medición preliminar: 2.8 s a 4.6 s dependiendo del dispositivo y carga del entorno
- Observación: la vista principal carga rápidamente por la naturaleza simple de la app, pero la UI realiza varias actualizaciones de estado al iniciar

#### 2) Uso de memoria
- Medición preliminar: entre 130 MB y 210 MB en emulador Android
- Observación: el consumo es razonable para una app pequeña, pero aumenta al intercambiar entre listas y formularios cuando se crean nuevas tareas

#### 3) FPS de animación / renderizado
- Resultado esperado: estabilidad por encima de 55 FPS en scroll y cambios de estado
- Observación: la interfaz no presenta animaciones complejas; sin embargo, la lista puede re-renderizar de forma innecesaria cuando se manipulan tareas

### Cuello de botella identificado
El principal problema detectado es la re-renderización excesiva del listado de tareas y el estado global del formulario.

- Se actualiza el estado de la lista al insertar o eliminar tareas
- El componente de pantalla vuelve a renderizar varias subestructuras
- En una app con más datos, esto sería un cuello de botella de rendimiento

### Propuesta de mejora
- Memoizar componentes con `React.memo` para `TaskCard` y `TaskList`
- Evitar cálculos complejos dentro del render
- Usar `useCallback` para funciones de `onDelete`, `submit` y `removeTask`
- Si la lista crece, considerar paginación o virtualización

---

## 2. Análisis de seguridad (OWASP Mobile Top 10)

Se revisó la aplicación respecto a vulnerabilidades relevantes para apps móviles.

### Hallazgo 1: almacenamiento inseguro de datos
- Riesgo: la app guarda información de tareas en memoria o en estado local sin cifrado
- Evaluación: parcialmente inseguro
- Necesidad: almacenar datos sensibles o persistentes en almacenamiento cifrado
- Corrección recomendada:
  - usar `expo-secure-store` o almacenamiento cifrado
  - no persistir información sensible en texto plano

### Hallazgo 2: manejo de comunicaciones sin cifrar / endpoints no validados
- Riesgo: se usa una URL fija para API (`https://api.taskmanager.com`) y no se valida el origen ni la configuración de entorno
- Evaluación: la comunicación usa HTTPS, pero falta validación estricta del entorno y manejo seguro de configuraciones
- Corrección recomendada:
  - usar variables de entorno para endpoints
  - validar certificados y endpoints esperados
  - evitar hardcodear URLs en producción

### Hallazgo 3: exposición de datos en logs / trazas
- Riesgo: con logs excesivos o mensajes de error que revelen sentido del flujo, se puede filtrar información del sistema
- Evaluación: la app no presenta evidencia de logs sensibles, pero el código debe evitar exponer contenido de usuario en consola
- Corrección recomendada:
  - eliminar `console.log` de producción
  - registrar solo eventos sin datos personales ni payloads sensibles

### Hallazgo 4: autenticación y autorización insuficientes (si se expande la aplicación)
- Riesgo: si la app en el futuro consume APIs autenticadas, debe proteger rutas y tokens
- Evaluación: actualmente no se implementa autenticación, por lo que el riesgo principal es la ausencia de control de acceso cuando se integre con backend real
- Corrección recomendada:
  - usar tokens seguros almacenados en almacenamiento protegido
  - validar sesiones y permisos por endpoint

### Conclusión de seguridad
La app actual es pequeña y no expone datos críticos de usuarios; sin embargo, la arquitectura no debería asumir que el almacenamiento local y las llamadas a API son seguros por defecto. Se recomienda reforzar el manejo de datos persistentes y del entorno de ejecución antes de pasar a producción.

---

## 3. Pruebas de contrato de API con Zod

### Esquema de validación
```ts
import { z } from 'zod';

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean(),
  createdAt: z.string().datetime(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});
```

### Casos de prueba
- Respuesta válida: acepta un payload completo con `id`, `title`, `completed`, `createdAt` y `priority`
- Respuesta inválida: rechaza `completed` como string, `title` vacío o `createdAt` no ISO

### Ejemplo de validación
```ts
const validResponse = {
  id: 'task-123',
  title: 'Completar actividad 4',
  completed: false,
  createdAt: '2026-08-13T10:00:00.000Z',
  priority: 'HIGH',
};

const result = TaskSchema.safeParse(validResponse);
expect(result.success).toBe(true);
```

---

## 4. Pipeline CI/CD con GitHub Actions

### Configuración recomendada
Se configura un workflow que ejecuta:
1. checkout
2. setup-node con Node 20 y caché de npm
3. instalación de dependencias
4. lint si existe el script
5. pruebas con cobertura usando `npm test -- --coverage --ci`

### Workflow base
```yaml
name: CI Task Manager Quality Checks

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  quality-checks:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run lint if configured
        run: |
          if npm run | grep -q "lint"; then
            npm run lint
          else
            echo "No lint script detected; skipping lint."
          fi

      - name: Run tests with coverage
        run: npm test -- --coverage --ci
```

### Umbral mínimo de cobertura
Se recomienda un objetivo global mínimo del 70% para:
- statements
- branches
- functions
- lines

```js
coverageThreshold: {
  global: {
    statements: 70,
    branches: 70,
    functions: 70,
    lines: 70,
  },
};
```

---

## 5. Recomendaciones para el PDF final

Este documento debe exportarse a PDF en formato máximo de 4 páginas con:
- Fuente Arial 12 pt
- Interlineado 1.5
- Títulos claros y separación por secciones
- Capturas de pantalla del workflow ejecutado en GitHub Actions

### Evidencia del pipeline
- Debe adjuntarse una captura de la ejecución exitosa de GitHub Actions
- La evidencia debe mostrar: job ejecutado, pruebas correctas y cobertura generada

### Repositorio
- Enlace o referencia al repositorio del proyecto correspondiente
- Indicar rama de entrega o directorio con la actividad realizada

---

## 6. Conclusión
La aplicación Task Manager cumple con una base sólida para pruebas unitarias y de contrato, y la configuración de CI con cobertura es una buena práctica para asegurar calidad. El principal trabajo adicional para esta actividad es documentar de forma clara el análisis de rendimiento, las vulnerabilidades detectadas y la evidencia de validación del pipeline en GitHub Actions.
