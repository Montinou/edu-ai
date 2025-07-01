import { CardType, CardRarity, MathOperation, LogicType } from './cards';

export type ProviderName = 'huggingface' | 'pollinations' | 'replicate' | 'placeholder';

// Reusing existing types from cards.ts
export type ImageCardType = CardType;
export type ImageCardRarity = CardRarity;
export type ImageMathType = MathOperation;
export type ImageLogicType = LogicType;

export interface PromptConfig {
  prompt: string;
  negativePrompt: string;
  width: number;
  height: number;
  steps: number;
  cfgScale: number;
  seed: number;
}

export interface GenerationResult {
  success: boolean;
  imageUrl: string;
  cached: boolean;
  provider: ProviderName;
  cost: number;
  processingTime?: number;
  error?: string;
}

export interface CachedImage {
  url: string;
  provider: ProviderName;
  timestamp: number;
}

export interface AIProvider {
  name: ProviderName;
  endpoint: string;
  apiKey?: string;
  rateLimit: number;
  cost: number;
  quality: 'low' | 'medium' | 'high' | 'premium';
  responseTime: number;
  reliability: number;
}

export interface ImageGenerationConfig {
  cardType: ImageCardType;
  mathType?: ImageMathType | ImageLogicType;
  rarity: ImageCardRarity;
  customPrompt?: string;
  forceRegenerate?: boolean;
  preferredProvider?: ProviderName;
}

export interface CardPromptConfig {
  baseStyle: string;
  qualityModifiers: string;
  negativePrompt: string;
  cardType: ImageCardType;
  rarity: ImageCardRarity;
  educationalContext: string;
}

// Firestore document interfaces
export interface ImageCacheDoc {
  image_url: string;
  provider: string;
  cost: number;
  processing_time: number;
  created_at: Date | { seconds: number; nanoseconds: number }; // Firebase Timestamp
  access_count: number;
}

export interface ProviderUsageDoc {
  provider: string;
  date: string; // YYYY-MM-DD
  requests_count: number;
  total_cost: number;
  success_rate: number;
  avg_response_time: number;
}

export interface PromptTemplateDoc {
  card_type: string;
  math_type: string;
  rarity: string;
  prompt_text: string;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  created_at: Date | { seconds: number; nanoseconds: number }; // Firebase Timestamp
} 