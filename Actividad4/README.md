# Actividad 4 - Task Manager Quality Checks

Este paquete está aislado del proyecto principal para poder ejecutarse en GitHub Actions sin afectar la aplicación original.

## Contenido incluido
- Validación de contrato de API con Zod
- Verificación de rendimiento para tiempo de arranque, memoria y FPS
- Ejemplos de auditoría de seguridad
- Validación de compatibilidad para dispositivos iOS y Android
- Cumplimiento de cobertura del 70%
- Workflow de integración continua con GitHub Actions

## Ejecución local
```bash
npm install
npm test -- --coverage --ci
```
