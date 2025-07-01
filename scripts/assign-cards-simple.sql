-- Script simplificado para asignar exactamente 15 cartas a cada usuario
-- Con distribución: 8 common, 4 rare, 2 epic, 1 legendary cada uno

-- Limpiar asignaciones previas
DELETE FROM user_collection WHERE user_email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com');

-- Usuario 1: agusmontoya@gmail.com
WITH user1_cards AS (
  -- 8 cartas common
  (SELECT id FROM cards WHERE rarity = 'common' AND is_active = true ORDER BY RANDOM() LIMIT 8)
  UNION ALL
  -- 4 cartas rare  
  (SELECT id FROM cards WHERE rarity = 'rare' AND is_active = true ORDER BY RANDOM() LIMIT 4)
  UNION ALL
  -- 2 cartas epic
  (SELECT id FROM cards WHERE rarity = 'epic' AND is_active = true ORDER BY RANDOM() LIMIT 2)
  UNION ALL
  -- 1 carta legendary
  (SELECT id FROM cards WHERE rarity = 'legendary' AND is_active = true ORDER BY RANDOM() LIMIT 1)
)
INSERT INTO user_collection (user_email, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
SELECT 
  'agusmontoya@gmail.com',
  id,
  1,
  1,
  0,
  0,
  false,
  false
FROM user1_cards;

-- Usuario 2: agusmontoya2@gmail.com 
WITH user2_cards AS (
  -- 8 cartas common (diferentes al usuario 1)
  (SELECT id FROM cards WHERE rarity = 'common' AND is_active = true 
   AND id NOT IN (SELECT card_id FROM user_collection WHERE user_email = 'agusmontoya@gmail.com')
   ORDER BY RANDOM() LIMIT 8)
  UNION ALL
  -- 4 cartas rare (diferentes al usuario 1)
  (SELECT id FROM cards WHERE rarity = 'rare' AND is_active = true 
   AND id NOT IN (SELECT card_id FROM user_collection WHERE user_email = 'agusmontoya@gmail.com')
   ORDER BY RANDOM() LIMIT 4)
  UNION ALL
  -- 2 cartas epic (diferentes al usuario 1)
  (SELECT id FROM cards WHERE rarity = 'epic' AND is_active = true 
   AND id NOT IN (SELECT card_id FROM user_collection WHERE user_email = 'agusmontoya@gmail.com')
   ORDER BY RANDOM() LIMIT 2)
  UNION ALL
  -- 1 carta legendary (diferente al usuario 1)
  (SELECT id FROM cards WHERE rarity = 'legendary' AND is_active = true 
   AND id NOT IN (SELECT card_id FROM user_collection WHERE user_email = 'agusmontoya@gmail.com')
   ORDER BY RANDOM() LIMIT 1)
)
INSERT INTO user_collection (user_email, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
SELECT 
  'agusmontoya2@gmail.com',
  id,
  1,
  1,
  0,
  0,
  false,
  false
FROM user2_cards;

-- Verificar resultados
SELECT 
  uc.user_email,
  c.rarity,
  COUNT(*) as cantidad
FROM user_collection uc
JOIN cards c ON uc.card_id = c.id
WHERE uc.user_email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com')
GROUP BY uc.user_email, c.rarity
ORDER BY uc.user_email, 
  CASE c.rarity 
    WHEN 'common' THEN 1 
    WHEN 'rare' THEN 2 
    WHEN 'epic' THEN 3 
    WHEN 'legendary' THEN 4 
  END;

-- Total por usuario
SELECT 
  user_email,
  COUNT(*) as total_cartas
FROM user_collection 
WHERE user_email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com')
GROUP BY user_email; 