import { NextRequest, NextResponse } from 'next/server';
import { imageGenerationService } from '../../../../lib/services/imageGenerationService';
import { ImageCardType, ImageMathType, ImageLogicType, ImageCardRarity, ImageGenerationConfig } from '../../../../types/imageGeneration';

interface BatchRequest {
  cards: ImageGenerationConfig[];
  maxConcurrent?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();
    const { cards, maxConcurrent = 3 } = body;

    // Validation
    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid cards array' },
        { status: 400 }
      );
    }

    if (cards.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 cards can be generated in a batch' },
        { status: 400 }
      );
    }

    // Validate each card configuration
    const validCardTypes: ImageCardType[] = ['math', 'logic', 'special'];
    const validRarities: ImageCardRarity[] = ['común', 'raro', 'épico', 'legendario'];
    const validMathTypes = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'algebra'];
    const validLogicTypes = ['pattern', 'deduction', 'classification', 'strategy', 'sequence', 'spatial', 'verbal'];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (!card.cardType || !card.rarity) {
        return NextResponse.json(
          { error: `Card ${i + 1}: cardType and rarity are required` },
          { status: 400 }
        );
      }

      if (!validCardTypes.includes(card.cardType)) {
        return NextResponse.json(
          { error: `Card ${i + 1}: Invalid cardType. Must be one of: ${validCardTypes.join(', ')}` },
          { status: 400 }
        );
      }

      if (!validRarities.includes(card.rarity)) {
        return NextResponse.json(
          { error: `Card ${i + 1}: Invalid rarity. Must be one of: ${validRarities.join(', ')}` },
          { status: 400 }
        );
      }

      if (card.mathType) {
        if (card.cardType === 'math' && !validMathTypes.includes(card.mathType as string)) {
          return NextResponse.json(
            { error: `Card ${i + 1}: Invalid mathType for math cards. Must be one of: ${validMathTypes.join(', ')}` },
            { status: 400 }
          );
        }
        
        if (card.cardType === 'logic' && !validLogicTypes.includes(card.mathType as string)) {
          return NextResponse.json(
            { error: `Card ${i + 1}: Invalid mathType for logic cards. Must be one of: ${validLogicTypes.join(', ')}` },
            { status: 400 }
          );
        }
      }
    }

    console.log(`Starting batch generation for ${cards.length} cards with max concurrency ${maxConcurrent}`);

    // Process cards in controlled batches to avoid overwhelming the APIs
    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < cards.length; i += maxConcurrent) {
      const batch = cards.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (card, index) => {
        try {
          console.log(`Generating card ${i + index + 1}/${cards.length}: ${card.cardType}-${card.mathType}-${card.rarity}`);
          
          const result = await imageGenerationService.generateCardImage(
            card.cardType,
            card.mathType as ImageMathType | ImageLogicType,
            card.rarity,
            card.customPrompt
          );

          return {
            index: i + index,
            success: true,
            result
          };
        } catch (error) {
          console.error(`Failed to generate card ${i + index + 1}:`, error);
          return {
            index: i + index,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, batchIndex) => {
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            results.push({
              index: result.value.index,
              ...result.value.result
            });
          } else {
            errors.push({
              index: result.value.index,
              error: result.value.error
            });
          }
        } else {
          errors.push({
            index: i + batchIndex,
            error: result.reason
          });
        }
      });

      // Add a small delay between batches to be respectful to APIs
      if (i + maxConcurrent < cards.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.length;
    const failed = errors.length;
    const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);

    console.log(`Batch generation completed: ${successful} successful, ${failed} failed, total cost: $${totalCost.toFixed(4)}`);

    return NextResponse.json({
      successful,
      failed,
      totalCards: cards.length,
      totalCost,
      results: results.map(r => ({
        success: r.success,
        imageUrl: r.imageUrl,
        provider: r.provider,
        cached: r.cached,
        cost: r.cost,
        processingTime: r.processingTime
      })),
      errors,
      summary: {
        byProvider: results.reduce((acc, r) => {
          acc[r.provider] = (acc[r.provider] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        cached: results.filter(r => r.cached).length,
        avgProcessingTime: results.length > 0 
          ? results.reduce((sum, r) => sum + (r.processingTime || 0), 0) / results.length 
          : 0
      }
    });

  } catch (error) {
    console.error('Batch generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Batch generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 