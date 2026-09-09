# Revisión de las cuatro tareas de UI y UX

Las cuatro entregas están integradas localmente en el proyecto principal, sobre `8a70bb8`. Se revisaron contra los encargos existentes; no se repitió la auditoría general de diseño. No se hicieron commits ni despliegues y no se alteraron los worktrees originales.

## Resultado por tarea

| Tarea | Resultado |
|---|---|
| T01 — Indicadores y CO₂ | Conserva los valores publicados, distingue supervivencia reportada, explica las pérdidas calculadas y muestra CO₂ no disponible en el resumen. Mantiene los estados sin plantaciones y sin fecha. |
| T02 — Hero | Incorporaba T01. El conjunto conserva el CTA visible en los tres escritorios bajos y no presenta desbordamiento horizontal en los cinco tamaños comprobados. |
| T03 — Navegación | Los seis destinos funcionan mediante teclado en los cinco tamaños, con foco y sección activa. Se corrigió la llegada desde enlaces directos durante la carga inicial. |
| T04 — Territorio | La advertencia respeta el filtro, identifica los registros y abre el punto correcto. Los casos sin información comparable no se cuentan como fuera del polígono. |

## Correcciones de esta revisión

1. **Enlaces directos tras cargar datos.** Al abrir `/organizations/1#monitoreo`, el navegador intentaba encontrar el destino antes de que existiera y terminaba en Resumen. El hook de navegación ahora restaura el fragmento conocido cuando se montan las secciones, sitúa el destino debajo del header y le entrega el foco. La regresión reproduce la respuesta de API demorada.
2. **Fechas de calendario.** `2026-09-08` se interpretaba como medianoche UTC y se mostraba como 7 de septiembre en Bolivia. `formatDate` conserva ahora el día de las fechas sin hora; los timestamps siguen mostrando su fecha local. La corrección se comprobó tanto en pruebas unitarias como en el acceso a un registro del mapa.

La primera ejecución detectó también dos fallos del propio procedimiento de prueba: se evaluaba la sección activa antes de terminar el desplazamiento suave y se asumía que el mapa iniciaba en Todas cuando inicia en la primera zona. Se ajustó la prueba para esperar el fin del movimiento y seleccionar expresamente Todas; no se cambió ese comportamiento del producto.

## Validación del conjunto

- `npm run check`: TypeScript y ESLint correctos.
- `node --test tests/*.test.mjs`: 7 pruebas correctas (4 territoriales y 3 de fechas).
- `npm run build`: correcto. Permanece el aviso preexistente del bundle de MapLibre mayor de 500 kB.
- `git diff --check`: correcto.
- `tests/uiux-review.mjs`: 9 escenarios correctos y ninguna excepción de página.

| Viewport CSS | Margen bajo Ver impacto | Desbordamiento horizontal | Seis destinos por teclado |
|---|---:|---|---|
| 1427 × 757 | 213,3 px | Ninguno | Correctos |
| 1280 × 757 | 235,8 px | Ninguno | Correctos |
| 1024 × 757 | 198,7 px | Ninguno | Correctos |
| 1440 × 900 | 123,3 px | Ninguno | Correctos |
| 390 × 844 | 102,7 px | Ninguno | Correctos |

Los escenarios adicionales cubren el enlace directo con carga asíncrona, Atrás del navegador, advertencias y filtros territoriales con localización del registro #104, y una organización vacía sin fecha disponible.

## Evidencia y reproducción

- [Resultados de navegador](artifacts/review/results.json).
- Capturas `artifacts/review/hero-*.png` de los cinco tamaños.
- Pruebas territoriales: `tests/territorial-check.test.mjs`.
- Pruebas de fechas: `tests/formatters.test.mjs`.
- Prueba de integración: `tests/uiux-review.mjs`.

Para repetir la prueba de integración, iniciar `npm run dev -- --host 127.0.0.1 --port 5181 --strictPort` y ejecutar `node tests/uiux-review.mjs` con Playwright disponible. La variable `PLAYWRIGHT_MODULE` permite apuntar a una instalación existente; en esta revisión se utilizó `/Users/pabloandresfernandezcari/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs`. `REVIEW_URL` permite cambiar la URL local.

## Límites

Las pruebas de navegador usan respuestas ficticias validadas contra el esquema del proyecto, sin consultar ni modificar datos de producción. El estilo externo del mapa se sustituye por un fondo vacío para comprobar de forma determinista la interfaz, los puntos, filtros y popups; no se validó la disponibilidad del proveedor de cartografía. Las comprobaciones de zoom real al 125 % y cifras largas constan en la entrega original de T02; esta revisión del conjunto repitió los cinco viewports indicados, no el zoom real. No se cambian el cálculo de CO₂ ni los datos geográficos.
