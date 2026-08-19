# Actividad 4 - Pruebas de integracion, E2E y accesibilidad

**Estudiante:** Fernando Navia Bolanos  
**Asignatura:** Pruebas y Calidad de Software Movil con React Native  
**Proyecto:** task-manager-testing-lab  
**Repositorio:** https://github.com/fernandonb88/Actividad4-FNB  
**Rama:** `Actividad-4`  
**Entrega:** carpeta `Actividad4/`  
**Fecha de verificacion:** 19 de agosto de 2026

## 1. Verificacion de la entrega

La actividad tiene archivos propios dentro de `Actividad4/`, diferentes de los tests originales del proyecto:

- `Actividad4/src/__tests__/taskSchema.test.ts`: contrato Zod.
- `Actividad4/src/__tests__/performanceChecks.test.ts`: umbrales de rendimiento.
- `Actividad4/src/__tests__/securityAudit.test.ts`: auditoria estatica del servicio real.
- `Actividad4/src/__tests__/compatibilityMatrix.test.ts`: versiones, resoluciones y densidades.
- `Actividad4/.github/workflows/tests.yml`: workflow de GitHub Actions.

Comando ejecutado desde la raiz del proyecto:

```bash
cd Actividad4
npm test -- --runInBand --ci --coverage
```

Resultado de la carpeta `Actividad4`:

```text
Test Suites: 4 passed, 4 total
Tests: 8 passed, 8 total
Statements: 100% | Branches: 93.33% | Functions: 100% | Lines: 100%
```

Resultado de la suite completa de la aplicacion, que incluye los tests de Actividad 4:

```text
Test Suites: 18 passed, 18 total
Tests: 85 passed, 85 total
Statements: 84.61% | Branches: 87.8% | Functions: 81.08% | Lines: 86.48%
```

Tambien se ejecuto `npx tsc --noEmit` dentro de `Actividad4` y no se encontraron errores de TypeScript.

## 2. Analisis de rendimiento

El modulo `Actividad4/src/performanceChecks.ts` evalua tres metricas y reporta problemas cuando se superan estos limites: arranque mayor a 4,000 ms, memoria mayor a 200 MB y FPS menor a 55.

El escenario documentado fue un emulador Android API 33 con 4 GB de RAM, durante el arranque y operaciones basicas de tareas:

| Metrica | Resultado | Umbral | Estado |
|---|---:|---:|---|
| Tiempo de arranque | 2,850 ms | <= 4,000 ms | Aceptable |
| Memoria pico | 145 MB | <= 200 MB | Aceptable |
| FPS promedio | 58 FPS | >= 55 FPS | Aceptable |

La prueba automatizada verifica que el evaluador acepta valores dentro de los limites y detecta los tres problemas cuando recibe valores fuera de ellos. El archivo no mide por si solo la memoria o los FPS del dispositivo; esas cifras corresponden al escenario de emulador documentado.

**Cuello de botella identificado:** al cargar mas de 100 tareas puede aumentar el uso de memoria y el trabajo de renderizado. Es un area de mejora observada en el escenario, no una prueba de 10,000 usuarios. Se propone paginacion de 20 elementos, virtualizacion de listas y medicion posterior para decidir si conviene `React.memo`.

Como segunda area de mejora, el arranque en frio de 2.85 segundos incluye la carga inicial del bundle. Se propone revisar el tamano del bundle y sus dependencias con un perfilador antes de aplicar lazy loading.

## 3. Analisis de seguridad OWASP Mobile Top 10

Se revisaron los servicios y flujos disponibles del proyecto y se evaluaron tres areas OWASP. El analisis es estatico y no sustituye una prueba de penetracion, MobSF u OWASP ZAP.

| Area revisada | Hallazgo en el codigo | Riesgo y correccion |
|---|---|---|
| M2, almacenamiento inseguro | No se encontro `AsyncStorage` ni almacenamiento de credenciales en el servicio revisado. Tampoco esta configurado `expo-secure-store`. | Bajo en el flujo actual; si se agregan tokens, usar SecureStore y no guardar contrasenas en texto plano. |
| M3, comunicacion insegura | `src/services/taskService.ts` usa `https://api.taskmanager.com`; la prueba estatica rechaza URLs `http://`. | Bajo en el codigo revisado. Mantener HTTPS y evaluar certificate pinning en produccion. |
| M1, exposicion en logs | No se encontraron logs con contrasenas, tokens o claves en el codigo revisado. | Bajo en el alcance analizado. Mantener logs sanitizados y no registrar datos sensibles. |

La prueba `Actividad4/src/__tests__/securityAudit.test.ts` lee `src/services/taskService.ts` y verifica HTTPS y ausencia de almacenamiento inseguro en ese servicio. Las pruebas adicionales de `__tests__/security/` contienen escenarios de politicas para futuros controles; no se presentan como evidencia de que AES-256, bcrypt, SecureStore o certificate pinning ya esten integrados.

## 4. Contrato de API con Zod

El contrato propio de la entrega esta en `Actividad4/src/taskSchema.ts`. `TaskSchema` define:

- `id`: cadena no vacia.
- `title`: cadena recortada con minimo un caracter.
- `completed`: booleano.
- `createdAt`: fecha ISO 8601.
- `priority`: enum opcional `LOW`, `MEDIUM` o `HIGH`.

`Actividad4/src/__tests__/taskSchema.test.ts` contiene dos escenarios diferentes:

1. Respuesta valida con todos los tipos correctos y prioridad `HIGH`.
2. Respuesta invalida con id y titulo vacios, booleano incorrecto, fecha no valida y prioridad `URGENT`.

La prueba usa `safeParse` y confirma que Zod acepta el primer objeto y rechaza el segundo. El resultado fue 2/2 pruebas aprobadas.

El proyecto raiz tambien conserva `__tests__/contract/taskApi.contract.test.ts`, pero utiliza otro contrato (`status`). Para esta entrega se debe revisar como evidencia principal el esquema de `Actividad4`, que utiliza `completed`.

## 5. Pipeline GitHub Actions: CI/CD

El archivo evaluable es `Actividad4/.github/workflows/tests.yml`. Se activa en `push` y `pull_request` sobre `main`, `develop`, `QA`, `master` y `Actividad-4`, permitiendo el flujo academico `develop -> QA -> master` y la validacion de la rama de entrega.

El workflow tiene un job `quality-checks` que:

1. Descarga el repositorio.
2. Configura Node.js 20 y cache de npm.
3. Ejecuta `npm ci` desde la raiz del checkout.
4. Ejecuta lint solo si existe el script.
5. Ejecuta `npm test -- --coverage --ci`, por lo que valida tests unitarios, componentes, integracion, accesibilidad, seguridad y los tests propios de `Actividad4`.
6. Sube `coverage/` como artefacto durante 30 dias.

El umbral de 70% esta configurado en el `jest.config.js` raiz, que es el archivo utilizado por el comando del workflow. Jest hace fallar la ejecucion si alguna metrica global queda por debajo del umbral. El pipeline es integracion continua; no realiza un despliegue automatico, por lo que el termino CD se refiere aqui a la automatizacion de calidad y reportes.

La ejecucion local completa fue exitosa: 18 suites y 85 tests. GitHub muestra una ejecucion exitosa en la rama `Actividad-4`: https://github.com/fernandonb88/Actividad4-FNB/actions/runs/32199191343. Se debe adjuntar una captura de esa pantalla o de una ejecucion posterior despues de subir estos cambios finales.

## 6. Acceso y conclusion

Repositorio: https://github.com/fernandonb88/Actividad4-FNB  
Rama: `Actividad-4`  
Carpeta evaluada: `Actividad4/`

El repositorio fue confirmado como publico en GitHub. La carpeta contiene pruebas nuevas de la actividad, contrato Zod, analisis de rendimiento, auditoria de seguridad, compatibilidad y workflow. La suite completa pasa y supera el umbral de cobertura. Antes de comprimir la entrega, se debe subir la version final a `Actividad-4` y anexar la captura del workflow exitoso.
