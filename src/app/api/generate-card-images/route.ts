import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { imageGenerationService } from '@/lib/services/imageGenerationService';
import { DatabaseCard } from '@/components/cards/Card';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client with service role for updates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    console.log(supabaseUrl, supabaseServiceKey);
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { cardId, generateAll = false } = await request.json();
    
    if (generateAll) {
      // Generate images for all cards without images
      const { data: cards, error } = await supabaseAdmin
        .from('cards')
        .select('*')
        .is('image_url', null)
        .eq('is_active', true);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      if (!cards || cards.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No cards need image generation'
        });
      }

      const results = [];
      
      // Process cards one by one to avoid overwhelming the APIs
      for (const card of cards) {
        try {
          const result = await generateImageForCard(card, supabaseAdmin);
          results.push(result);
          
          // Small delay between generations
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Failed to generate image for card ${card.id}:`, error);
          results.push({
            cardId: card.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return NextResponse.json({
        success: true,
        results,
        totalProcessed: results.length
      });
    } else if (cardId) {
      // Generate image for specific card
      const { data: card, error } = await supabaseAdmin
        .from('cards')
        .select('*')
        .eq('id', cardId)
        .single();

      if (error) {
        throw new Error(`Card not found: ${error.message}`);
      }

      const result = await generateImageForCard(card, supabaseAdmin);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Either cardId or generateAll=true must be provided'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function generateImageForCard(card: DatabaseCard, supabaseAdmin: SupabaseClient) {
  try {
    console.log(`Generating image for card: ${card.name}`);
    
    // Map database types to image generation types
    const cardType = mapCardType(card.type);
    const mathType = mapMathType(card.problem_type);
    const rarity = card.rarity as 'común' | 'raro' | 'épico' | 'legendario';
    
    // Use existing image prompt or generate one
    const customPrompt = card.image_prompt || generatePromptForCard(card);
    
    // Generate the image
    const imageResult = await imageGenerationService.generateCardImage(
      cardType,
      mathType,
      rarity,
      customPrompt
    );
    
    if (!imageResult.success) {
      throw new Error(imageResult.error || 'Image generation failed');
    }
    
    // Update the card with the image URL
    const { error: updateError } = await supabaseAdmin
      .from('cards')
      .update({
        image_url: imageResult.imageUrl,
        image_prompt: customPrompt
      })
      .eq('id', card.id);
    
    if (updateError) {
      throw new Error(`Failed to update card: ${updateError.message}`);
    }
    
    return {
      cardId: card.id,
      cardName: card.name,
      success: true,
      imageUrl: imageResult.imageUrl,
      provider: imageResult.provider,
      cached: imageResult.cached,
      cost: imageResult.cost
    };
    
  } catch (error) {
    console.error(`Error generating image for card ${card.id}:`, error);
    return {
      cardId: card.id,
      cardName: card.name,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function mapCardType(dbType: string): 'math' | 'logic' | 'special' | 'defense' {
  switch (dbType) {
    case 'attack': return 'math';  // Attack cards are math-focused
    case 'defense': return 'defense';
    case 'special': return 'special';
    case 'support': return 'logic';  // Support cards are logic-focused
    default: return 'math';
  }
}

function mapMathType(dbProblemType: string): 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'pattern' | 'deduction' {
  switch (dbProblemType) {
    case 'addition': return 'addition';
    case 'subtraction': return 'subtraction';
    case 'multiplication': return 'multiplication';
    case 'division': return 'division';
    case 'fractions': return 'fractions';
    case 'patterns': return 'pattern';
    case 'logic': return 'deduction';
    case 'deduction': return 'deduction';
    default: return 'addition';
  }
}

function generatePromptForCard(card: DatabaseCard): string {
  const typeDescriptions = {
    attack: 'fierce warrior with magical weapons',
    defense: 'protective guardian with mystical shields',
    special: 'wise mage with arcane powers',
    support: 'helpful spirit with healing abilities'
  };
  
  const mathDescriptions = {
    addition: 'surrounded by glowing crystals that combine together',
    subtraction: 'wielding powers that separate and protect',
    multiplication: 'commanding multiple magical forces',
    division: 'master of precise magical calculations',
    fractions: 'balancing mystical energies',
    patterns: 'weaving intricate magical symbols',
    logic: 'emanating wise intellect and reason',
    deduction: 'revealing hidden magical truths'
  };
  
  const rarityEffects = {
    común: 'gentle magical aura',
    raro: 'shimmering mystical energy',
    épico: 'powerful arcane emanations',
    legendario: 'overwhelming divine radiance'
  };
  
  return `Anime style magical ${typeDescriptions[card.type as keyof typeof typeDescriptions]} ${mathDescriptions[card.problem_type as keyof typeof mathDescriptions]}, ${rarityEffects[card.rarity as keyof typeof rarityEffects]}, vibrant colors, detailed fantasy art`;
} 