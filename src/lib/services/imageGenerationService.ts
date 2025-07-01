import { HfInference } from '@huggingface/inference';
// @ts-ignore - Replicate doesn't have official TypeScript support
import Replicate from 'replicate';
import crypto from 'crypto';
import sharp from 'sharp';

import {
  ProviderName,
  ImageCardType,
  ImageMathType,
  ImageLogicType,
  ImageCardRarity,
  PromptConfig,
  GenerationResult,
  CachedImage,
} from '../../types/imageGeneration';

import { PROMPT_TEMPLATES, getRandomPrompt } from '../../constants/imagePrompts';

export class ImageGenerationService {
  private hf: HfInference | null = null;
  private replicate: Replicate | null = null;
  private cache: Map<string, CachedImage> = new Map();
  private startTime: number = 0;

  constructor() {
    // Initialize HuggingFace if API key is available
    if (process.env.HUGGINGFACE_API_KEY) {
      this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
    }
    
    // Initialize Replicate if API key is available
    if (process.env.REPLICATE_API_TOKEN) {
      this.replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
    }
  }

  /**
   * Genera una imagen de carta basada en el tipo y rareza
   */
  async generateCardImage(
    cardType: ImageCardType,
    mathType: ImageMathType | ImageLogicType,
    rarity: ImageCardRarity,
    customPrompt?: string
  ): Promise<GenerationResult> {
    this.startTime = Date.now();
    
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
    cardType: ImageCardType,
    mathType: ImageMathType | ImageLogicType,
    rarity: ImageCardRarity,
    customPrompt?: string
  ): PromptConfig {
    const basePrompt = customPrompt || getRandomPrompt(cardType, mathType);
    
    // Map Spanish rarity to English for template access
    const rarityMap: Record<ImageCardRarity, keyof typeof PROMPT_TEMPLATES.rarityModifiers> = {
      'común': 'common',
      'raro': 'rare', 
      'épico': 'epic',
      'legendario': 'legendary'
    };
    
    const fullPrompt = [
      PROMPT_TEMPLATES.baseStyle,
      basePrompt,
      PROMPT_TEMPLATES.rarityModifiers[rarityMap[rarity]],
      PROMPT_TEMPLATES.qualityModifiers
    ].join(', ');

    return {
      prompt: fullPrompt,
      negativePrompt: PROMPT_TEMPLATES.negativePrompt,
      width: 512,
      height: 768,
      steps: rarity === 'legendario' ? 30 : 20,
      cfgScale: 7,
      seed: Math.floor(Math.random() * 1000000)
    };
  }

  /**
   * Selecciona el proveedor óptimo basado en rareza y disponibilidad
   */
  private selectProvider(rarity: ImageCardRarity): ProviderName {
    // Legendary and Epic cards use premium providers when available
    if ((rarity === 'legendario' || rarity === 'épico') && this.replicate) {
      return 'replicate';
    }
    
    // For common/rare cards, use free providers
    // Check HuggingFace rate limit first
    if (this.hf && this.checkRateLimit('huggingface')) {
      return 'huggingface';
    }
    
    // Fallback to Pollinations
    return 'pollinations';
  }

  /**
   * Selecciona proveedor de respaldo
   */
  private selectFallbackProvider(originalProvider: ProviderName): ProviderName | null {
    if (originalProvider === 'huggingface') {
      return 'pollinations';
    }
    if (originalProvider === 'pollinations' && this.hf) {
      return 'huggingface';
    }
    if (originalProvider === 'replicate') {
      return 'huggingface';
    }
    return null;
  }

  /**
   * Genera imagen con el proveedor especificado
   */
  private async generateWithProvider(provider: ProviderName, config: PromptConfig): Promise<GenerationResult> {
    switch (provider) {
      case 'huggingface':
        return this.generateWithHuggingFace(config);
      case 'pollinations':
        return this.generateWithPollinations(config);
      case 'replicate':
        return this.generateWithReplicate(config);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Genera imagen usando HuggingFace Inference API
   */
  private async generateWithHuggingFace(config: PromptConfig): Promise<GenerationResult> {
    if (!this.hf) {
      throw new Error('HuggingFace client not initialized');
    }

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

    // Handle response - HuggingFace returns a Blob
    const imageBuffer = await (response as unknown as Blob).arrayBuffer();
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
    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }
    
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
    if (!this.replicate) {
      throw new Error('Replicate client not initialized');
    }

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
   * Sube la imagen a Supabase Storage
   */
  private async uploadToStorage(imageBuffer: Buffer, provider: string): Promise<string> {
    try {
      // Import storage service
      const { storageService } = await import('./supabaseStorageService');
      
      const result = await storageService.uploadGeneratedImage(
        imageBuffer,
        provider,
        `Generated by ${provider} at ${new Date().toISOString()}`
      );

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to upload to storage');
      }

      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  }

  /**
   * Sistema de cache con persistencia en Supabase
   */
  private async getCachedImage(cacheKey: string): Promise<CachedImage | null> {
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.timestamp < 86400000) { // 24 hours
        return cached;
      }
    }

    // TEMPORARILY DISABLED: Supabase cache table check
    // TODO: Fix image_cache table structure and RLS policies
    console.log('🔄 Cache check: Using memory cache only (Supabase cache disabled)');
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

    // TEMPORARILY DISABLED: Supabase cache table storage
    // TODO: Fix image_cache table structure and RLS policies
    console.log('💾 Cache: Stored in memory only (Supabase cache disabled)');
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
   * Verifica límites de tasa de API
   */
  private checkRateLimit(_provider: ProviderName): boolean {
    // Implementar lógica de rate limiting
    // Por ahora, retorna true
    return true;
  }

  /**
   * Retorna imagen placeholder en caso de fallo
   */
  private getPlaceholderImage(cardType: ImageCardType, rarity: ImageCardRarity): GenerationResult {
    return {
      success: false,
      imageUrl: `/images/placeholder-cards/${cardType}-${rarity}.jpg`,
      cached: false,
      provider: 'placeholder',
      cost: 0,
      error: 'Generation failed, using placeholder'
    };
  }
}

// Export singleton instance
export const imageGenerationService = new ImageGenerationService(); 