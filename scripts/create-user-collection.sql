-- Crear nueva tabla user_collection para reemplazar user_cards
-- Esta tabla manejará la colección personal de cartas de cada usuario

-- Eliminar tabla anterior si existe (opcional, comentar si quieres mantener user_cards)
-- DROP TABLE IF EXISTS user_cards CASCADE;

-- Crear nueva tabla user_collection
CREATE TABLE IF NOT EXISTS user_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) NOT NULL, -- Usar email como identificador
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1, -- Cantidad de esta carta que posee
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_upgraded BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_email, card_id),
  CHECK(quantity > 0),
  CHECK(level > 0),
  CHECK(experience >= 0)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_user_collection_email ON user_collection(user_email);
CREATE INDEX IF NOT EXISTS idx_user_collection_card_id ON user_collection(card_id);
CREATE INDEX IF NOT EXISTS idx_user_collection_obtained_at ON user_collection(obtained_at);
CREATE INDEX IF NOT EXISTS idx_user_collection_rarity ON user_collection(user_email, card_id);

-- Mensaje de confirmación
SELECT 'Tabla user_collection creada correctamente' as status; 