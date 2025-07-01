// Tipos del sistema de cartas matemáticas y lógicas

export interface Card {
  id: string;
  type: CardType;
  rarity: CardRarity;
  name: string;
  description: string;
  power: number;
  cost: number;
  problem: MathProblem | LogicProblem;
  effects: CardEffect[];
  artwork: CardArtwork;
  unlocked: boolean;
  stats?: CardStats;
  image_url?: string; // URL de imagen desde la base de datos
}

export interface MathProblem {
  question: string;
  answer: number | string;
  options?: (number | string)[];
  operation: MathOperation;
  difficulty: DifficultyLevel;
  timeLimit?: number; // en segundos
  hints: string[];
  explanation: string;
  type: 'math';
}

export interface LogicProblem {
  question: string;
  answer: string | number | string[];
  type: LogicType;
  options?: string[];
  difficulty: DifficultyLevel;
  hints: string[];
  explanation: string;
  context: LogicContext;
  problemType: 'logic';
}

export interface CardEffect {
  id: string;
  type: EffectType;
  value: number;
  duration: number; // turnos
  description: string;
  trigger: EffectTrigger;
}

export interface CardArtwork {
  image: string;
  animation?: string;
  particles?: ParticleConfig;
  shader?: ShaderConfig;
  model3D?: Model3DConfig;
  frame?: CardFrame;
}

export interface ParticleConfig {
  count: number;
  type: 'sparkles' | 'fire' | 'lightning' | 'magic' | 'ice';
  color: string;
  intensity: number;
  duration: number;
}

export interface ShaderConfig {
  holographic: boolean;
  rarity: CardRarity;
  glowIntensity: number;
  animationSpeed: number;
  colorShift: boolean;
}

export interface Model3DConfig {
  geometry: 'card' | 'crystal' | 'scroll';
  material: 'standard' | 'holographic' | 'magical';
  animations: Animation3D[];
  physics?: PhysicsConfig;
}

export interface Animation3D {
  name: string;
  type: 'hover' | 'select' | 'attack' | 'idle';
  duration: number;
  easing: string;
  properties: AnimationProperty[];
}

export interface AnimationProperty {
  property: 'position' | 'rotation' | 'scale' | 'opacity';
  from: number | [number, number, number];
  to: number | [number, number, number];
}

export interface PhysicsConfig {
  mass: number;
  friction: number;
  restitution: number;
  enableCollision: boolean;
}

// Tipos básicos
export type CardType = 'math' | 'logic' | 'special' | 'defense';

export type CardRarity = 'común' | 'raro' | 'épico' | 'legendario';

export type MathOperation = 
  | 'addition' 
  | 'subtraction' 
  | 'multiplication' 
  | 'division'
  | 'fractions'
  | 'decimals'
  | 'algebra';

export type LogicType = 
  | 'pattern' 
  | 'deduction' 
  | 'classification' 
  | 'strategy'
  | 'sequence'
  | 'spatial'
  | 'verbal';

export type LogicContext = 
  | 'fantasy' 
  | 'animals' 
  | 'space' 
  | 'everyday'
  | 'mystery'
  | 'adventure';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type EffectType = 
  | 'damage_boost'
  | 'heal'
  | 'shield'
  | 'draw_card'
  | 'extra_turn'
  | 'time_bonus'
  | 'hint_reveal';

export type EffectTrigger = 
  | 'on_play'
  | 'on_correct_answer'
  | 'on_fast_answer'
  | 'on_perfect_score'
  | 'on_combo';

// Interfaces de colección y deck
export interface CardCollection {
  cards: Card[];
  totalCards: number;
  unlockedCards: number;
  favoriteCards: string[]; // IDs de cartas favoritas
  recentlyUnlocked: string[];
  collectionStats: CollectionStats;
}

export interface CollectionStats {
  commonCards: number;
  rareCards: number;
  epicCards: number;
  legendaryCards: number;
  completionPercentage: number;
  totalPowerLevel: number;
}

export interface CardDeck {
  id: string;
  name: string;
  cards: Card[];
  maxSize: number;
  isActive: boolean;
  strategy: DeckStrategy;
  powerLevel: number;
}

export type DeckStrategy = 
  | 'balanced'
  | 'math_focused'
  | 'logic_focused'
  | 'speed'
  | 'power'
  | 'defensive';

export interface CardStats {
  cardId: string;
  timesUsed: number;
  successRate: number;
  averageTime: number;
  lastUsed: Date;
  totalDamageDealt: number;
  perfectAnswers: number;
  hintsUsed: number;
}

// Interfaces para el sistema de combate con cartas
export interface CombatAction {
  type: 'play_card' | 'solve_problem' | 'apply_damage' | 'use_effect';
  cardId?: string;
  problemResult?: ProblemResult;
  damage?: number;
  timestamp: Date;
  playerId: string;
}

export interface ProblemResult {
  isCorrect: boolean;
  answer: string | number;
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
  score: number; // 0-100
}

// Interfaces para el renderizado 3D
export interface Card3DProps {
  card: Card;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  isHovered: boolean;
  isSelected: boolean;
  isAnimating: boolean;
  onHover: () => void;
  onClick: () => void;
  onAnimationComplete?: () => void;
}

export interface CardRenderState {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  opacity: number;
  glowIntensity: number;
  animationState: 'idle' | 'hover' | 'selected' | 'attacking' | 'defending';
}

// New interface for card frame designs
export interface CardFrame {
  type: CardFrameType;
  imagePath: string;
  borderColor: string;
  accentColor: string;
  glowColor: string;
  textColor: string;
  backgroundPattern?: string;
  foilEffect?: boolean;
  holographicEffect?: boolean;
}

// Frame types corresponding to the 4 designs from Canva
export type CardFrameType = 
  | 'basicas'       // 🟢 Básicas (Verde) - Starting cards, foundation level
  | 'intermedias'   // 🟣 Intermedias (Púrpura) - Natural progression
  | 'avanzadas'     // 🔴 Avanzadas (Rojo) - Challenging content
  | 'logica'        // 🔵 Lógica (Azul) - Perfect complement
  | 'especiales';   // ⚪ Defensa/Especiales (Blanco) - Extra mechanics 