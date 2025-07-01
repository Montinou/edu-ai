-- Script to fix problem_type_id values
-- This avoids any triggers and updates directly

-- Fracciones (5)
UPDATE cards SET problem_type_id = 5 WHERE name IN (
  'El Grimorio de las Fracciones Fractales',
  'El Grimorio de las Fracciones Perdidas'
) AND is_active = true;

-- Multiplicación (3)
UPDATE cards SET problem_type_id = 3 WHERE name IN (
  'El Abanico de las Multiplicaciones Celestiales'
) AND is_active = true;

-- División (4)
UPDATE cards SET problem_type_id = 4 WHERE name IN (
  'La División de Amaterasu',
  'El Susurro de la División Infinita'
) AND is_active = true;

-- Resta (2)
UPDATE cards SET problem_type_id = 2 WHERE name IN (
  'Susurro de la Resta Infinita',
  'Sōshū de la Resta Infinita',
  'Sombras de la Resta Infinita',
  'La Sombra de la Resta Infinita',
  'Súcubo de la Sustracción Silenciosa',
  'La Sustracción de Amaterasu'
) AND is_active = true;

-- Decimales (6)
UPDATE cards SET problem_type_id = 6 WHERE name IN (
  'El Susurro de los Decimales',
  'El Silencio de los Decimales Susurrantes'
) AND is_active = true;

-- Porcentajes (7)
UPDATE cards SET problem_type_id = 7 WHERE name LIKE '%porcentajes%' AND is_active = true;

-- Ecuaciones (8)
UPDATE cards SET problem_type_id = 8 WHERE name IN (
  'El Grimorio de Al-Khwarizmi',
  'El Grimorio de los Sistemas Ecuacionales',
  'El Grimorio de Xylos el Inefable'
) AND is_active = true;

-- Polinomios (10)
UPDATE cards SET problem_type_id = 10 WHERE name LIKE '%polinomios%' AND is_active = true;

-- Geometría (12)
UPDATE cards SET problem_type_id = 12 WHERE name IN (
  'El Prisma de Apep',
  'El Grimorio de los Perímetros Perdidos',
  'El Prisma de Apep, Destructor de Perímetros',
  'El Silencio de Shizuka: Secreto de las Geometrías Perdidas',
  'El Sello de Arquimedes',
  'El Grimorio Geométrico de Aethelred',
  'El Sello de la Geometría Sagrada',
  'El Sello de Amaterasu: Geometría Sagrada',
  'El Prisma de Apep: Fractal del Desierto'
) AND is_active = true;

-- Ángulos (13)
UPDATE cards SET problem_type_id = 13 WHERE name LIKE '%angular%' OR name LIKE '%ángulos%' AND is_active = true;

-- Patrones (16)
UPDATE cards SET problem_type_id = 16 WHERE name LIKE '%patrones%' AND is_active = true;

-- Secuencias (17)
UPDATE cards SET problem_type_id = 17 WHERE name LIKE '%secuencias%' AND is_active = true;

-- Lógica (19)
UPDATE cards SET problem_type_id = 19 WHERE name LIKE '%acertijo%' AND is_active = true;

-- Estadísticas (20)
UPDATE cards SET problem_type_id = 20 WHERE name IN (
  'El Grimorio de Laplace',
  'El Ojo de Amaterasu: Análisis de Regresión',
  'El Grimorio de las Regresiones'
) AND is_active = true;

-- Show final counts
SELECT problem_type_id, COUNT(*) as card_count 
FROM cards 
WHERE is_active = true 
GROUP BY problem_type_id 
ORDER BY problem_type_id; 