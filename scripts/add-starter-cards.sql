-- Agregar cartas iniciales para el sistema de colección de usuarios
-- Este script se ejecuta de forma segura (no duplica cartas existentes)

-- Cartas básicas de matemáticas
INSERT INTO cards (
  name, 
  description, 
  type, 
  rarity, 
  power, 
  cost, 
  problem,
  artwork,
  frame_type,
  is_starter,
  unlock_level
) VALUES 
(
  'Suma Básica',
  'Una carta fundamental para dominar las operaciones básicas de suma.',
  'math',
  'common',
  15,
  2,
  '{
    "question": "¿Cuánto es 5 + 3?",
    "answer": 8,
    "options": [6, 7, 8, 9],
    "operation": "addition",
    "difficulty": 1,
    "hints": ["Cuenta con los dedos", "5... 6, 7, 8"],
    "explanation": "Cuando sumas, juntas cantidades. 5 + 3 = 8",
    "type": "math",
    "timeLimit": 30
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/suma-basica.svg",
    "background": "linear-gradient(135deg, #22c55e, #15803d)",
    "border": "#16a34a"
  }'::jsonb,
  'basicas',
  true,
  1
),
(
  'Resta Simple',
  'Aprende a restar números pequeños con esta carta esencial.',
  'math',
  'common',
  12,
  2,
  '{
    "question": "¿Cuánto es 8 - 3?",
    "answer": 5,
    "options": [4, 5, 6, 7],
    "operation": "subtraction",
    "difficulty": 1,
    "hints": ["Cuenta hacia atrás", "8... 7, 6, 5"],
    "explanation": "Cuando restas, quitas una cantidad de otra. 8 - 3 = 5",
    "type": "math",
    "timeLimit": 30
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/resta-simple.svg",
    "background": "linear-gradient(135deg, #3b82f6, #1e40af)",
    "border": "#2563eb"
  }'::jsonb,
  'basicas',
  true,
  1
),
(
  'Multiplicación x2',
  'Domina las tablas de multiplicar comenzando por el 2.',
  'math',
  'common',
  18,
  3,
  '{
    "question": "¿Cuánto es 4 × 2?",
    "answer": 8,
    "options": [6, 7, 8, 10],
    "operation": "multiplication",
    "difficulty": 2,
    "hints": ["4 + 4", "Suma 4 dos veces"],
    "explanation": "Multiplicar por 2 es como sumar el número consigo mismo. 4 × 2 = 4 + 4 = 8",
    "type": "math",
    "timeLimit": 30
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/multiplicacion-x2.svg",
    "background": "linear-gradient(135deg, #f59e0b, #d97706)",
    "border": "#f59e0b"
  }'::jsonb,
  'intermedias',
  true,
  1
),
(
  'División Básica',
  'Aprende a dividir números pequeños de manera sencilla.',
  'math',
  'common',
  14,
  2,
  '{
    "question": "¿Cuánto es 10 ÷ 2?",
    "answer": 5,
    "options": [4, 5, 6, 8],
    "operation": "division",
    "difficulty": 2,
    "hints": ["¿Cuántas veces cabe 2 en 10?", "2 + 2 + 2 + 2 + 2 = 10"],
    "explanation": "Dividir es repartir en partes iguales. 10 ÷ 2 = 5",
    "type": "math",
    "timeLimit": 30
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/division-basica.svg",
    "background": "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    "border": "#8b5cf6"
  }'::jsonb,
  'basicas',
  true,
  1
),
(
  'Números Pares',
  'Identifica y comprende los números pares.',
  'logic',
  'common',
  16,
  2,
  '{
    "question": "¿Cuál de estos números es par?",
    "answer": "8",
    "options": ["7", "8", "9", "11"],
    "operation": "pattern",
    "difficulty": 1,
    "hints": ["Los números pares terminan en 0, 2, 4, 6, 8", "Se pueden dividir exactamente entre 2"],
    "explanation": "Los números pares son aquellos que se pueden dividir exactamente entre 2. 8 ÷ 2 = 4",
    "type": "logic",
    "timeLimit": 30
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/numeros-pares.svg",
    "background": "linear-gradient(135deg, #06b6d4, #0891b2)",
    "border": "#06b6d4"
  }'::jsonb,
  'logica',
  true,
  1
)
ON CONFLICT (name) DO NOTHING;

-- Agregar algunas cartas adicionales para tener variedad
INSERT INTO cards (
  name, 
  description, 
  type, 
  rarity, 
  power, 
  cost, 
  problem,
  artwork,
  frame_type,
  is_starter,
  unlock_level
) VALUES 
(
  'Suma de Decenas',
  'Suma números de dos dígitos con esta carta avanzada.',
  'math',
  'rare',
  25,
  4,
  '{
    "question": "¿Cuánto es 23 + 17?",
    "answer": 40,
    "options": [38, 39, 40, 41],
    "operation": "addition",
    "difficulty": 3,
    "hints": ["20 + 10 = 30, después 3 + 7 = 10", "Suma las decenas y unidades por separado"],
    "explanation": "Para sumar números de dos dígitos, suma las decenas (20+10=30) y las unidades (3+7=10), luego suma los resultados: 30+10=40",
    "type": "math",
    "timeLimit": 45
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/suma-decenas.svg",
    "background": "linear-gradient(135deg, #22c55e, #059669)",
    "border": "#10b981"
  }'::jsonb,
  'intermedias',
  false,
  2
),
(
  'Fracciones Simples',
  'Comprende las fracciones básicas con esta carta especial.',
  'math',
  'rare',
  30,
  5,
  '{
    "question": "¿Cuánto es 1/2 + 1/4?",
    "answer": "3/4",
    "options": ["1/2", "2/4", "3/4", "1/3"],
    "operation": "fractions",
    "difficulty": 4,
    "hints": ["Convierte 1/2 a cuartos: 1/2 = 2/4", "2/4 + 1/4 = 3/4"],
    "explanation": "Para sumar fracciones, necesitas el mismo denominador. 1/2 = 2/4, entonces 2/4 + 1/4 = 3/4",
    "type": "math",
    "timeLimit": 60
  }'::jsonb,
  '{
    "image": "/images/cards/card-images/fracciones-simples.svg",
    "background": "linear-gradient(135deg, #f59e0b, #ea580c)",
    "border": "#f59e0b"
  }'::jsonb,
  'avanzadas',
  false,
  3
)
ON CONFLICT (name) DO NOTHING;

-- Crear índices adicionales para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cards_is_starter ON cards(is_starter);
CREATE INDEX IF NOT EXISTS idx_cards_rarity_cost ON cards(rarity, cost);

-- Mensaje de confirmación
SELECT 'Cartas iniciales agregadas correctamente' as status; 