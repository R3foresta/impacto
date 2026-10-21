# Verificación del banco de semillas

21 de octubre de 2026. Las capturas usan **datos ficticios** inyectados por
Playwright. No representan inventario real y no son importadas por la web.

- 13 comprobaciones de navegador: aprobadas (`results.json`).
- 12 pruebas unitarias del proyecto: aprobadas (`npm test`).
- 9 comprobaciones de regresión de los reportes existentes: aprobadas.
- Compilación de producción y TypeScript: aprobados (`npm run build`).
- Revisión visual de escritorio y móvil: sin desbordamiento entre 320 y 1440 px.
- API real de lectura local en 3306: 131 recolecciones, todas las páginas,
  cantidades conciliadas y filtros/detalle compatibles con Zod
  (`live-api-results.json`).
- Navegador con API real en otro origen: inventario, paginación, ficha, mint,
  dos fotos sanitizadas, pantallas de escritorio/móvil y peticiones JSON
  anónimas aprobadas (`live-browser-results.json`).
- No se escribieron registros ni se ejecutaron acuñaciones. Estas pruebas
  locales no confirman el despliegue público de Render/Vercel.

Para repetir la revisión, iniciar Vite en el puerto 5181 y ejecutar
`npm run test:seed-bank:browser`. Se necesita Playwright disponible; la variable
`PLAYWRIGHT_MODULE` permite usar una instalación existente y `REVIEW_URL` permite
cambiar el origen del frontend. La prueba con fixtures intercepta solo la API y sirve
respuestas ficticias, incluidas paginación, filtros, errores y registros sin NFT.
