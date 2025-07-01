import { NextRequest, NextResponse } from 'next/server';
import { getAIService } from '@/lib/services';
import type { MathProblemParams } from '@/types/ai';

export async function POST(request: NextRequest) {
  try {
    // Get the configured AI service (Google AI or Vercel AI SDK)
    const aiService = await getAIService();
    
    // Parsear el cuerpo de la request
    const body = await request.json();
    
    // Validar parámetros requeridos
    const { difficulty, operation, studentLevel } = body;
    
    if (!difficulty || !operation || !studentLevel) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['difficulty', 'operation', 'studentLevel']
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

    // Preparar parámetros para el servicio de IA
    const params: MathProblemParams = {
      difficulty: difficulty as 1 | 2 | 3 | 4 | 5,
      operation,
      studentLevel,
      previousProblems: body.previousProblems || [],
      context: body.context || 'general',
      timeLimit: body.timeLimit || 60,
      includeHints: body.includeHints !== false, // Por defecto true
    };

    // Generar problema usando el servicio de IA configurado
    const problem = await aiService.generateMathProblem(params);

    // Get AI provider information
    const aiProvider = process.env.AI_PROVIDER || 'google';
    let aiServiceName;
    
    switch (aiProvider.toLowerCase()) {
      case 'vercel':
      case 'openai':
        aiServiceName = 'OpenAI via Vercel AI SDK (GPT-4o)';
        break;
      case 'huggingface':
      case 'hf':
        aiServiceName = 'Hugging Face (Mixtral-8x7B-Instruct)';
        break;
      case 'groq':
        aiServiceName = 'Groq (Mixtral-8x7B-32768)';
        break;
      case 'google':
      case 'googleai':
      default:
        aiServiceName = 'Google AI (Gemini 1.5 Flash)';
        break;
    }

    // Agregar metadata adicional
    const response = {
      problem,
      metadata: {
        generatedAt: new Date().toISOString(),
        difficulty: params.difficulty,
        operation: params.operation,
        estimatedTime: Math.max(15, Math.min(120, difficulty * 20)), // 15-120 segundos
        concepts: [params.operation, `level-${studentLevel}`],
        aiService: aiServiceName,
      }
    };

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('Error generating math problem:', error);

    // Manejar errores específicos de IA
    if (error.code) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          retryable: error.retryable 
        },
        { status: error.retryable ? 429 : 500 }
      );
    }

    // Error genérico
    return NextResponse.json(
      { error: 'Failed to generate math problem', details: error.message },
      { status: 500 }
    );
  }
}

// Endpoint GET para obtener información sobre el servicio
export async function GET() {
  // Determine the AI provider based on environment configuration
  const aiProvider = process.env.AI_PROVIDER || 'google';
  let aiServiceName;
  
  switch (aiProvider.toLowerCase()) {
    case 'vercel':
    case 'openai':
      aiServiceName = 'OpenAI via Vercel AI SDK (GPT-4o)';
      break;
    case 'huggingface':
    case 'hf':
      aiServiceName = 'Hugging Face (Mixtral-8x7B-Instruct)';
      break;
    case 'groq':
      aiServiceName = 'Groq (Mixtral-8x7B-32768)';
      break;
    case 'google':
    case 'googleai':
    default:
      aiServiceName = 'Google AI (Gemini 1.5 Flash)';
      break;
  }

  return NextResponse.json({
    service: 'Math Problem Generator',
    version: '1.0.0',
    aiProvider: aiServiceName,
    supportedOperations: [
      'addition',
      'subtraction', 
      'multiplication',
      'division',
      'fractions',
      'decimals',
      'algebra'
    ],
    difficultyLevels: [1, 2, 3, 4, 5],
    maxStudentLevel: 12,
    features: [
      'Adaptive difficulty',
      'Contextual problems',
      'Multiple choice options',
      'Hints and explanations',
      'Time limits',
      'Problem caching',
      'Spanish-first content',
      'Age-appropriate content (8-12 years)'
    ]
  });
} 