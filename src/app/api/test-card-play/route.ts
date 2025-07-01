import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test calling the generate-dynamic-problem endpoint
    const testRequest = {
      category: 'arithmetic',
      problem_type: 'multiplication',
      difficulty: 3,
      playerContext: {
        level: 5,
        currentLevel: 5,
        recentMistakes: [],
        strengths: [],
        averageResponseTime: 25000,
        accuracy: 0.75,
        sessionProblemsCount: 0,
        weakCategories: [],
        strongCategories: []
      },
      gameContext: {
        battlePhase: 'early',
        cardsPlayed: 0,
        timeRemaining: 300,
        opponentType: 'training_dummy',
        playerHP: 100,
        opponentHP: 100,
        difficulty_preference: 'adaptive'
      },
      cardInfo: {
        id: 'card-001',
        name: 'Dragón Aritmético',
        rarity: 'epic',
        base_power: 45,
        problem_type_id: 1
      }
    };

    const response = await fetch('http://localhost:3000/api/ai/generate-dynamic-problem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test endpoint working with API call',
      apiCallSuccess: result.success,
      problemGenerated: !!result.problem,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'POST test working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'POST test failed'
    }, { status: 500 });
  }
} 