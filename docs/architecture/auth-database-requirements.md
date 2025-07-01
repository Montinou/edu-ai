# Análisis de Estructura de Base de Datos para Autenticación

## Estado Actual
Actualmente la base de datos tiene:
- Tabla `cards` con información de cartas educativas
- Tabla `problem_types` con tipos de problemas matemáticos
- Estructura básica para el juego de cartas

## Requerimientos Nuevos para Autenticación

### 1. Tabla de Usuarios (`users`)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_reset_password_token ON users(reset_password_token);
```

### 2. Tabla de Sesiones (`user_sessions`)
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### 3. Tabla de Perfiles de Usuario (`user_profiles`)
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),
  grade_level INTEGER CHECK (grade_level >= 1 AND grade_level <= 12),
  preferred_categories TEXT[] DEFAULT '{}',
  learning_goals TEXT,
  difficulty_preference INTEGER DEFAULT 5 CHECK (difficulty_preference >= 1 AND difficulty_preference <= 10),
  language_preference VARCHAR(5) DEFAULT 'es',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
```

### 4. Tabla de Estadísticas de Usuario (`user_stats`)
```sql
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_games_played INTEGER DEFAULT 0,
  total_problems_solved INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_cards_collected INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- en minutos
  level INTEGER DEFAULT 1,
  experience_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
```

### 5. Tabla de Logros de Usuario (`user_achievements`)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON user_achievements(achievement_type);
```

### 6. Modificaciones a Tablas Existentes

#### Agregar relación usuario a cartas
```sql
-- Agregar columna para vincular cartas con usuarios
ALTER TABLE cards ADD COLUMN owner_id UUID REFERENCES users(id);
ALTER TABLE cards ADD COLUMN acquired_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE cards ADD COLUMN times_used INTEGER DEFAULT 0;

CREATE INDEX idx_cards_owner_id ON cards(owner_id);
```

### 7. Tabla de Historial de Juegos (`game_sessions`)
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL, -- 'practice', 'challenge', 'multiplayer'
  cards_used UUID[] DEFAULT '{}',
  problems_attempted INTEGER DEFAULT 0,
  problems_correct INTEGER DEFAULT 0,
  total_damage_dealt INTEGER DEFAULT 0,
  total_damage_received INTEGER DEFAULT 0,
  session_duration INTEGER, -- en segundos
  experience_gained INTEGER DEFAULT 0,
  result VARCHAR(20), -- 'victory', 'defeat', 'incomplete'
  session_data JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_type ON game_sessions(session_type);
CREATE INDEX idx_game_sessions_completed ON game_sessions(completed_at);
```

### 8. Funciones y Triggers Necesarios

#### Trigger para actualizar `updated_at`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a las tablas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### Función para crear perfil automáticamente
```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();
```

## Políticas de Seguridad (Row Level Security)

### Usuarios
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver y editar su propia información
CREATE POLICY users_own_data ON users
    FOR ALL USING (auth.uid() = id);
```

### Perfiles
```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_profiles_own_data ON user_profiles
    FOR ALL USING (auth.uid() = user_id);
```

### Estadísticas
```sql
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_stats_own_data ON user_stats
    FOR ALL USING (auth.uid() = user_id);
```

## APIs Necesarias

### Endpoints de Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/forgot-password` - Solicitar reset de contraseña
- `POST /api/auth/reset-password` - Resetear contraseña con token
- `POST /api/auth/verify-email` - Verificar email con token
- `GET /api/auth/me` - Obtener usuario actual

### Endpoints de Perfil
- `GET /api/user/profile` - Obtener perfil de usuario
- `PUT /api/user/profile` - Actualizar perfil de usuario
- `GET /api/user/stats` - Obtener estadísticas de usuario
- `GET /api/user/achievements` - Obtener logros de usuario

### Middleware de Autenticación
- Verificación de tokens de sesión
- Protección de rutas privadas
- Renovación automática de sesiones

## Consideraciones de Seguridad

1. **Hashing de Contraseñas**: Usar bcrypt con salt rounds >= 12
2. **Tokens de Sesión**: JWT o tokens aleatorios con expiración
3. **Rate Limiting**: Limitar intentos de login y registro
4. **Validación de Email**: Tokens con expiración de 24 horas
5. **Reset de Contraseña**: Tokens seguros con expiración de 1 hora
6. **HTTPS Only**: Todas las cookies con flag `secure`
7. **CSRF Protection**: Tokens CSRF en formularios
8. **Input Validation**: Sanitización y validación estricta

## Próximos Pasos

1. **Crear las migraciones** para las nuevas tablas
2. **Implementar los endpoints** de autenticación
3. **Configurar middleware** de autenticación
4. **Crear los hooks** y contextos de React para auth
5. **Implementar protección** de rutas privadas
6. **Configurar envío** de emails (verificación y reset)
7. **Testing** completo del flujo de autenticación 