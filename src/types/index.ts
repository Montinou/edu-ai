// Exportar todos los tipos de la aplicación
export * from './cards';
export * from './game';
export * from './user';

// Re-export AI types explicitly to avoid conflicts
export type {
  AIService,
  MathProblemParams,
  LogicProblemParams,
  PromptValidationParams,
  TutoringParams,
  StoryParams,
  CharacterParams,
  CompleteCardParams,
  MathProblem,
  LogicProblem,
  PromptValidation,
  TutoringResponse,
  StoryElement,
  CharacterDescription,
  CompleteCard,
  AIError,
  AIErrorCode,
  AIConfig
} from './ai';

export * from './imageGeneration'; 