// ============================================
// DYNAMIC CARDS TYPE DEFINITIONS
// EduCard AI - Updated for Problem Types
// ============================================

// Core card categories (now organized by mathematical subject)
export type CardCategory = 'aritmética' | 'álgebra' | 'geometría' | 'lógica' | 'estadística';

// Problem type codes (specific mathematical operations)
export type ProblemTypeCode = 
  // Arithmetic
  | 'addition' | 'subtraction' | 'multiplication' | 'division' 
  | 'fractions' | 'decimals' | 'percentages'
  // Algebra  
  | 'equations' | 'inequalities' | 'polynomials' | 'factorization'
  // Geometry
  | 'area_perimeter' | 'angles' | 'triangles' | 'circles'
  // Logic
  | 'logic' | 'patterns' | 'sequences' | 'deduction'
  // Statistics
  | 'statistics' | 'probability';

// Card rarity levels
export type CardRarity = 'común' | 'raro' | 'épico' | 'legendario';

// Problem types catalog structure
export interface ProblemType {
  id: number;
  code: ProblemTypeCode;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  category: CardCategory;
  difficulty_base: number;
  icon?: string;
  color_hex?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Updated dynamic card structure
export interface DynamicCard {
  id: string;
  name: string;
  description?: string;
  rarity: CardRarity;
  category: string;
  base_power: number;
  level_range: number[];
  lore?: string;
  art_style?: string;
  image_url?: string;
  created_at?: string;
  
  // New problem-based type information
  problem_type_id?: number;
  problem_code?: ProblemTypeCode;
  problem_name_es?: string;
  problem_name_en?: string;
  problem_description_es?: string;
  problem_description_en?: string;
  problem_category?: CardCategory;
  problem_difficulty_base?: number;
  problem_icon?: string;
  problem_color?: string;
  
  // Legacy support (for backward compatibility)
  type?: string;
  problem_type?: string;
  
  // Problem generation configuration
  problem_format?: 'text' | 'multiple_choice' | 'numeric' | 'equation';
}

// Problem generation request
export interface ProblemRequest {
  category: CardCategory;
  problem_type: ProblemTypeCode;
  difficulty: number; // 1-10 scale
  playerContext: PlayerContext;
  gameContext: GameContext;
  cardInfo: {
    id: string;
    name: string;
    rarity: CardRarity;
    base_power: number;
    problem_type_id: number;
  };
}

// Player learning context
export interface PlayerContext {
  level: number;
  recentMistakes: ProblemTypeCode[]; // problem types they struggled with
  strengths: ProblemTypeCode[]; // problem types they excel at  
  currentLevel: number;
  averageResponseTime: number; // milliseconds
  accuracy: number; // 0.0 - 1.0
  sessionProblemsCount: number;
  weakCategories: CardCategory[];
  strongCategories: CardCategory[];
}

// Game battle context
export interface GameContext {
  battlePhase: 'early' | 'mid' | 'late';
  cardsPlayed: number;
  timeRemaining: number; // seconds
  opponentType: string;
  playerHP: number;
  opponentHP: number;
  difficulty_preference: 'adaptive' | 'challenge' | 'practice';
}

// Generated problem response
export interface GeneratedProblem {
  id: string;
  problem_text: string;
  correct_answer: string;
  hints: string[];
  difficulty_actual: number; // actual difficulty (may differ from requested)
  learning_objective: string;
  topic_tags: string[];
  estimated_time: number; // seconds
  explanation?: string;
  multiple_choice_options?: string[];
  problem_format: 'text' | 'multiple_choice' | 'numeric' | 'equation';
  problem_type: ProblemTypeCode;
  category: CardCategory;
}

// Problem solving response from player
export interface ProblemResponse {
  problem_id: string;
  player_answer: string;
  response_time: number; // milliseconds
  hints_used: number;
  is_correct: boolean;
  confidence_level?: number; // 1-5 scale, player self-assessment
}

// Damage calculation result
export interface DamageCalculation {
  base_damage: number;
  accuracy_multiplier: number;
  speed_multiplier: number;
  rarity_multiplier: number;
  streak_multiplier: number;
  difficulty_bonus: number;
  problem_type_bonus: number; // bonus based on problem complexity
  final_damage: number;
  critical_hit: boolean;
  multipliers_applied: {
    accuracy: number;
    speed: number;
    rarity: number;
    streak: number;
    difficulty: number;
    problem_type: number;
    total: number;
  };
}

// Player learning profile (updated for problem types)
export interface PlayerLearningProfile {
  id: string;
  user_id: string;
  category: CardCategory;
  skill_level: number; // 1.0 to 10.0
  total_attempts: number;
  successful_attempts: number;
  average_response_time: number;
  last_problem_date: string;
  weak_problem_types: ProblemTypeCode[];
  strong_problem_types: ProblemTypeCode[];
  accuracy_trend: number[]; // last 10 sessions
  improvement_rate: number; // learning velocity
  problem_type_mastery: Record<ProblemTypeCode, number>; // 0.0 - 1.0 mastery level
  created_at: string;
  updated_at: string;
}

// Problem history entry
export interface ProblemHistoryEntry {
  id: string;
  user_id: string;
  category: CardCategory;
  problem_type: ProblemTypeCode;
  problem_text: string;
  correct_answer: string;
  player_answer: string;
  is_correct: boolean;
  response_time: number;
  difficulty_level: number;
  card_id: string;
  base_damage: number;
  final_damage: number;
  multipliers: DamageCalculation['multipliers_applied'];
  battle_context: GameContext;
  learning_gained: string[]; // concepts reinforced
  created_at: string;
}

// Battle session data
export interface BattleSession {
  id: string;
  user_id: string;
  opponent_type: string;
  player_deck: string[]; // card IDs
  cards_played: number;
  problems_solved: number;
  problems_correct: number;
  total_damage_dealt: number;
  battle_duration: number; // milliseconds
  victory: boolean;
  learning_gains: {
    categories_practiced: CardCategory[];
    problem_types_practiced: ProblemTypeCode[];
    new_concepts_learned: string[];
    skills_improved: string[];
    accuracy_improvement: number;
  };
  started_at: string;
  completed_at: string;
}

// Rarity multipliers for damage calculation
export const RARITY_MULTIPLIERS: Record<CardRarity, number> = {
  común: 1.0,
  raro: 1.2,
  épico: 1.5,
  legendario: 2.0
};

// Category difficulty base lines
export const CATEGORY_BASE_DIFFICULTY: Record<CardCategory, number> = {
  aritmética: 2,    // Basic math operations
  álgebra: 5,       // Variables and equations
  geometría: 6,      // Spatial reasoning
  lógica: 4,         // Patterns and deduction
  estadística: 7     // Data analysis and probability
};

// Problem type difficulty multipliers
export const PROBLEM_TYPE_MULTIPLIERS: Record<ProblemTypeCode, number> = {
  // Arithmetic (1.0 - 1.4)
  'addition': 1.0,
  'subtraction': 1.1,
  'multiplication': 1.2,
  'division': 1.3,
  'fractions': 1.4,
  'decimals': 1.3,
  'percentages': 1.4,
  
  // Algebra (1.5 - 1.8)
  'equations': 1.5,
  'inequalities': 1.6,
  'polynomials': 1.7,
  'factorization': 1.8,
  
  // Geometry (1.4 - 1.6)
  'area_perimeter': 1.4,
  'angles': 1.3,
  'triangles': 1.5,
  'circles': 1.6,
  
  // Logic (1.2 - 1.5)
  'logic': 1.2,
  'patterns': 1.3,
  'sequences': 1.4,
  'deduction': 1.5,
  
  // Statistics (1.6 - 1.8)
  'statistics': 1.6,
  'probability': 1.8
};

// Speed bonus thresholds (response time in seconds)
export const SPEED_THRESHOLDS = {
  lightning: { max: 5, multiplier: 1.5 },   // < 5 seconds
  fast: { max: 10, multiplier: 1.3 },       // < 10 seconds  
  normal: { max: 20, multiplier: 1.0 },     // < 20 seconds
  slow: { max: 40, multiplier: 0.8 },       // < 40 seconds
  very_slow: { max: Infinity, multiplier: 0.5 } // > 40 seconds
};

// Problem generation API response
export interface ProblemGenerationResponse {
  success: boolean;
  problem?: GeneratedProblem;
  error?: string;
  cached?: boolean;
  generation_time?: number; // milliseconds
  provider?: 'gemini' | 'fallback' | 'cache';
}

// Card play API response  
export interface CardPlayResponse {
  success: boolean;
  problem?: GeneratedProblem;
  session_id?: string;
  error?: string;
}

// Problem solve API response
export interface ProblemSolveResponse {
  success: boolean;
  is_correct: boolean;
  damage_calculation: DamageCalculation;
  learning_feedback: {
    explanation: string;
    concept_mastered: boolean;
    next_difficulty: number;
    encouragement: string;
    problem_type_progress: number; // 0.0 - 1.0
  };
  session_updated: boolean;
  error?: string;
}

// Utility type for card filtering
export interface CardFilters {
  category?: CardCategory;
  problem_type?: ProblemTypeCode;
  rarity?: CardRarity;
  level_range?: [number, number];
  power_range?: [number, number];
  search_text?: string;
}

// Card collection response
export interface CardCollectionResponse {
  cards: DynamicCard[];
  total_count: number;
  filters_applied: CardFilters;
  categories_count: Record<CardCategory, number>;
  problem_types_count: Record<ProblemTypeCode, number>;
  rarities_count: Record<CardRarity, number>;
}

// Learning analytics summary
export interface LearningAnalytics {
  user_id: string;
  overall_level: number;
  categories: Record<CardCategory, PlayerLearningProfile>;
  problem_type_mastery: Record<ProblemTypeCode, number>;
  recent_performance: {
    problems_solved_today: number;
    accuracy_today: number;
    time_played_today: number; // minutes
    streak_current: number;
    streak_best: number;
  };
  progress_trends: {
    weekly_accuracy: number[];
    weekly_problems: number[];
    skill_improvements: ProblemTypeCode[];
  };
  recommendations: {
    focus_categories: CardCategory[];
    focus_problem_types: ProblemTypeCode[];
    suggested_difficulty: number;
    practice_topics: string[];
  };
}

// Export utility functions
export const getDifficultyForCard = (
  card: DynamicCard, 
  playerLevel: number
): number => {
  const baseLineByRarity = {
    común: 2,
    raro: 4,
    épico: 7,
    legendario: 9
  };
  
  const baseDifficulty = baseLineByRarity[card.rarity];
  const problemTypeBonus = card.problem_difficulty_base || 1;
  const levelBonus = Math.floor(playerLevel / 3);
  
  return Math.min(10, baseDifficulty + problemTypeBonus + levelBonus);
};

export const calculateSpeedMultiplier = (responseTimeMs: number): number => {
  const responseTimeSeconds = responseTimeMs / 1000;
  
  for (const [, threshold] of Object.entries(SPEED_THRESHOLDS)) {
    if (responseTimeSeconds <= threshold.max) {
      return threshold.multiplier;
    }
  }
  
  return SPEED_THRESHOLDS.very_slow.multiplier;
};

export const getProblemTypeIcon = (problemType: ProblemTypeCode): string => {
  const icons: Record<ProblemTypeCode, string> = {
    // Arithmetic
    'addition': '➕',
    'subtraction': '➖', 
    'multiplication': '✖️',
    'division': '➗',
    'fractions': '🔢',
    'decimals': '🔢',
    'percentages': '%',
    
    // Algebra
    'equations': '⚖️',
    'inequalities': '📊',
    'polynomials': '📐',
    'factorization': '🧮',
    
    // Geometry
    'area_perimeter': '📏',
    'angles': '📐',
    'triangles': '🔺',
    'circles': '⭕',
    
    // Logic
    'logic': '🧩',
    'patterns': '🔄',
    'sequences': '📈',
    'deduction': '🔍',
    
    // Statistics
    'statistics': '📊',
    'probability': '🎲'
  };
  
  return icons[problemType] || '🔢';
};

export const getCategoryIcon = (category: CardCategory): string => {
  const icons: Record<CardCategory, string> = {
    aritmética: '🔢',
    álgebra: '📐', 
    geometría: '📏',
    lógica: '🧩',
    estadística: '📊'
  };
  
  return icons[category];
};

export const getRarityColor = (rarity: CardRarity): string => {
  const colors = {
    común: 'text-green-600 border-green-200',
    raro: 'text-blue-600 border-blue-200',
    épico: 'text-purple-600 border-purple-200',
    legendario: 'text-yellow-600 border-yellow-200'
  };
  
  return colors[rarity];
};

export const getProblemTypeMultiplier = (problemType: ProblemTypeCode): number => {
  return PROBLEM_TYPE_MULTIPLIERS[problemType] || 1.0;
}; 