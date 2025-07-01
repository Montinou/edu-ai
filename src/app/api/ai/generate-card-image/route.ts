import { NextRequest, NextResponse } from 'next/server';
import { imageGenerationService } from '../../../../lib/services/imageGenerationService';
import { ImageCardType, ImageMathType, ImageLogicType, ImageCardRarity } from '../../../../types/imageGeneration';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardType, mathType, rarity, customPrompt } = body;

    // Validation
    if (!cardType || !rarity) {
      return NextResponse.json(
        { error: 'Missing required parameters: cardType and rarity are required' },
        { status: 400 }
      );
    }

    // Validate cardType
    const validCardTypes: ImageCardType[] = ['math', 'logic', 'special'];
    if (!validCardTypes.includes(cardType)) {
      return NextResponse.json(
        { error: `Invalid cardType. Must be one of: ${validCardTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate rarity
    const validRarities: ImageCardRarity[] = ['común', 'raro', 'épico', 'legendario'];
    if (!validRarities.includes(rarity)) {
      return NextResponse.json(
        { error: `Invalid rarity. Must be one of: ${validRarities.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate mathType if provided
    if (mathType) {
      const validMathTypes = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'algebra'];
      const validLogicTypes = ['pattern', 'deduction', 'classification', 'strategy', 'sequence', 'spatial', 'verbal'];
      
      if (cardType === 'math' && !validMathTypes.includes(mathType)) {
        return NextResponse.json(
          { error: `Invalid mathType for math cards. Must be one of: ${validMathTypes.join(', ')}` },
          { status: 400 }
        );
      }
      
      if (cardType === 'logic' && !validLogicTypes.includes(mathType)) {
        return NextResponse.json(
          { error: `Invalid mathType for logic cards. Must be one of: ${validLogicTypes.join(', ')}` },
          { status: 400 }
        );
      }
    }

    console.log(`Generating image for ${cardType} card with rarity ${rarity}`, {
      mathType,
      customPrompt: customPrompt ? 'provided' : 'none'
    });

    const result = await imageGenerationService.generateCardImage(
      cardType as ImageCardType,
      mathType as ImageMathType | ImageLogicType,
      rarity as ImageCardRarity,
      customPrompt
    );

    // Log the result for debugging
    console.log('Image generation result:', {
      success: result.success,
      provider: result.provider,
      cached: result.cached,
      cost: result.cost,
      processingTime: result.processingTime
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Image generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Image generation failed',
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