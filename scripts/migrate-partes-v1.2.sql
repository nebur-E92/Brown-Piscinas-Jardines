-- Migración incremental: catálogo de actuaciones de piscina v1.2
-- Ejecutar sobre la BD existente después de migrate-partes.sql.
-- Idempotente: seguro ejecutar varias veces.

INSERT INTO catalogo_actuaciones (ambito, nombre, orden) VALUES
  ('piscina', 'Limpieza de superficie', 2),
  ('piscina', 'Limpieza de línea de flotación', 3)
ON CONFLICT DO NOTHING;

UPDATE catalogo_actuaciones
SET orden = CASE nombre
  WHEN 'Limpieza skimmers' THEN 1
  WHEN 'Limpieza de superficie' THEN 2
  WHEN 'Limpieza de línea de flotación' THEN 3
  WHEN 'Limpieza fondo' THEN 4
  WHEN 'Adición de cloro' THEN 5
  WHEN 'Ajuste pH' THEN 6
  WHEN 'Algicida' THEN 7
  WHEN 'Floculante' THEN 8
  WHEN 'Revisión filtración/bomba' THEN 9
  WHEN 'Revisión dosificadora' THEN 10
  WHEN 'Retrolavado' THEN 11
  WHEN 'Otros tratamientos' THEN 12
  ELSE orden
END
WHERE ambito = 'piscina'
  AND nombre IN (
    'Limpieza skimmers',
    'Limpieza de superficie',
    'Limpieza de línea de flotación',
    'Limpieza fondo',
    'Adición de cloro',
    'Ajuste pH',
    'Algicida',
    'Floculante',
    'Revisión filtración/bomba',
    'Revisión dosificadora',
    'Retrolavado',
    'Otros tratamientos'
  );
