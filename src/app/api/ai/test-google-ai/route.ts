import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/services/aiService';

export async function GET() {
  try {
    // Test Google AI with a simple math problem
    const testParams = {
      difficulty: 2 as const,
      operation: 'addition',
      studentLevel: 3,
      context: 'test',
      timeLimit: 60,
      includeHints: true,
    };

    const problem = await aiService.generateMathProblem(testParams);

    return NextResponse.json({
      success: true,
      message: 'Google AI integration working correctly',
      testProblem: problem,
      service: 'Google AI (Gemini)',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Google AI test failed:', error);

    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        service: 'Google AI (Gemini)',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Test custom prompt with Google AI
    const testParams = {
      difficulty: 3 as const,
      operation: prompt,
      studentLevel: 5,
      context: 'custom test',
      timeLimit: 90,
      includeHints: true,
    };

    const problem = await aiService.generateMathProblem(testParams);

    return NextResponse.json({
      success: true,
      message: 'Custom prompt test successful',
      testProblem: problem,
      service: 'Google AI (Gemini)',
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Custom prompt test failed:', error);

    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        service: 'Google AI (Gemini)',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
} 