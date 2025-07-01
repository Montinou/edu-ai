-- Crear tablas de autenticación customizadas para IAEducation
-- Ejecutar en Supabase SQL Editor

-- 1. Tabla de usuarios customizada (diferente nombre para evitar conflicto)
CREATE TABLE IF NOT EXISTS custom_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- 2. Tabla de sesiones de usuario customizada
CREATE TABLE IF NOT EXISTS custom_user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- 3. Tabla de perfiles de usuario customizada
CREATE TABLE IF NOT EXISTS custom_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
  difficulty_preference INTEGER DEFAULT 5 CHECK (difficulty_preference >= 1 AND difficulty_preference <= 10),
  language_preference VARCHAR(5) DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabla de estadísticas de usuario customizada
CREATE TABLE IF NOT EXISTS custom_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES custom_users(id) ON DELETE CASCADE,
  total_games_played INTEGER DEFAULT 0,
  total_problems_solved INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_cards_collected INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Crear índices
CREATE INDEX IF NOT EXISTS idx_custom_users_email ON custom_users(email);
CREATE INDEX IF NOT EXISTS idx_custom_user_sessions_token ON custom_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_custom_user_sessions_user_id ON custom_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_user_profiles_user_id ON custom_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_user_stats_user_id ON custom_user_stats(user_id);

-- 6. Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_custom_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Triggers para updated_at
CREATE TRIGGER update_custom_users_updated_at 
    BEFORE UPDATE ON custom_users
    FOR EACH ROW EXECUTE FUNCTION update_custom_users_updated_at_column();

CREATE TRIGGER update_custom_user_profiles_updated_at 
    BEFORE UPDATE ON custom_user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_custom_users_updated_at_column();

CREATE TRIGGER update_custom_user_stats_updated_at 
    BEFORE UPDATE ON custom_user_stats
    FOR EACH ROW EXECUTE FUNCTION update_custom_users_updated_at_column();

-- 8. Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION create_custom_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO custom_user_profiles (user_id) VALUES (NEW.id);
    INSERT INTO custom_user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Trigger para crear perfil automáticamente
CREATE TRIGGER create_custom_user_profile_trigger
    AFTER INSERT ON custom_users
    FOR EACH ROW EXECUTE FUNCTION create_custom_user_profile(); 