# Database Schema - EduCard AI Platform

## 🏗️ Architecture Overview

**Database:** Supabase PostgreSQL  
**Migration:** Migrated from Firebase Firestore to Supabase for better relational data management  
**Real-time:** Supabase real-time subscriptions for live game features  
**Authentication:** Supabase Auth with social login support  

## 🤖 AI Integration Strategy

The EduCard AI platform uses multiple AI services for educational content generation and personalization:

### AI Services Used:
- **Google AI (Gemini 1.5 Flash)**: Primary AI for math problem generation and tutoring
- **OpenAI GPT-4**: Advanced logic problems and story generation
- **Anthropic Claude**: Content validation and educational context checking
- **Replicate**: AI-generated card artwork and character images

### AI-Driven Features:
- **Dynamic Problem Generation**: Math and logic problems adapted to student performance
- **Adaptive Tutoring**: Real-time hints and explanations based on student progress
- **Prompt Engineering Education**: Teaching children effective AI interaction skills
- **Content Personalization**: Age-appropriate content filtering (8-12 years)
- **Performance Analytics**: AI-powered learning pattern analysis

## 📊 Database Schema

### Core Tables

#### 1. Users (Authentication & Profile)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT '{}',
  statistics JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  
  -- Indexes
  INDEX idx_users_email ON users(email),
  INDEX idx_users_level ON users(level),
  INDEX idx_users_created_at ON users(created_at)
);
```

#### 2. Cards (Master Card Collection)
```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('math', 'logic', 'special', 'defense')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  power INTEGER NOT NULL DEFAULT 0,
  cost INTEGER NOT NULL DEFAULT 1,
  problem JSONB NOT NULL, -- MathProblem or LogicProblem
  effects JSONB DEFAULT '[]', -- CardEffect[]
  artwork JSONB DEFAULT '{}', -- CardArtwork
  frame_type TEXT DEFAULT 'basicas' CHECK (frame_type IN ('basicas', 'intermedias', 'avanzadas', 'logica', 'especiales')),
  is_starter BOOLEAN DEFAULT false,
  unlock_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_cards_type ON cards(type),
  INDEX idx_cards_rarity ON cards(rarity),
  INDEX idx_cards_unlock_level ON cards(unlock_level),
  INDEX idx_cards_frame_type ON cards(frame_type)
);
```

#### 3. User Cards (Player's Card Collection)
```sql
CREATE TABLE user_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_upgraded BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  UNIQUE(user_id, card_id),
  
  -- Indexes
  INDEX idx_user_cards_user_id ON user_cards(user_id),
  INDEX idx_user_cards_card_id ON user_cards(card_id),
  INDEX idx_user_cards_obtained_at ON user_cards(obtained_at),
  INDEX idx_user_cards_favorite ON user_cards(user_id, is_favorite)
);
```

#### 4. Player Progress (Game Progression)
```sql
CREATE TABLE player_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  total_problems_completed INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_battles INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  average_accuracy DECIMAL(5,2) DEFAULT 0.00,
  total_play_time INTEGER DEFAULT 0, -- minutes
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_goal_streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id),
  
  -- Indexes
  INDEX idx_player_progress_user_id ON player_progress(user_id),
  INDEX idx_player_progress_level ON player_progress(level),
  INDEX idx_player_progress_last_played ON player_progress(last_played_at)
);
```

#### 5. Game Sessions (Play Sessions)
```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL CHECK (session_type IN ('practice', 'battle', 'tutorial', 'story')),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  problems_attempted INTEGER DEFAULT 0,
  problems_correct INTEGER DEFAULT 0,
  total_xp_gained INTEGER DEFAULT 0,
  average_response_time DECIMAL(8,2) DEFAULT 0.00, -- seconds
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard')),
  is_completed BOOLEAN DEFAULT false,
  session_data JSONB DEFAULT '{}', -- Additional session metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_game_sessions_user_id ON game_sessions(user_id),
  INDEX idx_game_sessions_type ON game_sessions(session_type),
  INDEX idx_game_sessions_start_time ON game_sessions(start_time),
  INDEX idx_game_sessions_completed ON game_sessions(is_completed)
);
```

#### 6. Battle Results (Combat Outcomes)
```sql
CREATE TABLE battle_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  enemy_name TEXT NOT NULL,
  enemy_difficulty INTEGER DEFAULT 1,
  player_deck JSONB NOT NULL, -- Card IDs used in battle
  success BOOLEAN NOT NULL,
  damage_dealt INTEGER DEFAULT 0,
  damage_taken INTEGER DEFAULT 0,
  xp_gained INTEGER DEFAULT 0,
  time_bonus INTEGER DEFAULT 0,
  perfect_bonus BOOLEAN DEFAULT false,
  battle_duration INTEGER DEFAULT 0, -- seconds
  cards_played JSONB DEFAULT '[]', -- Detailed card usage
  problems_solved JSONB DEFAULT '[]', -- Problem results
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_battle_results_player_id ON battle_results(player_id),
  INDEX idx_battle_results_session_id ON battle_results(session_id),
  INDEX idx_battle_results_success ON battle_results(success),
  INDEX idx_battle_results_timestamp ON battle_results(timestamp)
);
```

#### 7. Problem Results (Individual Problem Solving)
```sql
CREATE TABLE problem_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE SET NULL,
  problem_type TEXT NOT NULL CHECK (problem_type IN ('math', 'logic')),
  operation TEXT, -- Math: 'addition', 'subtraction', etc. Logic: 'pattern', 'deduction', etc.
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  is_correct BOOLEAN NOT NULL,
  time_spent DECIMAL(8,2) NOT NULL, -- seconds
  hints_used INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0 CHECK (score BETWEEN 0 AND 100),
  ai_feedback JSONB DEFAULT '{}', -- AI-generated hints and explanations
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_problem_results_user_id ON problem_results(user_id),
  INDEX idx_problem_results_session_id ON problem_results(session_id),
  INDEX idx_problem_results_type ON problem_results(problem_type),
  INDEX idx_problem_results_operation ON problem_results(operation),
  INDEX idx_problem_results_difficulty ON problem_results(difficulty),
  INDEX idx_problem_results_correct ON problem_results(is_correct),
  INDEX idx_problem_results_timestamp ON problem_results(timestamp)
);
```

#### 8. Achievements (Player Accomplishments)
```sql
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('first_steps', 'accuracy', 'speed', 'consistency', 'exploration', 'mastery', 'special')),
  rarity TEXT NOT NULL CHECK (rarity IN ('bronze', 'silver', 'gold', 'platinum')),
  criteria JSONB NOT NULL, -- Achievement unlock criteria
  xp_reward INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_achievements_category ON achievements(category),
  INDEX idx_achievements_rarity ON achievements(rarity)
);
```

#### 9. User Achievements (Unlocked Achievements)
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress JSONB DEFAULT '{}', -- Progress towards achievement
  
  -- Constraints
  UNIQUE(user_id, achievement_id),
  
  -- Indexes
  INDEX idx_user_achievements_user_id ON user_achievements(user_id),
  INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at)
);
```

#### 10. Daily Goals (Daily Challenges)
```sql
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target INTEGER NOT NULL DEFAULT 10, -- problems to solve
  completed INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  xp_bonus INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, date),
  
  -- Indexes
  INDEX idx_daily_goals_user_id ON daily_goals(user_id),
  INDEX idx_daily_goals_date ON daily_goals(date),
  INDEX idx_daily_goals_completed ON daily_goals(is_completed)
);
```

#### 11. Leaderboards (Rankings)
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('weekly_xp', 'monthly_xp', 'accuracy', 'speed', 'streak', 'level')),
  value DECIMAL(10,2) NOT NULL,
  rank INTEGER NOT NULL,
  period TEXT NOT NULL, -- 'YYYY-WW' for weekly, 'YYYY-MM' for monthly, 'all-time'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, category, period),
  
  -- Indexes
  INDEX idx_leaderboards_category ON leaderboards(category, period),
  INDEX idx_leaderboards_rank ON leaderboards(category, period, rank),
  INDEX idx_leaderboards_user_id ON leaderboards(user_id)
);
```

### AI Integration Tables

#### 12. AI Generated Content (Cached AI Responses)
```sql
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('math_problem', 'logic_problem', 'story', 'character', 'hint', 'explanation')),
  difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 5),
  parameters JSONB NOT NULL, -- Input parameters for AI generation
  content JSONB NOT NULL, -- Generated content
  ai_service TEXT NOT NULL, -- 'google', 'openai', 'anthropic', 'replicate'
  quality_score DECIMAL(3,2), -- 0.00 to 1.00
  usage_count INTEGER DEFAULT 0,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  INDEX idx_ai_content_type ON ai_generated_content(content_type),
  INDEX idx_ai_content_difficulty ON ai_generated_content(difficulty),
  INDEX idx_ai_content_service ON ai_generated_content(ai_service),
  INDEX idx_ai_content_quality ON ai_generated_content(quality_score),
  INDEX idx_ai_content_expires ON ai_generated_content(expires_at)
);
```

#### 13. AI Prompts (Prompt Engineering Tracking)
```sql
CREATE TABLE ai_prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
  prompt_text TEXT NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  success_score DECIMAL(3,2), -- 0.00 to 1.00
  ai_service TEXT NOT NULL,
  context TEXT, -- 'story_creation', 'character_design', 'problem_solving'
  feedback JSONB DEFAULT '{}', -- AI feedback on prompt quality
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_ai_prompts_user_id ON ai_prompts(user_id),
  INDEX idx_ai_prompts_session_id ON ai_prompts(session_id),
  INDEX idx_ai_prompts_service ON ai_prompts(ai_service),
  INDEX idx_ai_prompts_context ON ai_prompts(context),
  INDEX idx_ai_prompts_timestamp ON ai_prompts(timestamp)
);
```

### Story and Creative Content Tables

#### 14. User Stories (Creative Writing Projects)
```sql
CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  genre TEXT DEFAULT 'adventure',
  characters JSONB DEFAULT '[]', -- Character references
  ai_assistance_level TEXT DEFAULT 'medium' CHECK (ai_assistance_level IN ('low', 'medium', 'high')),
  is_published BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_user_stories_user_id ON user_stories(user_id),
  INDEX idx_user_stories_genre ON user_stories(genre),
  INDEX idx_user_stories_published ON user_stories(is_published),
  INDEX idx_user_stories_created_at ON user_stories(created_at)
);
```

#### 15. User Characters (Custom Characters)
```sql
CREATE TABLE user_characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  appearance JSONB DEFAULT '{}', -- Physical description
  personality JSONB DEFAULT '{}', -- Character traits
  image_url TEXT, -- AI-generated character image
  ai_prompts JSONB DEFAULT '[]', -- Prompts used to create character
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_user_characters_user_id ON user_characters(user_id),
  INDEX idx_user_characters_favorite ON user_characters(user_id, is_favorite),
  INDEX idx_user_characters_created_at ON user_characters(created_at)
);
```

## 🔐 Row Level Security (RLS) Policies

```sql
-- Enable RLS on all user-related tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_prompts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY user_own_data ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY user_cards_own ON user_cards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY player_progress_own ON player_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY game_sessions_own ON game_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY battle_results_own ON battle_results FOR ALL USING (auth.uid() = player_id);
CREATE POLICY problem_results_own ON problem_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_achievements_own ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY daily_goals_own ON daily_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_stories_own ON user_stories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY user_characters_own ON user_characters FOR ALL USING (auth.uid() = user_id);
CREATE POLICY ai_prompts_own ON ai_prompts FOR ALL USING (auth.uid() = user_id);

-- Public read access for master data
CREATE POLICY cards_public_read ON cards FOR SELECT USING (true);
CREATE POLICY achievements_public_read ON achievements FOR SELECT USING (true);

-- Leaderboards - read access for all authenticated users
CREATE POLICY leaderboards_read ON leaderboards FOR SELECT USING (auth.role() = 'authenticated');
```

## 📊 Analytics Views

### Performance Analytics View
```sql
CREATE VIEW analytics_user_performance AS
SELECT 
  u.id,
  u.name,
  u.level,
  pp.total_problems_completed,
  pp.average_accuracy,
  pp.current_streak,
  pp.total_play_time,
  COUNT(DISTINCT gs.id) as total_sessions,
  AVG(gs.average_response_time) as avg_response_time,
  COUNT(DISTINCT DATE(gs.start_time)) as active_days
FROM users u
LEFT JOIN player_progress pp ON u.id = pp.user_id
LEFT JOIN game_sessions gs ON u.id = gs.user_id
WHERE u.is_active = true
GROUP BY u.id, u.name, u.level, pp.total_problems_completed, 
         pp.average_accuracy, pp.current_streak, pp.total_play_time;
```

### Learning Progress View
```sql
CREATE VIEW analytics_learning_progress AS
SELECT 
  pr.user_id,
  pr.problem_type,
  pr.operation,
  pr.difficulty,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE pr.is_correct) as correct_attempts,
  AVG(pr.time_spent) as avg_time_spent,
  AVG(pr.score) as avg_score,
  AVG(pr.hints_used) as avg_hints_used
FROM problem_results pr
GROUP BY pr.user_id, pr.problem_type, pr.operation, pr.difficulty;
```

## 🚀 Migration from Firebase

### Key Changes:
1. **Relational Structure**: Moved from document-based to relational model
2. **Type Safety**: Strong typing with PostgreSQL constraints
3. **Real-time**: Supabase real-time for live features
4. **Analytics**: Better query capabilities for learning analytics
5. **AI Integration**: Dedicated tables for AI-generated content caching

### Migration Benefits:
- **Better Queries**: Complex analytics queries with SQL
- **Data Integrity**: Foreign key constraints and validation
- **Performance**: Optimized indexes for educational analytics
- **Cost Efficiency**: More predictable pricing model
- **Real-time**: Built-in real-time subscriptions

### Backwards Compatibility:
- API endpoints remain the same
- Client-side code minimal changes
- Data export/import scripts provided

## 📈 Scaling Considerations

### Performance Optimizations:
- **Partitioning**: Large tables by date/user_id
- **Indexing**: Compound indexes for common query patterns
- **Caching**: Redis for frequently accessed data
- **Read Replicas**: For analytics queries

### Data Retention:
- **Sessions**: 6 months rolling window
- **Problem Results**: 2 years for learning analytics
- **AI Content**: Cache for 30 days, validate quality
- **User Data**: Retained until account deletion 