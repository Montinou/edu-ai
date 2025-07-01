import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';
import type { DifficultyLevel, CardType, CardRarity } from '@/types/cards';

export interface GenerateCardParams {
  difficulty: DifficultyLevel;
  cardType: CardType;
  operation?: string; // Para cartas matemáticas
  logicType?: string; // Para cartas de lógica
  studentLevel: number;
  rarity?: CardRarity;
  theme?: string;
  context?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      difficulty,
      cardType,
      operation,
      logicType,
      studentLevel,
      rarity,
      theme = 'fantasy',
      context = 'adventure'
    }: GenerateCardParams = body;

    // Validar parámetros requeridos
    if (!difficulty || !cardType || !studentLevel) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['difficulty', 'cardType', 'studentLevel']
        },
        { status: 400 }
      );
    }

    // Validar rangos
    if (difficulty < 1 || difficulty > 5) {
      return NextResponse.json(
        { error: 'Difficulty must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (studentLevel < 1 || studentLevel > 12) {
      return NextResponse.json(
        { error: 'Student level must be between 1 and 12' },
        { status: 400 }
      );
    }

    // Generar carta completa usando IA
    const generatedCard = await aiService.generateCompleteCard({
      difficulty,
      cardType,
      ...(operation && { operation }),
      ...(logicType && { logicType }),
      studentLevel,
      rarity: rarity || determineRarityByDifficulty(difficulty),
      theme,
      context
    });

    // Agregar metadata adicional
    const response = {
      card: generatedCard,
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty,
        cardType,
        studentLevel,
        aiService: 'Google AI (Gemini 1.5 Flash)',
        generationVersion: '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Error generating complete card:', error);

    if (error && typeof error === 'object' && 'code' in error) {
      const typedError = error as { message: string; code: string; retryable: boolean };
      return NextResponse.json(
        { 
          error: typedError.message,
          code: typedError.code,
          retryable: typedError.retryable 
        },
        { status: typedError.retryable ? 429 : 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate card', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener información sobre el servicio
export async function GET() {
  return NextResponse.json({
    service: 'Complete Card Generator',
    version: '1.0.0',
    aiProvider: 'Google AI (Gemini 1.5 Flash)',
    supportedCardTypes: ['math', 'logic', 'special', 'defense'],
    supportedMathOperations: [
      'addition', 'subtraction', 'multiplication', 'division',
      'fractions', 'decimals', 'algebra'
    ],
    supportedLogicTypes: [
      'pattern', 'deduction', 'classification', 'strategy',
      'sequence', 'spatial', 'verbal'
    ],
    difficultyLevels: [1, 2, 3, 4, 5],
    maxStudentLevel: 12,
    features: [
      'Complete card generation',
      'Problem-power consistency',
      'Difficulty-based balancing',
      'Themed content',
      'Age-appropriate design',
      'Automatic rarity assignment',
      'Spanish-first content',
      'Educational value optimization'
    ]
  });
}

// Función auxiliar para determinar rareza basada en dificultad
function determineRarityByDifficulty(difficulty: DifficultyLevel): CardRarity {
  switch (difficulty) {
    case 1:
    case 2:
      return 'común';
    case 3:
      return 'raro';
    case 4:
      return 'épico';
    case 5:
      return 'legendario';
    default:
      return 'común';
  }
} 