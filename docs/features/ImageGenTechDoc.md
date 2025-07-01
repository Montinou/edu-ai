# Especificación Técnica - Sistema de Generación de Imágenes AI
## EduCard AI - Image Generation Service

**Versión:** 1.0.0  
**Fecha:** 2025-05-27  
**Autor:** Desarrollo EduCard AI  

---

## 📋 Resumen Ejecutivo

Sistema de generación de imágenes para cartas educativas que combina múltiples proveedores de IA gratuitos y premium, con fallbacks inteligentes y cache optimizado para reducir costos y mejorar performance.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
```typescript
// Core Dependencies
"@huggingface/inference": "^2.6.4",
"replicate": "^0.25.2", 
"sharp": "^0.33.2",
"canvas": "^2.11.2",
"@supabase/storage-js": "^2.5.4"

// Utility Dependencies  
"crypto": "node built-in",
"fs/promises": "node built-in",
"path": "node built-in"
```

### Proveedores de IA Configurados

```typescript
interface AIProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
  rateLimit: number;
  cost: number;
  quality: 'low' | 'medium' | 'high' | 'premium';
  responseTime: number; // seconds
  reliability: number; // 1-5 scale
}

const PROVIDERS: AIProvider[] = [
  {
    name: 'huggingface',
    endpoint: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
    apiKey: process.env.HUGGINGFACE_API_KEY,
    rateLimit: 1000, // per month
    cost: 0,
    quality: 'high',
    responseTime: 15,
    reliability: 4
  },
  {
    name: 'pollinations',
    endpoint: 'https://image.pollinations.ai/prompt/',
    rateLimit: 10000, // per day (estimated)
    cost: 0,
    quality: 'medium',
    responseTime: 2,
    reliability: 3
  },
  {
    name: 'replicate',
    endpoint: 'https://api.replicate.com/v1/predictions',
    apiKey: process.env.REPLICATE_API_TOKEN,
    rateLimit: -1, // pay per use
    cost: 0.0023, // per image
    quality: 'premium',
    responseTime: 10,
    reliability: 5
  }
];
```

## 🎨 Sistema de Prompts

### Estructura de Prompts Base

```typescript
interface CardPromptConfig {
  baseStyle: string;
  qualityModifiers: string;
  negativePrompt: string;
  cardType: CardType;
  rarity: CardRarity;
  educationalContext: EducationalContext;
}

const PROMPT_TEMPLATES = {
  baseStyle: "anime style, Studio Ghibli inspired, clean and expressive, vibrant but not oversaturated colors, magical educational theme, card game aesthetic, detailed illustration, fantasy elements, child-friendly, magical academy setting",
  
  qualityModifiers: "high quality, detailed digital art, trading card game style, centered composition, magical border effects, holographic elements, fantasy card frame",
  
  negativePrompt: "ugly, blurry, distorted, inappropriate content, violent, scary, dark themes, adult themes, low quality, pixelated, watermark, text overlay, realistic photography, photorealistic, nsfw",
  
  rarityModifiers: {
    common: "simple magical effects, basic glow, clean design",
    rare: "enhanced magical aura, moderate particle effects, detailed magical elements", 
    epic: "powerful magical effects, complex particle systems, dramatic lighting, intricate magical details",
    legendary: "overwhelming magical presence, cinematic lighting effects, complex magical phenomena, legendary aura, epic proportions"
  }
};
```

### Prompts Específicos por Categoría

```typescript
const CARD_PROMPTS = {
  math: {
    addition: [
      "young magical student casting addition spell with glowing crystal orbs showing numbers, bright blue and gold magical effects, mathematical symbols floating around, academy classroom background",
      "cute magical flowers with numbers on petals being combined by fairy magic, pastel colors, garden academy setting, mathematical sparkles in the air",
      "magical cauldron with numbered bubbles rising and combining, purple and green magical effects, alchemy laboratory, mathematical formulas glowing in steam"
    ],
    subtraction: [
      "mystical shield with glowing moon phases showing subtraction, silver and blue magical aura, protective magical barriers, nighttime academy courtyard",
      "magical mirror reflecting mathematical operations, numbers fading away in golden light, time magic effects, mystical library setting",
      "wind elemental dispersing numbered leaves, green and white magical currents, peaceful forest clearing, mathematical symbols in wind patterns"
    ],
    multiplication: [
      "small friendly dragon breathing mathematical fire with multiplying numbers, red and orange flames, numbers duplicating in magical patterns, dragon academy training grounds",
      "magical crystals creating multiple reflections with numbers multiplying, rainbow refractions, geometric magical effects, crystal cave academy",
      "magical seeds rapidly growing into numbered plants, nature magic with mathematical progression, green growth energy, botanical academy greenhouse"
    ],
    division: [
      "wise owl professor with magical equations dividing into perfect portions, scholarly magical effects, ancient books floating, academy library tower",
      "golden magical scales perfectly dividing mathematical elements, celestial magic, stars and constellation patterns, observatory academy",
      "mystical maze with pathways showing division solutions, puzzle magic effects, geometric patterns, academy puzzle chamber"
    ]
  },
  
  logic: {
    patterns: [
      "intricate magical mandala with evolving geometric patterns, mystical mathematical sequences, purple and gold magical energy, pattern recognition magic",
      "stars moving in logical sequence patterns, celestial magic, night sky with mathematical star formations, cosmic academy observatory",
      "ancient magical runes appearing in logical order, mystical writing magic, glowing symbols, ancient academy scriptorium"
    ],
    deduction: [
      "young detective character with magical magnifying glass revealing hidden clues, mystery magic effects, logical thinking aura, academy investigation room",
      "magical mirror showing logical connections between clues, truth-revealing magic, connecting light beams, academy divination chamber",
      "transparent maze showing thought processes, mind magic visualization, logical pathway lighting, academy psychology tower"
    ],
    classification: [
      "magical books organizing themselves by categories, knowledge magic, floating organized elements, academy grand library",
      "magical garden with plants arranging by type and characteristics, nature organization magic, botanical academy grounds",
      "magical crystals sorting themselves by properties, crystalline magic effects, mineral classification, academy geology lab"
    ]
  },
  
  special: {
    guardians: [
      "friendly sphinx character with scrolls of riddles, ancient wisdom magic, golden magical effects, academy sphinx statue come to life",
      "stone golem made of mathematical blocks, earth magic with logical patterns, academy construction site, building block magic",
      "majestic phoenix with mathematical flames, rebirth magic representing learning from mistakes, fiery academy spire"
    ],
    powerups: [
      "glowing study potion with magical focus effects, clarity magic, academic enhancement, academy alchemy lab",
      "magical scroll unrolling with helpful hints, guidance magic, glowing text, academy study hall",
      "time magic crystal granting additional thinking time, temporal magic effects, clock magic, academy time tower"
    ],
    legendary: [
      "wise magical teacher character surrounded by mathematical elements, master-level magic aura, academy headmaster appearance, teaching magic effects",
      "elegant magical princess with crown made of fraction symbols, royal mathematical magic, palace academy setting",
      "stealthy ninja character with algebraic throwing stars, shadow magic with mathematical precision, academy training dojo"
    ]
  }
};
```

## 🔧 Implementación del Servicio

### Clase Principal - ImageGenerationService

```typescript
// services/imageGeneration.ts
import { HfInference } from '@huggingface/inference';
import Replicate from 'replicate';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import admin from 'firebase-admin';
import crypto from 'crypto';
import sharp from 'sharp';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

export class ImageGenerationService {
  private hf: HfInference;
  private replicate: Replicate;
  private db: any;
  private storage: any;
  private adminStorage: any;
  private cache: Map<string, CachedImage> = new Map();
  private retryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  };

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN!,
    });
    
    // Initialize Firebase client
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
    this.db = getFirestore();
    this.storage = getStorage();
    
    // Admin storage for server-side operations
    this.adminStorage = admin.storage().bucket();
  }

  /**
   * Genera una imagen de carta basada en el tipo y rareza
   */
  async generateCardImage(
    cardType: CardType,
    mathType: MathType | LogicType,
    rarity: CardRarity,
    customPrompt?: string
  ): Promise<GenerationResult> {
    const promptConfig = this.buildPromptConfig(cardType, mathType, rarity, customPrompt);
    const cacheKey = this.generateCacheKey(promptConfig);
    
    // Check cache first
    const cached = await this.getCachedImage(cacheKey);
    if (cached) {
      return {
        success: true,
        imageUrl: cached.url,
        cached: true,
        provider: cached.provider,
        cost: 0
      };
    }

    // Determine provider based on rarity and availability
    const provider = this.selectProvider(rarity);
    
    try {
      const result = await this.generateWithProvider(provider, promptConfig);
      
      // Cache the result
      await this.cacheImage(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error(`Generation failed with ${provider}:`, error);
      
      // Try fallback provider
      const fallbackProvider = this.selectFallbackProvider(provider);
      if (fallbackProvider) {
        try {
          const result = await this.generateWithProvider(fallbackProvider, promptConfig);
          await this.cacheImage(cacheKey, result);
          return result;
        } catch (fallbackError) {
          console.error(`Fallback generation failed:`, fallbackError);
        }
      }
      
      // Return placeholder image
      return this.getPlaceholderImage(cardType, rarity);
    }
  }

  /**
   * Construye la configuración completa del prompt
   */
  private buildPromptConfig(
    cardType: CardType,
    mathType: MathType | LogicType,
    rarity: CardRarity,
    customPrompt?: string
  ): PromptConfig {
    const basePrompt = customPrompt || this.getRandomPrompt(cardType, mathType);
    const fullPrompt = [
      PROMPT_TEMPLATES.baseStyle,
      basePrompt,
      PROMPT_TEMPLATES.rarityModifiers[rarity],
      PROMPT_TEMPLATES.qualityModifiers
    ].join(', ');

    return {
      prompt: fullPrompt,
      negativePrompt: PROMPT_TEMPLATES.negativePrompt,
      width: 512,
      height: 768,
      steps: rarity === 'legendary' ? 30 : 20,
      cfgScale: 7,
      seed: Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * Selecciona el proveedor óptimo basado en rareza y disponibilidad
   */
  private selectProvider(rarity: CardRarity): ProviderName {
    // Legendary and Epic cards use premium providers
    if (rarity === 'legendary' || rarity === 'epic') {
      return 'replicate';
    }
    
    // For common/rare cards, use free providers
    // Check HuggingFace rate limit first
    if (this.checkRateLimit('huggingface')) {
      return 'huggingface';
    }
    
    // Fallback to Pollinations
    return 'pollinations';
  }

  /**
   * Genera imagen usando HuggingFace Inference API
   */
  private async generateWithHuggingFace(config: PromptConfig): Promise<GenerationResult> {
    const model = 'runwayml/stable-diffusion-v1-5';
    
    const response = await this.hf.textToImage({
      model: model,
      inputs: config.prompt,
      parameters: {
        negative_prompt: config.negativePrompt,
        width: config.width,
        height: config.height,
        num_inference_steps: config.steps,
        guidance_scale: config.cfgScale
      }
    });

    const imageBuffer = await response.arrayBuffer();
    const processedImage = await this.processImage(Buffer.from(imageBuffer));
    const imageUrl = await this.uploadToStorage(processedImage, 'huggingface');

    return {
      success: true,
      imageUrl,
      cached: false,
      provider: 'huggingface',
      cost: 0,
      processingTime: Date.now() - this.startTime
    };
  }

  /**
   * Genera imagen usando Pollinations.ai
   */
  private async generateWithPollinations(config: PromptConfig): Promise<GenerationResult> {
    const encodedPrompt = encodeURIComponent(config.prompt);
    const params = new URLSearchParams({
      width: config.width.toString(),
      height: config.height.toString(),
      model: 'deliberate',
      seed: config.seed.toString()
    });
    
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?${params.toString()}`;
    
    // Download and process the image
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const processedImage = await this.processImage(Buffer.from(imageBuffer));
    const finalUrl = await this.uploadToStorage(processedImage, 'pollinations');

    return {
      success: true,
      imageUrl: finalUrl,
      cached: false,
      provider: 'pollinations',
      cost: 0,
      processingTime: Date.now() - this.startTime
    };
  }

  /**
   * Genera imagen usando Replicate
   */
  private async generateWithReplicate(config: PromptConfig): Promise<GenerationResult> {
    const model = "cjwbw/anything-v3-better-vae:09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65";
    
    const output = await this.replicate.run(model, {
      input: {
        prompt: config.prompt,
        negative_prompt: config.negativePrompt,
        width: config.width,
        height: config.height,
        scheduler: "K_EULER_ANCESTRAL",
        num_outputs: 1,
        guidance_scale: config.cfgScale,
        num_inference_steps: config.steps,
        seed: config.seed
      }
    }) as string[];

    const imageUrl = output[0];
    
    // Download and process
    const response = await fetch(imageUrl);
    const imageBuffer = await response.arrayBuffer();
    const processedImage = await this.processImage(Buffer.from(imageBuffer));
    const finalUrl = await this.uploadToStorage(processedImage, 'replicate');

    return {
      success: true,
      imageUrl: finalUrl,
      cached: false,
      provider: 'replicate',
      cost: 0.0023,
      processingTime: Date.now() - this.startTime
    };
  }

  /**
   * Procesa la imagen (resize, optimize, add border)
   */
  private async processImage(imageBuffer: Buffer): Promise<Buffer> {
    return await sharp(imageBuffer)
      .resize(512, 768, { 
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: 90,
        progressive: true
      })
      .toBuffer();
  }

  /**
   * Sube la imagen a Firebase Storage
   */
  private async uploadToStorage(imageBuffer: Buffer, provider: string): Promise<string> {
    const fileName = `cards/${Date.now()}-${provider}-${crypto.randomUUID()}.jpg`;
    
    // Using Firebase Admin SDK for server-side upload
    const file = this.adminStorage.file(fileName);
    
    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/jpeg',
        cacheControl: 'public, max-age=3600',
        metadata: {
          provider: provider,
          generated: new Date().toISOString()
        }
      }
    });

    // Make file publicly accessible
    await file.makePublic();
    
    return `https://storage.googleapis.com/${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}/${fileName}`;
  }

  /**
   * Sistema de cache con persistencia en Firestore
   */
  private async getCachedImage(cacheKey: string): Promise<CachedImage | null> {
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 86400000) { // 24 hours
        return cached;
      }
    }

    // Check Firestore cache
    try {
      const docRef = doc(this.db, 'image_cache', cacheKey);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const createdAt = data.created_at.toDate().getTime();
        
        if (Date.now() - createdAt < 86400000) { // 24 hours
          const cachedImage: CachedImage = {
            url: data.image_url,
            provider: data.provider,
            timestamp: createdAt
          };
          
          // Update memory cache
          this.cache.set(cacheKey, cachedImage);
          return cachedImage;
        }
      }
    } catch (error) {
      console.error('Cache retrieval error:', error);
    }

    return null;
  }

  private async cacheImage(cacheKey: string, result: GenerationResult): Promise<void> {
    const cachedImage: CachedImage = {
      url: result.imageUrl,
      provider: result.provider,
      timestamp: Date.now()
    };

    // Update memory cache
    this.cache.set(cacheKey, cachedImage);

    // Update Firestore cache
    try {
      const docRef = doc(this.db, 'image_cache', cacheKey);
      await setDoc(docRef, {
        image_url: result.imageUrl,
        provider: result.provider,
        cost: result.cost,
        processing_time: result.processingTime,
        created_at: new Date(),
        access_count: 1
      });
    } catch (error) {
      console.error('Cache storage error:', error);
    }
  }

  /**
   * Genera clave de cache única para el prompt
   */
  private generateCacheKey(config: PromptConfig): string {
    const data = JSON.stringify({
      prompt: config.prompt,
      width: config.width,
      height: config.height,
      steps: config.steps
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Obtiene un prompt aleatorio basado en el tipo de carta
   */
  private getRandomPrompt(cardType: CardType, mathType: MathType | LogicType): string {
    const prompts = CARD_PROMPTS[cardType]?.[mathType] || CARD_PROMPTS.special.powerups;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  /**
   * Verifica límites de tasa de API
   */
  private checkRateLimit(provider: ProviderName): boolean {
    // Implementar lógica de rate limiting
    // Por ahora, retorna true
    return true;
  }

  /**
   * Retorna imagen placeholder en caso de fallo
   */
  private getPlaceholderImage(cardType: CardType, rarity: CardRarity): GenerationResult {
    return {
      success: false,
      imageUrl: `/placeholder-cards/${cardType}-${rarity}.jpg`,
      cached: false,
      provider: 'placeholder',
      cost: 0,
      error: 'Generation failed, using placeholder'
    };
  }
}
```

## 🗃️ Estructura de Firestore

### Colecciones principales:

```typescript
// Collection: image_cache
interface ImageCacheDoc {
  image_url: string;
  provider: string;
  cost: number;
  processing_time: number;
  created_at: Timestamp;
  access_count: number;
}

// Collection: provider_usage  
interface ProviderUsageDoc {
  provider: string;
  date: string; // YYYY-MM-DD
  requests_count: number;
  total_cost: number;
  success_rate: number;
  avg_response_time: number;
}

// Collection: prompt_templates
interface PromptTemplateDoc {
  card_type: string;
  math_type: string;
  rarity: string;
  prompt_text: string;
  is_active: boolean;
  usage_count: number;
  success_rate: number;
  created_at: Timestamp;
}

// Collection: user_cards (para el juego)
interface UserCardDoc {
  user_id: string;
  card_id: string;
  quantity: number;
  acquired_at: Timestamp;
  image_url?: string;
}
```

### Índices de Firestore recomendados:

```javascript
// Crear estos índices en Firebase Console
const indexes = [
  {
    collection: 'image_cache',
    fields: [
      { field: 'created_at', mode: 'DESCENDING' },
      { field: 'provider', mode: 'ASCENDING' }
    ]
  },
  {
    collection: 'provider_usage',
    fields: [
      { field: 'date', mode: 'DESCENDING' },
      { field: 'provider', mode: 'ASCENDING' }
    ]
  },
  {
    collection: 'prompt_templates',
    fields: [
      { field: 'card_type', mode: 'ASCENDING' },
      { field: 'math_type', mode: 'ASCENDING' },
      { field: 'rarity', mode: 'ASCENDING' }
    ]
  }
];
```

## 📊 Tipos TypeScript

```typescript
// types/imageGeneration.ts
export type ProviderName = 'huggingface' | 'pollinations' | 'replicate' | 'placeholder';

export type CardType = 'math' | 'logic' | 'special';

export type MathType = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'algebra';

export type LogicType = 'patterns' | 'deduction' | 'classification' | 'strategy';

export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';

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
  cardType: CardType;
  mathType?: MathType | LogicType;
  rarity: CardRarity;
  customPrompt?: string;
  forceRegenerate?: boolean;
  preferredProvider?: ProviderName;
}
```

## 🚀 API Endpoints

```typescript
// pages/api/generate-card-image.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ImageGenerationService } from '../../services/imageGeneration';

const imageService = new ImageGenerationService();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cardType, mathType, rarity, customPrompt, forceRegenerate } = req.body;

    // Validación
    if (!cardType || !rarity) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await imageService.generateCardImage(
      cardType,
      mathType,
      rarity,
      customPrompt
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Image generation failed',
      details: error.message 
    });
  }
}

// pages/api/batch-generate.ts
export default async function batchHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cards } = req.body; // Array of card configs
    
    const results = await Promise.allSettled(
      cards.map((config: ImageGenerationConfig) =>
        imageService.generateCardImage(
          config.cardType,
          config.mathType,
          config.rarity,
          config.customPrompt
        )
      )
    );

    const successful = results.filter(r => r.status === 'fulfilled');
    const failed = results.filter(r => r.status === 'rejected');

    res.status(200).json({
      successful: successful.length,
      failed: failed.length,
      results: results.map(r => 
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      )
    });
  } catch (error) {
    console.error('Batch generation error:', error);
    res.status(500).json({ error: 'Batch generation failed' });
  }
}
```

## 🔒 Variables de Entorno

```bash
# .env.local
# Hugging Face (Gratis)
HUGGINGFACE_API_KEY=hf_your_token_here

# Replicate (Premium)
REPLICATE_API_TOKEN=r8_your_token_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Configuración
NEXT_PUBLIC_IMAGE_GENERATION_ENABLED=true
NEXT_PUBLIC_CACHE_DURATION=86400000
NEXT_PUBLIC_MAX_CONCURRENT_GENERATIONS=3
```

## 📝 Scripts de Utilidad

```typescript
// scripts/generate-initial-cards.ts
import { ImageGenerationService } from '../services/imageGeneration';

const imageService = new ImageGenerationService();

const INITIAL_CARDS = [
  { cardType: 'math', mathType: 'addition', rarity: 'common' },
  { cardType: 'math', mathType: 'subtraction', rarity: 'common' },
  { cardType: 'math', mathType: 'multiplication', rarity: 'rare' },
  { cardType: 'logic', mathType: 'patterns', rarity: 'rare' },
  { cardType: 'special', mathType: 'guardians', rarity: 'epic' }
];

async function generateInitialSet() {
  console.log('Generating initial card set...');
  
  for (const config of INITIAL_CARDS) {
    try {
      const result = await imageService.generateCardImage(
        config.cardType as any,
        config.mathType as any,
        config.rarity as any
      );
      
      console.log(`✅ Generated ${config.cardType}-${config.mathType}-${config.rarity}: ${result.imageUrl}`);
    } catch (error) {
      console.error(`❌ Failed ${config.cardType}-${config.mathType}-${config.rarity}:`, error);
    }
  }
}

generateInitialSet().then(() => {
  console.log('Initial card generation complete!');
});
```

## 🧪 Testing

```typescript
// __tests__/imageGeneration.test.ts
import { ImageGenerationService } from '../services/imageGeneration';

describe('ImageGenerationService', () => {
  let service: ImageGenerationService;

  beforeEach(() => {
    service = new ImageGenerationService();
  });

  test('should generate math card image', async () => {
    const result = await service.generateCardImage(
      'math',
      'addition',
      'common'
    );

    expect(result.success).toBe(true);
    expect(result.imageUrl).toBeDefined();
    expect(result.provider).toBeDefined();
  });

  test('should use cache for duplicate requests', async () => {
    const result1 = await service.generateCardImage('math', 'addition', 'common');
    const result2 = await service.generateCardImage('math', 'addition', 'common');

    expect(result2.cached).toBe(true);
    expect(result1.imageUrl).toBe(result2.imageUrl);
  });

  test('should fallback to secondary provider on failure', async () => {
    // Mock primary provider failure
    jest.spyOn(service as any, 'generateWithHuggingFace')
      .mockRejectedValueOnce(new Error('API Error'));

    const result = await service.generateCardImage('math', 'addition', 'common');

    expect(result.success).toBe(true);
    expect(result.provider).toBe('pollinations');
  });
});
```

## 📈 Monitoreo y Analytics

```typescript
// services/imageAnalytics.ts
import { getFirestore, doc, setDoc, getDoc, query, collection, where, orderBy, getDocs } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export class ImageAnalytics {
  private static db = getFirestore();

  static async trackGeneration(
    provider: ProviderName,
    success: boolean,
    cost: number,
    responseTime: number
  ) {
    const today = new Date().toISOString().split('T')[0];
    const docRef = doc(this.db, 'provider_usage', `${provider}_${today}`);
    
    try {
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newRequestCount = data.requests_count + 1;
        const newTotalCost = data.total_cost + cost;
        const newSuccessCount = data.success_count + (success ? 1 : 0);
        const newTotalResponseTime = data.total_response_time + responseTime;
        
        await setDoc(docRef, {
          provider,
          date: today,
          requests_count: newRequestCount,
          total_cost: newTotalCost,
          success_count: newSuccessCount,
          success_rate: (newSuccessCount / newRequestCount) * 100,
          total_response_time: newTotalResponseTime,
          avg_response_time: newTotalResponseTime / newRequestCount,
          updated_at: Timestamp.now()
        });
      } else {
        await setDoc(docRef, {
          provider,
          date: today,
          requests_count: 1,
          total_cost: cost,
          success_count: success ? 1 : 0,
          success_rate: success ? 100 : 0,
          total_response_time: responseTime,
          avg_response_time: responseTime,
          created_at: Timestamp.now(),
          updated_at: Timestamp.now()
        });
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  static async getProviderStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    try {
      const q = query(
        collection(this.db, 'provider_usage'),
        where('date', '>=', startDateStr),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching provider stats:', error);
      return [];
    }
  }
}
```

## 🔥 Configuración Firebase

### Firebase Security Rules

```javascript
// Firestore Rules (firestore.rules)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Image cache - solo lectura para usuarios autenticados
    match /image_cache/{cacheId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo server-side
    }
    
    // Provider usage - solo admin
    match /provider_usage/{usageId} {
      allow read, write: if false; // Solo server-side
    }
    
    // User cards - solo el propietario
    match /user_cards/{cardId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.user_id;
    }
    
    // Prompt templates - solo lectura
    match /prompt_templates/{templateId} {
      allow read: if request.auth != null;
      allow write: if false; // Solo admin
    }
  }
}
```

```javascript
// Storage Rules (storage.rules)
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Card images - público para lectura
    match /cards/{cardId} {
      allow read: if true;
      allow write: if false; // Solo server-side
    }
    
    // User uploads (futuro)
    match /user-content/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### Firebase Admin SDK Setup

```typescript
// lib/firebase-admin.ts
import admin from 'firebase-admin';

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();

export default admin;
```

### Firebase Client SDK Setup

```typescript
// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
```

## 🔥 Configuración Firebase

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'image.pollinations.ai',
      'replicate.delivery',
      'storage.googleapis.com',
      'firebasestorage.googleapis.com'
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  webpack: (config) => {
    config.externals.push({
      'sharp': 'commonjs sharp',
      'canvas': 'commonjs canvas'
    });
    return config;
  }
};

module.exports = nextConfig;
```

---

## 📋 Checklist de Implementación

### Fase 1: Setup Básico
- [ ] Configurar proyecto Firebase
- [ ] Habilitar Firestore y Storage
- [ ] Instalar dependencias
- [ ] Configurar credenciales Firebase Admin
- [ ] Crear reglas de seguridad Firestore
- [ ] Implementar servicio básico con HuggingFace

### Fase 2: Integración Múltiple
- [ ] Agregar Pollinations como fallback
- [ ] Implementar sistema de cache con Firestore
- [ ] Crear API endpoints
- [ ] Configurar Firebase Storage Rules
- [ ] Agregar manejo de errores

### Fase 3: Optimización
- [ ] Integrar Replicate para cartas premium
- [ ] Implementar sistema de batch generation
- [ ] Configurar índices compuestos en Firestore
- [ ] Agregar analytics con Firebase Analytics
- [ ] Optimizar performance

### Fase 4: Testing y Deployment
- [ ] Escribir tests unitarios
- [ ] Configurar reglas de seguridad
- [ ] Deploy a Vercel con variables Firebase
- [ ] Configurar monitoreo Firebase
- [ ] Monitorear métricas

---

**Documento técnico completo para integración con Cursor IDE**  
**Versión:** 1.0.0 | **Última actualización:** 2025-05-27