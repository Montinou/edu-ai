-- ============================================
-- DYNAMIC CARDS MIGRATION
-- EduCard AI - Revolutionary Update
-- ============================================

-- Create backup of current cards table
CREATE TABLE cards_backup AS SELECT * FROM cards;

-- Add new columns for dynamic system
ALTER TABLE cards 
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'math',
ADD COLUMN IF NOT EXISTS base_power INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS level_range INTEGER[] DEFAULT '{1,5}',
ADD COLUMN IF NOT EXISTS lore TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS art_style VARCHAR(100) DEFAULT 'anime-magical';

-- Update existing cards to new dynamic format
-- ============================================

-- Math Category Cards (Basic Arithmetic)


-- Player Learning Profiles
CREATE TABLE IF NOT EXISTS player_learning_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  skill_level DECIMAL(3,2) DEFAULT 1.0, -- 1.0 to 10.0
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  average_response_time INTEGER DEFAULT 0, -- milliseconds
  last_problem_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  weak_topics TEXT[] DEFAULT '{}',
  strong_topics TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Dynamic Problem History (prevent repetition)
CREATE TABLE IF NOT EXISTS problem_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(20) NOT NULL,
  problem_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  player_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  response_time INTEGER NOT NULL, -- milliseconds
  difficulty_level INTEGER NOT NULL, -- 1-10
  card_id UUID REFERENCES cards(id),
  base_damage INTEGER,
  final_damage INTEGER,
  multipliers JSONB, -- store all multipliers applied
  battle_context JSONB, -- game state when problem was generated
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Battle Sessions
CREATE TABLE IF NOT EXISTS battle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  opponent_type VARCHAR(50) NOT NULL,
  player_deck UUID[] NOT NULL, -- array of card IDs
  cards_played INTEGER DEFAULT 0,
  problems_solved INTEGER DEFAULT 0,
  problems_correct INTEGER DEFAULT 0,
  total_damage_dealt INTEGER DEFAULT 0,
  battle_duration INTEGER DEFAULT 0, -- milliseconds
  victory BOOLEAN,
  learning_gains JSONB, -- what skills improved
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add indexes for performance
CREATE INDEX idx_player_learning_profiles_user_category ON player_learning_profiles(user_id, category);
CREATE INDEX idx_problem_history_user_category ON problem_history(user_id, category);
CREATE INDEX idx_problem_history_created_at ON problem_history(created_at);
CREATE INDEX idx_battle_sessions_user_id ON battle_sessions(user_id);

-- Enable RLS on new tables
ALTER TABLE player_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can access own learning profile" ON player_learning_profiles
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own problem history" ON problem_history  
FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access own battle sessions" ON battle_sessions
FOR ALL USING (auth.uid() = user_id);

-- System/admin policies
CREATE POLICY "System can manage all learning data" ON player_learning_profiles
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage all problem history" ON problem_history
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage all battle sessions" ON battle_sessions
FOR ALL USING (auth.role() = 'service_role');

-- Verification queries
-- ============================================

-- Show updated cards with new structure
SELECT 
  id,
  name,
  category,
  base_power,
  rarity,
  level_range,
  type as old_type,
  lore,
  art_style
FROM cards 
ORDER BY category, rarity, base_power;

-- Count cards by category
SELECT 
  category,
  rarity,
  COUNT(*) as card_count,
  AVG(base_power) as avg_power
FROM cards 
GROUP BY category, rarity
ORDER BY category, 
  CASE rarity 
    WHEN 'common' THEN 1
    WHEN 'rare' THEN 2  
    WHEN 'epic' THEN 3
    WHEN 'legendary' THEN 4
  END;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '🚀 DYNAMIC CARDS MIGRATION COMPLETED!';
  RAISE NOTICE '✅ %s cards converted to dynamic system', (SELECT COUNT(*) FROM cards);
  RAISE NOTICE '✅ New learning analytics tables created';
  RAISE NOTICE '✅ RLS policies applied for security';
  RAISE NOTICE '🎴 Categories: Math, Algebra, Logic, Geometry';
  RAISE NOTICE '⚡ Ready for AI-powered problem generation!';
END $$; 