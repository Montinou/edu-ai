-- Script simple para asignar cartas a un usuario específico
-- Uso: Cambiar el email en la línea 4 por el email del usuario deseado

DO $$
DECLARE
    target_user_email TEXT := 'agusmontoya@gmail.com'; -- CAMBIAR ESTE EMAIL
    target_user_id UUID;
    card_record RECORD;
    cards_assigned INTEGER := 0;
BEGIN
    -- Verificar que existe el usuario
    SELECT id INTO target_user_id FROM users WHERE email = target_user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario % no encontrado en la tabla users', target_user_email;
    END IF;
    
    RAISE NOTICE 'Asignando cartas al usuario: % (ID: %)', target_user_email, target_user_id;
    
    -- Limpiar cartas previas del usuario (opcional)
    DELETE FROM user_collection WHERE user_id = target_user_id;
    RAISE NOTICE 'Cartas previas eliminadas';
    
    -- Asignar 5 cartas comunes
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'común' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 5
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level)
        VALUES (target_user_id, card_record.id, 1, 1);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE '✅ % cartas comunes asignadas', cards_assigned;
    
    -- Asignar 3 cartas raras
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'raro' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 3
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level)
        VALUES (target_user_id, card_record.id, 1, 1);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE '✅ % cartas raras asignadas', cards_assigned;
    
    -- Asignar 2 cartas épicas
    cards_assigned := 0;
    FOR card_record IN 
        SELECT id FROM cards 
        WHERE rarity = 'épico' AND is_active = true 
        ORDER BY RANDOM() 
        LIMIT 2
    LOOP
        INSERT INTO user_collection (user_id, card_id, quantity, level)
        VALUES (target_user_id, card_record.id, 1, 1);
        cards_assigned := cards_assigned + 1;
    END LOOP;
    RAISE NOTICE '✅ % cartas épicas asignadas', cards_assigned;
    
    -- Mostrar resumen
    RAISE NOTICE '=== RESUMEN ===';
    RAISE NOTICE 'Usuario: %', target_user_email;
    RAISE NOTICE 'Total de cartas asignadas: %', (
        SELECT COUNT(*) FROM user_collection WHERE user_id = target_user_id
    );
    
END $$;

-- Verificar el resultado
SELECT 
    u.email,
    c.name,
    c.rarity,
    c.attack_power
FROM user_collection uc
JOIN users u ON uc.user_id = u.id  
JOIN cards c ON uc.card_id = c.id
WHERE u.email = 'agusmontoya@gmail.com' -- CAMBIAR ESTE EMAIL TAMBIÉN
ORDER BY c.rarity, c.name; 