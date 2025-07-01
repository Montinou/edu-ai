-- Migración completa: user_collection + cartas iniciales + asignación a usuarios REALES
-- Ejecutar todo en secuencia

-- 1. Crear tabla user_collection (usando user_id en lugar de user_email)
CREATE TABLE IF NOT EXISTS user_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_upgraded BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  
  CHECK(quantity > 0),
  CHECK(level > 0),
  CHECK(experience >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_collection_user_id ON user_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_card_id ON user_collection(card_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_obtained_at ON user_collection(obtained_at);

-- 2. Verificar que existen los usuarios en la tabla users
DO $$
DECLARE
    user1_exists BOOLEAN;
    user2_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'agusmontoya@gmail.com') INTO user1_exists;
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'agusmontoya2@gmail.com') INTO user2_exists;
    
    IF NOT user1_exists THEN
        RAISE EXCEPTION 'Usuario agusmontoya@gmail.com no existe en la tabla users';
    END IF;
    
    IF NOT user2_exists THEN
        RAISE EXCEPTION 'Usuario agusmontoya2@gmail.com no existe en la tabla users';
    END IF;
    
    RAISE NOTICE 'Ambos usuarios encontrados correctamente';
END $$;

-- 3. Verificar cartas existentes y sus rarezas
SELECT 'Cartas disponibles por rareza:' as info;
SELECT rarity, COUNT(*) as cantidad 
FROM cards 
WHERE is_active = true 
GROUP BY rarity 
ORDER BY rarity;

-- 4. Asignar cartas a ambos usuarios
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    card_record RECORD;
    cards_assigned INTEGER := 0;
BEGIN
    -- Obtener los IDs de usuarios reales
    SELECT id INTO user1_id FROM users WHERE email = 'agusmontoya@gmail.com';
    SELECT id INTO user2_id FROM users WHERE email = 'agusmontoya2@gmail.com';
    
    -- Limpiar colecciones previas para estos usuarios
    DELETE FROM user_collection WHERE user_id IN (user1_id, user2_id);
    
    RAISE NOTICE 'Usuario 1 ID: %', user1_id;
    RAISE NOTICE 'Usuario 2 ID: %', user2_id;
    
    -- ===== USUARIO 1: agusmontoya@gmail.com =====
    RAISE NOTICE 'Asignando cartas al usuario 1...';
    
    -- 8 cartas comunes para usuario 1
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'común' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 8
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user1_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 1: % cartas comunes asignadas', cards_assigned;
    
    -- 4 cartas raras para usuario 1  
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'raro' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 4
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user1_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 1: % cartas raras asignadas', cards_assigned;
    
    -- 2 cartas épicas para usuario 1
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'épico' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 2
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user1_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 1: % cartas épicas asignadas', cards_assigned;
    
    -- 1 carta legendaria para usuario 1
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'legendario' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 1
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user1_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 1: % cartas legendarias asignadas', cards_assigned;
    
    -- ===== USUARIO 2: agusmontoya2@gmail.com =====
    RAISE NOTICE 'Asignando cartas DIFERENTES al usuario 2...';
    
    -- 8 cartas comunes DIFERENTES para usuario 2
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'común' AND is_active = true 
        AND id NOT IN (SELECT card_id FROM user_collection WHERE user_id = user1_id)
        ORDER BY RANDOM() 
        LIMIT 8
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user2_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 2: % cartas comunes asignadas', cards_assigned;
    
    -- 4 cartas raras DIFERENTES para usuario 2
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'raro' AND is_active = true 
        AND id NOT IN (SELECT card_id FROM user_collection WHERE user_id = user1_id)
        ORDER BY RANDOM() 
        LIMIT 4
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user2_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 2: % cartas raras asignadas', cards_assigned;
    
    -- 2 cartas épicas DIFERENTES para usuario 2
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'épico' AND is_active = true 
        AND id NOT IN (SELECT card_id FROM user_collection WHERE user_id = user1_id)
        ORDER BY RANDOM() 
        LIMIT 2
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user2_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 2: % cartas épicas asignadas', cards_assigned;
    
    -- 1 carta legendaria DIFERENTE para usuario 2
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'legendario' AND is_active = true 
        AND id NOT IN (SELECT card_id FROM user_collection WHERE user_id = user1_id)
        ORDER BY RANDOM() 
        LIMIT 1
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level, experience, times_used, is_upgraded, is_favorite)
        VALUES (user2_id, card_record.id, 1, 1, 0, 0, false, false);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE 'Usuario 2: % cartas legendarias asignadas', cards_assigned;
    
END $$;

-- 5. Verificar resultados con información completa
SELECT '=== DISTRIBUCIÓN POR RAREZA ===' as info;
SELECT 
  u.email as user_email,
  u.id as user_id,
  c.rarity,
  COUNT(*) as cantidad
FROM user_collection uc
JOIN users u ON uc.user_id = u.id
JOIN cards c ON uc.card_id = c.id
WHERE u.email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com')
GROUP BY u.email, u.id, c.rarity
ORDER BY u.email, 
  CASE c.rarity 
    WHEN 'común' THEN 1 
    WHEN 'raro' THEN 2 
    WHEN 'épico' THEN 3 
    WHEN 'legendario' THEN 4 
  END;

SELECT '=== TOTAL POR USUARIO ===' as info;
SELECT 
  u.email as user_email,
  u.id as user_id,
  COUNT(*) as total_cartas
FROM user_collection uc
JOIN users u ON uc.user_id = u.id
WHERE u.email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com')
GROUP BY u.email, u.id;

SELECT '=== CARTAS ASIGNADAS ===' as info;
SELECT 
  u.email as user_email,
  c.name as card_name,
  c.rarity,
  c.power
FROM user_collection uc
JOIN users u ON uc.user_id = u.id
JOIN cards c ON uc.card_id = c.id
WHERE u.email IN ('agusmontoya@gmail.com', 'agusmontoya2@gmail.com')
ORDER BY u.email, c.rarity, c.name;

SELECT 'Migración completada exitosamente con usuarios reales' as status; 