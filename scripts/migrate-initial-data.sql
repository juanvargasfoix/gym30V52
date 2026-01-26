-- Insertar empresa de prueba para GYM 3.0
INSERT INTO companies (id, nombre, areas_activas, area_flex)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Empresa Demo', 
   ARRAY['comunicacion', 'liderazgo', 'negociacion'], 'innovacion')
ON CONFLICT (id) DO NOTHING;

-- Nota: Los perfiles de usuario se crearán en la tabla 'profiles'
-- automáticamente o manualmente una vez que los usuarios se registren 
-- o sean creados en Supabase Auth.
