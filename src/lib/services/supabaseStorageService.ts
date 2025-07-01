import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for storage operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface ImageMetadata {
  cardId?: string;
  provider?: string;
  prompt?: string;
  rarity?: string;
  type?: string;
}

export class SupabaseStorageService {
  private readonly CARD_IMAGES_BUCKET = 'cards.images';
  private readonly GENERATED_IMAGES_BUCKET = 'generated-images';
  
  /**
   * Upload card image to Supabase Storage
   */
  async uploadCardImage(
    imageBuffer: Buffer, 
    fileName: string, 
    metadata?: ImageMetadata
  ): Promise<StorageUploadResult> {
    try {
      const filePath = `cards/${fileName}`;
      
      const { error } = await supabaseAdmin.storage
        .from(this.CARD_IMAGES_BUCKET)
        .upload(filePath, imageBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
          metadata: {
            ...metadata,
            uploadedAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(this.CARD_IMAGES_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Storage service error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Upload generated image to cache bucket
   */
  async uploadGeneratedImage(
    imageBuffer: Buffer,
    provider: string,
    prompt: string
  ): Promise<StorageUploadResult> {
    try {
      const timestamp = Date.now();
      const fileName = `${provider}/${timestamp}-${crypto.randomUUID()}.jpg`;
      
      const { error } = await supabaseAdmin.storage
        .from(this.GENERATED_IMAGES_BUCKET)
        .upload(fileName, imageBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '86400', // 24 hours
          metadata: {
            provider,
            prompt: prompt.substring(0, 500), // Truncate long prompts
            generatedAt: new Date().toISOString()
          }
        });

      if (error) {
        return { success: false, error: error.message };
      }

      const { data: publicUrlData } = supabaseAdmin.storage
        .from(this.GENERATED_IMAGES_BUCKET)
        .getPublicUrl(fileName);

      return {
        success: true,
        url: publicUrlData.publicUrl,
        path: fileName
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete image from storage
   */
  async deleteImage(bucket: string, filePath: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([filePath]);

      return !error;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }

  /**
   * Get public URL for existing image
   */
  getPublicUrl(bucket: string, filePath: string): string {
    const { data } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  /**
   * List images in bucket
   */
  async listImages(bucket: string, prefix?: string): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(prefix);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('List error:', error);
      return [];
    }
  }

  /**
   * Check if bucket exists and is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin.storage.listBuckets();
      
      if (error) {
        console.error('Storage connection error:', error);
        return false;
      }

      const cardImagesBucket = data.find(bucket => bucket.id === this.CARD_IMAGES_BUCKET);

      console.log('Available buckets:', data.map(b => b.id));
      console.log('Looking for:', this.CARD_IMAGES_BUCKET, this.GENERATED_IMAGES_BUCKET);

      return !!(cardImagesBucket); // Only check cards.images for now since it exists
    } catch (error) {
      console.error('Storage test error:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    cardImages: number;
    generatedImages: number;
    totalSize: number;
  }> {
    try {
      const [cardImages, generatedImages] = await Promise.all([
        this.listImages(this.CARD_IMAGES_BUCKET),
        this.listImages(this.GENERATED_IMAGES_BUCKET)
      ]);

      return {
        cardImages: cardImages.length,
        generatedImages: generatedImages.length,
        totalSize: 0 // Could calculate total size if needed
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { cardImages: 0, generatedImages: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const storageService = new SupabaseStorageService(); 