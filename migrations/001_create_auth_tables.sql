-- Migration: 001_create_auth_tables.sql
-- Description: Create authentication and user management tables
-- Created: 2024-12-XX

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NOT NULL,
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR(255),
  email_verification_expires TIMESTAMP WITH TIME ZONE,
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_password_token ON users(reset_password_token);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for user_sessions table
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 3. User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
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

-- Create indexes for user_profiles table
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- 4. User stats table
CREATE TABLE IF NOT EXISTS user_stats (
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

-- Create indexes for user_stats table
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);

-- 5. User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Create indexes for user_achievements table
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);

-- 6. Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
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

-- Create indexes for game_sessions table
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed ON game_sessions(completed_at);

-- 7. Modify existing cards table to add user relationship
-- Only add columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'owner_id') THEN
        ALTER TABLE cards ADD COLUMN owner_id UUID REFERENCES users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'acquired_at') THEN
        ALTER TABLE cards ADD COLUMN acquired_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cards' AND column_name = 'times_used') THEN
        ALTER TABLE cards ADD COLUMN times_used INTEGER DEFAULT 0;
    END IF;
END $$;

-- Create index for cards owner relationship
CREATE INDEX IF NOT EXISTS idx_cards_owner_id ON cards(owner_id);

-- 8. Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_stats_updated_at ON user_stats;
CREATE TRIGGER update_user_stats_updated_at 
    BEFORE UPDATE ON user_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create profile and stats when user is created
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id) VALUES (NEW.id);
    INSERT INTO user_stats (user_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- 9. Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 10. Function to clean expired tokens
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE users 
    SET 
        email_verification_token = NULL,
        email_verification_expires = NULL
    WHERE email_verification_expires < NOW()
    AND email_verification_token IS NOT NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    UPDATE users 
    SET 
        reset_password_token = NULL,
        reset_password_expires = NULL
    WHERE reset_password_expires < NOW()
    AND reset_password_token IS NOT NULL;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Insert some initial achievement types for reference
INSERT INTO user_achievements (user_id, achievement_type, achievement_data)
SELECT 
    '00000000-0000-0000-0000-000000000000'::UUID,
    unnest(ARRAY[
        'first_login',
        'first_game',
        'first_win',
        'streak_5',
        'streak_10',
        'streak_25',
        'problems_100',
        'problems_500',
        'problems_1000',
        'cards_10',
        'cards_50',
        'cards_100',
        'level_5',
        'level_10',
        'level_25'
    ]),
    '{}'::JSONB
ON CONFLICT (user_id, achievement_type) DO NOTHING;

-- Remove the dummy achievements (this was just for reference)
DELETE FROM user_achievements WHERE user_id = '00000000-0000-0000-0000-000000000000';

-- Grant necessary permissions (adjust based on your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

COMMIT; 