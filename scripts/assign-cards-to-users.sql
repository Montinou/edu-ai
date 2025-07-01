-- Asignar 15 cartas aleatoriamente a dos usuarios específicos
-- Con distribución equilibrada de rarezas

-- Usuarios objetivo
\set user1 'agusmontoya@gmail.com'
\set user2 'agusmontoya2@gmail.com'

-- Limpiar asignaciones previas para estos usuarios (opcional)
DELETE FROM user_collection WHERE user_email IN (:user1, :user2);

-- Función para asignar cartas con distribución equilibrada
WITH card_distribution AS (
  -- Obtener cartas por rareza con distribución deseada
  SELECT 
    id as card_id,
    name,
    rarity,
    ROW_NUMBER() OVER (PARTITION BY rarity ORDER BY RANDOM()) as rn
  FROM cards 
  WHERE is_active = true
),
balanced_cards AS (
  -- Seleccionar cartas con distribución equilibrada (por rareza)
  -- 8 common, 4 rare, 2 epic, 1 legendary por usuario
  SELECT card_id, rarity FROM card_distribution WHERE rarity = 'common' AND rn <= 16
  UNION ALL
  SELECT card_id, rarity FROM card_distribution WHERE rarity = 'rare' AND rn <= 8
  UNION ALL  
  SELECT card_id, rarity FROM card_distribution WHERE rarity = 'epic' AND rn <= 4
  UNION ALL
  SELECT card_id, rarity FROM card_distribution WHERE rarity = 'legendary' AND rn <= 2
),
user_assignments AS (
  -- Asignar cartas alternadamente a cada usuario
  SELECT 
    card_id,
    rarity,
    CASE 
      WHEN ROW_NUMBER() OVER (PARTITION BY rarity ORDER BY RANDOM()) % 2 = 1 
      THEN :user1
      ELSE :user2
    END as user_email
  FROM balanced_cards
)
-- Insertar en user_collection
INSERT INTO user_collection (user_email, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
SELECT 
  user_email,
  card_id,
  1 as quantity,
  1 as level,
  0 as experience,
  0 as times_used,
  false as is_upgraded,
  false as is_favorite
FROM user_assignments;

-- Verificar la distribución resultante
SELECT 
  uc.user_email,
  c.rarity,
  COUNT(*) as cantidad
FROM user_collection uc
JOIN cards c ON uc.card_id = c.id
WHERE uc.user_email IN (:user1, :user2)
GROUP BY uc.user_email, c.rarity
ORDER BY uc.user_email, 
  CASE c.rarity 
    WHEN 'common' THEN 1 
    WHEN 'rare' THEN 2 
    WHEN 'epic' THEN 3 
    WHEN 'legendary' THEN 4 
  END;

-- Mostrar total por usuario
SELECT 
  user_email,
  COUNT(*) as total_cartas
FROM user_collection 
WHERE user_email IN (:user1, :user2)
GROUP BY user_email;

-- Mensaje de confirmación
SELECT 'Cartas asignadas exitosamente a ambos usuarios' as status; 