// Tipos principales del sistema de juego
import type { Card } from './cards';

export interface GameState {
  player: Player;
  enemy: Enemy | null;
  currentTurn: 'player' | 'enemy';
  phase: 'setup' | 'battle' | 'result';
  round: number;
  isGameActive: boolean;
}

export interface Player {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  deck: Card[];
  hand: Card[];
}

export interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  difficulty: number;
  sprite: string;
  description?: string;
}

export interface BattleResult {
  id?: string;
  playerId: string;
  success: boolean;
  damage: number;
  xpGained: number;
  timeBonus?: number;
  perfectBonus?: boolean;
  winner?: string;
  timestamp?: Date;
}

export interface GameProgress {
  currentLevel: number;
  unlockedLevels: number[];
  completedLevels: number[];
  totalXP: number;
  totalBattlesWon: number;
  totalBattlesLost: number;
  averageAccuracy: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Level {
  id: number;
  name: string;
  description: string;
  difficulty: number;
  requiredLevel: number;
  enemies: Enemy[];
  rewards: LevelReward[];
  isUnlocked: boolean;
  isCompleted: boolean;
  stars: number; // 0-3 estrellas
}

export interface LevelReward {
  type: 'xp' | 'card' | 'achievement';
  value: number | string;
  description: string;
}

// Game Session for Firebase
export interface GameSession {
  id?: string;
  userId: string;
  sessionType: 'practice' | 'battle' | 'tutorial';
  startTime: Date;
  endTime?: Date;
  problemsAttempted: number;
  problemsCorrect: number;
  totalXpGained: number;
  averageResponseTime: number;
  difficulty: 'easy' | 'normal' | 'hard';
  isCompleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
} 