// Tipos del sistema de usuario

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  level: number;
  xp: number;
  createdAt: Date;
  lastLoginAt: Date;
  preferences: UserPreferences;
  statistics: UserStatistics;
  achievements: Achievement[];
}

export interface UserPreferences {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'auto';
}

export interface UserStatistics {
  totalPlayTime: number; // en minutos
  totalProblemsAttempted: number;
  totalProblemsCorrect: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  averageAccuracy: number;
  averageResponseTime: number; // en segundos
  currentStreak: number;
  longestStreak: number;
  favoriteOperation: string;
  weakestOperation: string;
  dailyGoalStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: AchievementCategory;
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export type AchievementCategory = 
  | 'first_steps'
  | 'accuracy'
  | 'speed'
  | 'consistency'
  | 'exploration'
  | 'mastery'
  | 'special';

export interface UserSession {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  problemsAttempted: number;
  problemsCorrect: number;
  xpGained: number;
  battlesWon: number;
  battlesLost: number;
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD
  target: number; // problemas a resolver
  completed: number;
  isCompleted: boolean;
  xpBonus: number;
}

// Player Progress for Firebase
export interface PlayerProgress {
  id: string;
  userId: string;
  level: number;
  experience: number;
  totalProblemsCompleted: number;
  correctAnswers: number;
  totalBattles: number;
  battlesWon: number;
  currentStreak: number;
  longestStreak: number;
  averageAccuracy: number;
  totalPlayTime: number; // in minutes
  lastPlayedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// User Card Collection for Firebase
export interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  level: number;
  experience: number;
  timesUsed: number;
  isUpgraded: boolean;
  obtainedAt: Date;
  lastUsedAt?: Date;
}

// User Collection for Supabase (nueva tabla)
export interface UserCollection {
  id: string;
  user_email: string;
  card_id: string;
  quantity: number;
  level: number;
  experience: number;
  times_used: number;
  is_upgraded: boolean;
  is_favorite: boolean;
  obtained_at: Date;
  last_used_at?: Date;
} 