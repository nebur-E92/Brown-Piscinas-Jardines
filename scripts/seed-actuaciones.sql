-- Seed: catálogo de actuaciones estándar BROWN v1
-- Ejecutar después de migrate-partes.sql

-- Piscina (orden 1-10)
INSERT INTO catalogo_actuaciones (ambito, nombre, orden) VALUES
  ('piscina', 'Limpieza skimmers', 1),
  ('piscina', 'Limpieza fondo', 2),
  ('piscina', 'Adición de cloro', 3),
  ('piscina', 'Ajuste pH', 4),
  ('piscina', 'Algicida', 5),
  ('piscina', 'Floculante', 6),
  ('piscina', 'Revisión filtración/bomba', 7),
  ('piscina', 'Revisión dosificadora', 8),
  ('piscina', 'Retrolavado', 9),
  ('piscina', 'Otros tratamientos', 10)
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
