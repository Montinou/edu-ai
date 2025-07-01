// Tipos para los servicios de IA

import type { MathProblem, LogicProblem, DifficultyLevel } from './cards';

// Re-export types needed by aiService
export type { MathProblem, LogicProblem, DifficultyLevel } from './cards';

export interface AIService {
  generateMathProblem(params: MathProblemParams): Promise<MathProblem>;
  generateLogicProblem(params: LogicProblemParams): Promise<LogicProblem>;
  validatePrompt(params: PromptValidationParams): Promise<PromptValidation>;
  provideTutoring(params: TutoringParams): Promise<TutoringResponse>;
  generateStoryElement(params: StoryParams): Promise<StoryElement>;
  generateCharacter(params: CharacterParams): Promise<CharacterDescription>;
  generateCompleteCard(params: CompleteCardParams): Promise<CompleteCard>;
}

// Parámetros para generación de problemas
export interface MathProblemParams {
  difficulty: DifficultyLevel;
  operation: string;
  studentLevel: number;
  previousProblems?: string[];
  context?: string;
  timeLimit?: number;
  includeHints?: boolean;
}

export interface LogicProblemParams {
  type: string;
  difficulty: DifficultyLevel;
  age: number;
  context: string;
  previousProblems?: string[];
  includeVisuals?: boolean;
}

// Validación de prompts
export interface PromptValidationParams {
  prompt: string;
  context: PromptContext;
  expectedResult: string;
  studentAge: number;
  safetyCheck?: boolean;
}

export interface PromptValidation {
  isValid: boolean;
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
  safetyFlags?: SafetyFlag[];
  improvements?: PromptImprovement[];
}

export interface SafetyFlag {
  type: 'inappropriate' | 'complex' | 'unclear' | 'off-topic';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion: string;
}

export interface PromptImprovement {
  category: 'clarity' | 'specificity' | 'creativity' | 'structure';
  current: string;
  suggested: string;
  explanation: string;
}

export type PromptContext = 
  | 'character-creation'
  | 'story-writing'
  | 'problem-solving'
  | 'creative-expression'
  | 'learning-assistance';

// Sistema de tutoría adaptativa
export interface TutoringParams {
  problem: MathProblem | LogicProblem;
  studentAnswer: string | number;
  attempts: number;
  timeSpent: number;
  studentProfile: StudentProfile;
  previousInteractions?: TutoringInteraction[];
}

export interface StudentProfile {
  id: string;
  level: number;
  age: number;
  strengths: string[];
  weaknesses: string[];
  learningStyle: LearningStyle;
  preferredDifficulty: DifficultyLevel;
  attentionSpan: number; // minutos
  motivationFactors: string[];
}

export type LearningStyle = 
  | 'visual'
  | 'auditory'
  | 'kinesthetic'
  | 'reading'
  | 'mixed';

export interface TutoringResponse {
  feedback: TutoringFeedback;
  adaptiveRecommendations: AdaptiveRecommendations;
  nextActions: NextAction[];
  encouragement: string;
  estimatedDifficulty?: DifficultyLevel;
}

export interface TutoringFeedback {
  isCorrect: boolean;
  encouragement: string;
  hint?: string;
  explanation?: string;
  nextSteps: string[];
  visualAids?: VisualAid[];
}

export interface VisualAid {
  type: 'diagram' | 'animation' | 'illustration' | 'chart';
  description: string;
  url?: string;
  instructions: string;
}

export interface AdaptiveRecommendations {
  adjustDifficulty: 'maintain' | 'increase' | 'decrease';
  focusAreas: string[];
  suggestedPractice: string[];
  timeRecommendation: number; // minutos
  breakSuggestion?: boolean;
}

export interface NextAction {
  type: 'practice' | 'review' | 'advance' | 'break' | 'help';
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
}

export interface TutoringInteraction {
  timestamp: Date;
  problemType: string;
  studentResponse: string | number;
  wasCorrect: boolean;
  hintsUsed: number;
  timeSpent: number;
  emotionalState?: EmotionalState;
}

export type EmotionalState = 
  | 'confident'
  | 'frustrated'
  | 'curious'
  | 'bored'
  | 'excited'
  | 'confused';

// Generación de contenido narrativo
export interface StoryParams {
  context: string;
  age: number;
  theme?: string;
  characters?: string[];
  setting?: string;
  length: 'short' | 'medium' | 'long';
  educationalGoal?: string;
}

export interface StoryElement {
  title: string;
  content: string;
  characters: CharacterDescription[];
  setting: SettingDescription;
  moralLesson?: string;
  educationalValue: string[];
  ageAppropriate: boolean;
  estimatedReadingTime: number;
}

export interface CharacterParams {
  type: 'hero' | 'mentor' | 'companion' | 'antagonist' | 'helper';
  context: string;
  age: number;
  personality?: string[];
  skills?: string[];
  appearance?: string;
  role?: string;
}

// Parámetros para generación completa de cartas
export interface CompleteCardParams {
  difficulty: DifficultyLevel;
  cardType: 'math' | 'logic' | 'special' | 'defense';
  operation?: string;
  logicType?: string;
  studentLevel: number;
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  theme?: string;
  context?: string;
}

// Carta completa generada por IA
export interface CompleteCard {
  id: string;
  name: string;
  description: string;
  type: 'math' | 'logic' | 'special' | 'defense';
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  power: number;
  cost: number;
  problem: MathProblem | LogicProblem;
  effects: CardEffect[];
  artwork: CardArtworkSuggestion;
  unlocked: boolean;
  aiGenerated: true;
  balanceScore: number; // 0-100, qué tan balanceada está la carta
  educationalValue: string[];
  thematicConsistency: number; // 0-100
}

export interface CardEffect {
  id: string;
  type: 'damage_boost' | 'heal' | 'shield' | 'draw_card' | 'extra_turn' | 'time_bonus' | 'hint_reveal';
  value: number;
  duration: number;
  description: string;
  trigger: 'on_play' | 'on_correct_answer' | 'on_fast_answer' | 'on_perfect_score' | 'on_combo';
}

export interface CardArtworkSuggestion {
  image: string;
  description: string;
  colorScheme: string[];
  mood: string;
  visualElements: string[];
  frame?: {
    type: 'basicas' | 'intermedias' | 'avanzadas' | 'logica' | 'especiales';
    borderColor: string;
    accentColor: string;
    glowColor: string;
  };
}

export interface CharacterDescription {
  name: string;
  type: string;
  description: string;
  personality: string[];
  appearance: string;
  specialties: string[];
  backstory?: string;
  catchphrase?: string;
  visualPrompt?: string;
}

export interface SettingDescription {
  name: string;
  description: string;
  atmosphere: string;
  keyFeatures: string[];
  timeOfDay?: string;
  weather?: string;
  visualPrompt?: string;
}

// Análisis y métricas de IA
export interface AIAnalytics {
  totalProblemsGenerated: number;
  averageGenerationTime: number;
  successRate: number;
  mostRequestedTypes: string[];
  userSatisfactionScore: number;
  errorRate: number;
  costMetrics: CostMetrics;
}

export interface CostMetrics {
  totalTokensUsed: number;
  averageTokensPerRequest: number;
  estimatedCost: number;
  costPerUser: number;
  costPerProblem: number;
}

// Configuración de servicios de IA
export interface AIConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  googleai?: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  anthropic?: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  fallbackService: 'openai' | 'googleai' | 'anthropic' | 'local';
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  caching: {
    enabled: boolean;
    ttl: number; // segundos
    maxSize: number;
  };
}

// Respuestas de error de IA
export interface AIError {
  code: AIErrorCode;
  message: string;
  details?: Record<string, unknown>;
  retryable: boolean;
  timestamp: Date;
}

export type AIErrorCode = 
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'SERVICE_UNAVAILABLE'
  | 'CONTENT_FILTERED'
  | 'TIMEOUT'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_API_KEY';

// Tipos para el sistema de prompting educativo
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  template: string;
  variables: PromptVariable[];
  difficulty: DifficultyLevel;
  ageRange: [number, number];
  examples: PromptExample[];
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'select' | 'multiselect';
  required: boolean;
  description: string;
  options?: string[];
  defaultValue?: string | number | string[];
}

export interface PromptExample {
  input: Record<string, string | number | string[]>;
  expectedOutput: string;
  explanation: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
} 