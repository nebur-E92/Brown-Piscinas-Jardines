-- Seed: catálogo de actuaciones estándar BROWN v1.2
-- Ejecutar después de migrate-partes.sql

-- Piscina (orden 1-12)
INSERT INTO catalogo_actuaciones (ambito, nombre, orden) VALUES
  ('piscina', 'Limpieza skimmers', 1),
  ('piscina', 'Limpieza de superficie', 2),
  ('piscina', 'Limpieza de línea de flotación', 3),
  ('piscina', 'Limpieza fondo', 4),
  ('piscina', 'Adición de cloro', 5),
  ('piscina', 'Ajuste pH', 6),
  ('piscina', 'Algicida', 7),
  ('piscina', 'Floculante', 8),
  ('piscina', 'Revisión filtración/bomba', 9),
  ('piscina', 'Revisión dosificadora', 10),
  ('piscina', 'Retrolavado', 11),
  ('piscina', 'Otros tratamientos', 12)
ON CONFLICT DO NOTHING;

-- Jardín (orden 1-7)
INSERT INTO catalogo_actuaciones (ambito, nombre, orden) VALUES
  ('jardin', 'Inspección césped', 1),
  ('jardin', 'Corte', 2),
  ('jardin', 'Recorte de bordes', 3),
  ('jardin', 'Soplado', 4),
  ('jardin', 'Retirada de restos', 5),
  ('jardin', 'Revisión de riego', 6),
  ('jardin', 'Otras', 7)
ON CONFLICT DO NOTHING;
