import { NextRequest, NextResponse } from 'next/server';
import { dynamicCardGenerator } from '@/lib/services/dynamicCardGenerator';
import type { CardCategory, CardRarity } from '@/types/dynamicCards';

interface DynamicCardGenerationRequest {
  category: CardCategory;
  rarity: CardRarity;
  theme?: string;
  educationalFocus?: string;
  ageGroup?: string;
  count?: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎴 Dynamic Card Generation API called');
    const body: DynamicCardGenerationRequest = await request.json();
    
    // Validation
    const validCategories: CardCategory[] = ['aritmética', 'álgebra', 'geometría', 'lógica', 'estadística'];
    const validRarities: CardRarity[] = ['común', 'raro', 'épico', 'legendario'];
    
    if (!body.category || !validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }
    
    if (!body.rarity || !validRarities.includes(body.rarity)) {
      return NextResponse.json(
        { error: `Invalid rarity. Must be one of: ${validRarities.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Limit count to prevent abuse
    if (body.count && (body.count < 1 || body.count > 5)) {
      return NextResponse.json(
        { error: 'Count must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    console.log(`🎯 Generating dynamic cards: ${body.category}/${body.rarity} (${body.count || 1} cards)`);
    console.log(`🎨 Theme: ${body.theme || 'default'}`);
    console.log(`📚 Educational Focus: ${body.educationalFocus || 'general'}`);
    
    // Generate cards using AI
    const generationRequest = {
      category: body.category,
      rarity: body.rarity,
      count: body.count || 1,
      ...(body.theme && { theme: body.theme }),
      ...(body.educationalFocus && { educationalFocus: body.educationalFocus }),
      ...(body.ageGroup && { ageGroup: body.ageGroup })
    };
    
    const result = await dynamicCardGenerator.generateCards(generationRequest);
    
    if (!result.success) {
      console.error('❌ Dynamic generation failed:', result.error);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Card generation failed',
          fallback_available: true
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ Successfully generated ${result.cards?.length || 0} dynamic cards`);
    
    return NextResponse.json({
      success: true,
      cards: result.cards,
      generation_metadata: result.generation_metadata,
      message: `Generated ${result.cards?.length || 0} dynamic card(s)`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🚨 Dynamic card generation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Dynamic card generation service failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Dynamic Card Generation API is operational',
    supported_categories: ['aritmética', 'álgebra', 'geometría', 'lógica', 'estadística'],
    supported_rarities: ['común', 'raro', 'épico', 'legendario'],
    max_count_per_request: 5,
    features: [
      'AI-generated card names and descriptions',
      'Dynamic flavor text and lore',
      'Educational theme integration',
      'Art prompt generation',
      'Balanced stats based on rarity'
    ],
    example_request: {
      category: 'logic',
      rarity: 'epic',
      theme: 'Academia de Cristales Mágicos',
      educationalFocus: 'Resolución de patrones complejos',
      ageGroup: '12-16 años',
      count: 1
    }
  });
} 