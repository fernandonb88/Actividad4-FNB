# Actividad 4 - Task Manager Quality Checks

Este paquete está aislado del proyecto principal para poder ejecutarse en GitHub Actions sin afectar la aplicación original.

## Contenido incluido
- Validación de contrato de API con Zod
- Verificación de rendimiento para tiempo de arranque, memoria y FPS
- Ejemplos de auditoría de seguridad
- Validación de compatibilidad para dispositivos iOS y Android
- Suite Jest en `src/__tests__/` para los tres módulos anteriores
- Cumplimiento de cobertura del 70%
- Workflow de integración continua con GitHub Actions

## Ejecución local
```bash
npm install
npm test -- --coverage --ci
```

La suite actual contiene 3 suites y 6 pruebas. En la última ejecución local se
obtuvieron 100% en statements, functions y lines, y 93.33% en branches.
