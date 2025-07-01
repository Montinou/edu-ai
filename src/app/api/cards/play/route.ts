import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/config';
import type { 
  ProblemRequest, 
  PlayerContext, 
  GameContext, 
  CardCategory, 
  ProblemTypeCode,
  CardRarity
} from '@/types/dynamicCards';

interface CardPlayRequest {
  cardId: string;
  userId: string;
  gameContext?: GameContext;
}

interface CardWithProblemType {
  id: string;
  name: string;
  rarity: CardRarity;
  base_power: number;
  category: CardCategory;
  problem_type_id: number;
  problem_code: ProblemTypeCode;
  problem_category: CardCategory;
  problem_difficulty_base: number;
  level_range: number[];
  problem_type: ProblemTypeCode;
  problem_type_metadata: {
    id: number;
    name_es: string;
    name_en: string;
    description_es: string;
    description_en: string;
    difficulty_base: number;
    icon: string;
    color_hex: string;
  };
}

// Helper function to map database category to CardCategory
function mapCategoryFromDB(dbCategory: string): CardCategory {
  const categoryMap: Record<string, CardCategory> = {
    'arithmetic': 'aritmética',
    'aritmética': 'aritmética',
    'math': 'aritmética',
    'algebra': 'álgebra',
    'álgebra': 'álgebra',
    'geometry': 'geometría',
    'geometría': 'geometría',
    'logic': 'lógica',
    'lógica': 'lógica',
    'statistics': 'estadística',
    'estadística': 'estadística'
  };
  return categoryMap[dbCategory] || 'aritmética';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎴 Card play API called');
    console.log('📡 Request headers:', {
      'content-type': request.headers.get('content-type'),
      'user-agent': request.headers.get('user-agent'),
      method: request.method,
      url: request.url
    });

    const rawBody = await request.text();
    console.log('📥 Raw request body:', rawBody);
    
    let body: CardPlayRequest;
    try {
      body = JSON.parse(rawBody);
      console.log('✅ Parsed request body successfully:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Detailed validation logging
    console.log('🔍 Request validation:', {
      hasCardId: !!body.cardId,
      cardIdType: typeof body.cardId,
      cardIdValue: body.cardId,
      hasUserId: !!body.userId,
      userIdType: typeof body.userId,
      userIdValue: body.userId,
      hasGameContext: !!body.gameContext
    });
    
    // Validation
    if (!body.cardId || !body.userId) {
      console.error('❌ Missing required fields:', { 
        cardId: body.cardId, 
        cardIdPresent: !!body.cardId,
        userId: body.userId,
        userIdPresent: !!body.userId
      });
      return NextResponse.json(
        { error: 'Missing cardId or userId' },
        { status: 400 }
      );
    }

    console.log(`🎴 Playing card ${body.cardId} for user ${body.userId}`);

    // 1. Get card information with problem type data
    console.log('🔍 Step 1: Getting card data...');
    const cardData = await getCardWithProblemType(body.cardId);
    if (!cardData) {
      console.error('❌ Card not found:', body.cardId);
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    console.log('✅ Card data retrieved:', { 
      name: cardData.name, 
      category: cardData.problem_category, 
      problemType: cardData.problem_code 
    });

    // 2. Get user's learning profile for this category
    console.log('🔍 Step 2: Getting user learning profile...');
    const playerContext = await getUserLearningProfile(body.userId, cardData.problem_category);
    console.log('✅ Player context retrieved:', { 
      level: playerContext.currentLevel, 
      accuracy: playerContext.accuracy 
    });

    // 3. Determine dynamic difficulty based on user profile and card (IMPROVED)
    console.log('🔍 Step 3: Calculating adaptive difficulty...');
    const adaptiveDifficulty = calculateAdaptiveDifficulty(cardData, playerContext);
    console.log('✅ Adaptive difficulty calculated:', adaptiveDifficulty);

    // 4. Build request for dynamic problem generation
    console.log('🔍 Step 4: Building problem request...');
    const problemRequest: ProblemRequest = {
      category: cardData.problem_category,
      problem_type: cardData.problem_code,
      difficulty: adaptiveDifficulty,
      playerContext,
      gameContext: body.gameContext || {
        battlePhase: 'early' as const, // Start easier
        cardsPlayed: 0,
        timeRemaining: 300,
        opponentType: 'training_dummy',
        playerHP: 100,
        opponentHP: 100,
        difficulty_preference: 'practice' as const // Changed from 'easy' to valid value
      },
      cardInfo: {
        id: cardData.id,
        name: cardData.name,
        rarity: cardData.rarity,
        base_power: cardData.base_power,
        problem_type_id: cardData.problem_type_id
      }
    };
    console.log('✅ Problem request built:', {
      category: problemRequest.category,
      problem_type: problemRequest.problem_type,
      difficulty: problemRequest.difficulty
    });

    // 5. Generate dynamic problem using our improved service directly
    console.log('🔍 Step 5: Generating dynamic problem...');
    
    try {
      // Get the base URL from the request
      const baseUrl = request.url.replace(/\/api\/cards\/play.*$/, '');
      
      // Call the dynamic problem generation API endpoint
      const problemResponse = await fetch(`${baseUrl}/api/ai/generate-dynamic-problem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemRequest),
      });

      if (!problemResponse.ok) {
        throw new Error(`Problem generation API failed with status: ${problemResponse.status}`);
      }

      const generationResult = await problemResponse.json();

      if (!generationResult.success || !generationResult.problem) {
        console.error('❌ Problem generation failed:', generationResult.error);
        throw new Error(`Problem generation failed: ${generationResult.error}`);
      }

      const generatedProblem = generationResult.problem;
      const damageCalculation = generationResult.damage_calculation;
      
      console.log('✅ Problem generated successfully:', {
        success: generationResult.success,
        problemText: generatedProblem.problem_text?.substring(0, 100) + '...',
        tags: generatedProblem.topic_tags,
        difficulty: generatedProblem.difficulty_actual
      });

      // 6. Record that this card was played
      console.log('🔍 Step 6: Recording card play...');
      await recordCardPlay(body.userId, body.cardId, generatedProblem.id);
      console.log('✅ Card play recorded');

      // 7. Return response with generated problem
      console.log('🔍 Step 7: Building response...');
      const response = {
        success: true,
        card: cardData,
        problem: generatedProblem,
        damage_calculation: damageCalculation,
        session_data: {
          card_id: body.cardId,
          user_id: body.userId,
          problem_id: generatedProblem.id,
          adaptive_difficulty: adaptiveDifficulty,
          player_context_snapshot: playerContext,
          generated_at: new Date().toISOString(),
          // Include problem details for solve-problem endpoint
          problem_text: generatedProblem.problem_text,
          correct_answer: generatedProblem.correct_answer,
          category: generatedProblem.category,
          problem_type: generatedProblem.problem_type,
          difficulty: adaptiveDifficulty,
          estimated_time: generatedProblem.estimated_time,
          explanation: generatedProblem.explanation,
          hints: generatedProblem.hints
        },
        metadata: {
          revolutionVersion: '1.0.0',
          aiGenerated: true,
          personalizedFor: body.userId,
          basedOnProfile: true,
          difficulty_capped_from: generationResult.generation_metadata?.difficulty_capped_from
        }
      };

      console.log('🎉 Card play completed successfully');
      return NextResponse.json(response);
    } catch (generationError) {
      console.error('🚨 Generation error details:', generationError);
      throw generationError;
    }

  } catch (error) {
    console.error('🚨 Card play error:', error);
    console.error('🚨 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('🚨 Error type:', typeof error);
    console.error('🚨 Error constructor:', error?.constructor?.name);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to play card',
      details: error instanceof Error ? error.stack : 'Unknown error type',
      fallback_available: false,
      timestamp: new Date().toISOString(),
      errorType: typeof error,
      errorConstructor: error?.constructor?.name
    }, { status: 500 });
  }
}

async function getCardWithProblemType(cardId: string): Promise<CardWithProblemType | null> {
  try {
    console.log(`🎮 Loading card ${cardId} with problem type...`);
    
    const supabase = createSupabaseServerClient();
    
    // Get card with problem type information via JOIN
    const { data, error } = await supabase
      .from('cards')
      .select(`
        *,
        cards_problem_types!cards_problem_type_id_fkey(
          id,
          name_es,
          name_en,
          description_es,
          description_en,
          difficulty_base,
          icon,
          color_hex
        )
      `)
      .eq('id', cardId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('❌ Database error:', error);
      return null;
    }

    if (!data) {
      console.error('❌ Card not found:', cardId);
      return null;
    }

    console.log('📝 Raw card data:', JSON.stringify(data, null, 2));

    // Handle null problem_type_id safely
    const problemTypeData = data.cards_problem_types;
    const problemNameEs = problemTypeData?.name_es || 'problemas_basicos';
    const cardCategory = mapCategoryFromDB(data.category || 'arithmetic');
    
    const cardWithProblemType: CardWithProblemType = {
      id: data.id,
      name: data.name,
      rarity: (data.rarity || 'common') as CardRarity,
      base_power: data.attack_power || 30,
      category: cardCategory,
      problem_type_id: data.problem_type_id || 1,
      problem_code: problemNameEs as ProblemTypeCode,
      problem_category: cardCategory,
      problem_difficulty_base: data.difficulty_level || 3,
      level_range: [data.difficulty_level || 1, (data.difficulty_level || 1) + 2],
      problem_type: problemNameEs as ProblemTypeCode,
      // Use actual database data with null checks
      problem_type_metadata: {
        id: problemTypeData?.id || 1,
        name_es: problemTypeData?.name_es || 'problemas_basicos',
        name_en: problemTypeData?.name_en || 'basic_problems',
        description_es: problemTypeData?.description_es || `Problemas de ${problemNameEs}`,
        description_en: problemTypeData?.description_en || `${problemNameEs} problems`,
        difficulty_base: problemTypeData?.difficulty_base || 3,
        icon: problemTypeData?.icon || '🎓',
        color_hex: problemTypeData?.color_hex || '#3B82F6'
      }
    };

    console.log(`✅ Successfully mapped card: ${data.name} -> ${problemNameEs} (${cardCategory})`);
    return cardWithProblemType;

  } catch (error) {
    console.error(`❌ Error loading card ${cardId}:`, error);
    return null;
  }
}

async function getUserLearningProfile(userId: string, category: CardCategory): Promise<PlayerContext> {
  try {
    // Get user's learning profile for this category
    const supabase = createSupabaseServerClient();
    const { data: profile } = await supabase
      .from('player_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    // Get recent problem history for this user/category
    const { data: recentProblems } = await supabase
      .from('problem_history')
      .select('problem_type, is_correct, response_time')
      .eq('user_id', userId)
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(10);

    // Analyze recent performance
    const recentMistakes: ProblemTypeCode[] = [];
    const strengths: ProblemTypeCode[] = [];
    let totalResponseTime = 0;
    let correctCount = 0;

    if (recentProblems && recentProblems.length > 0) {
      recentProblems.forEach((problem: any) => {
        totalResponseTime += problem.response_time;
        if (problem.is_correct) {
          correctCount++;
          strengths.push(problem.problem_type as ProblemTypeCode);
        } else {
          recentMistakes.push(problem.problem_type as ProblemTypeCode);
        }
      });
    }

    // Better default values for demo/new users
    const averageResponseTime = recentProblems?.length ? totalResponseTime / recentProblems.length : 30000; // 30 seconds default
    const accuracy = recentProblems?.length ? correctCount / recentProblems.length : 0.7; // 70% accuracy default
    const skillLevel = profile?.skill_level || 3; // Lower skill level default for easier problems
    const totalAttempts = profile?.total_attempts || 0;

    // Default demo context for better experience
    const playerContext: PlayerContext = {
      level: skillLevel,
      recentMistakes: [...new Set(recentMistakes)].slice(0, 3), // Unique, max 3
      strengths: [...new Set(strengths)].slice(0, 3), // Unique, max 3
      currentLevel: skillLevel,
      averageResponseTime,
      accuracy,
      sessionProblemsCount: totalAttempts,
      weakCategories: [], // Start empty for new users
      strongCategories: []
    };

    console.log(`👤 User profile for ${userId}/${category}: level=${skillLevel}, accuracy=${(accuracy*100).toFixed(1)}%, avgTime=${Math.round(averageResponseTime/1000)}s`);
    
    return playerContext;

  } catch (error) {
    console.error('Error getting user learning profile:', error);
    
    // Fallback to robust default values for demo/error cases
    console.log(`🔄 Using fallback profile for ${userId}/${category}`);
    
    return {
      level: 3, // Lower level
      recentMistakes: [],
      strengths: [],
      currentLevel: 3,
      averageResponseTime: 30000, // 30 seconds
      accuracy: 0.7, // 70% accuracy
      sessionProblemsCount: 0,
      weakCategories: [],
      strongCategories: []
    };
  }
}

// IMPROVED: More conservative difficulty calculation for student-friendly problems
function calculateAdaptiveDifficulty(card: CardWithProblemType, playerContext: PlayerContext): number {
  const baseDifficulty = card.problem_difficulty_base;
  const playerLevel = playerContext.currentLevel;
  const accuracy = playerContext.accuracy;
  
  // Start with significantly lower base difficulty for more accessible problems
  let adaptiveDifficulty = Math.max(1, baseDifficulty - 2); // Reduce by 2 instead of 1
  
  // Much more conservative adjustments based on player skill level
  const skillAdjustment = (playerLevel - 3) * 0.2; // ±1.4 max adjustment (even smaller)
  adaptiveDifficulty += skillAdjustment;
  
  // More conservative accuracy adjustments
  if (accuracy > 0.9) {
    adaptiveDifficulty += 0.3; // Very small increase for high performers
  } else if (accuracy > 0.8) {
    // No change for good performers
  } else if (accuracy < 0.5) {
    adaptiveDifficulty -= 2.0; // Significant reduction for struggling players
  } else if (accuracy < 0.7) {
    adaptiveDifficulty -= 1.0; // Moderate reduction for below-average performers
  }
  
  // Check if this problem type is in recent mistakes
  if (playerContext.recentMistakes && playerContext.recentMistakes.indexOf(card.problem_code) !== -1) {
    adaptiveDifficulty = Math.max(1, adaptiveDifficulty - 2.0); // Make much easier
  }
  
  // Ensure difficulty is within bounds and cap at very reasonable levels for students
  const finalDifficulty = Math.max(1, Math.min(4, Math.round(adaptiveDifficulty))); // Cap at 4 instead of 6
  
  console.log(`🎯 Difficulty calculation: base=${baseDifficulty}, player_level=${playerLevel}, accuracy=${(accuracy*100).toFixed(1)}%, final=${finalDifficulty} (max 4)`);
  
  return finalDifficulty;
}

async function recordCardPlay(userId: string, cardId: string, problemId: string): Promise<void> {
  try {
    console.log(`📊 Recording card play for ${userId}: ${cardId}`);
    
    // For demo users, just log the action without database operations
    if (userId.startsWith('demo-user')) {
      console.log(`🎯 Demo mode: would record card play - ${cardId} → ${problemId}`);
      return;
    }

    // Get current times_used value and increment it
    const supabase = createSupabaseServerClient();
    const { data: currentCard } = await supabase
      .from('user_cards')
      .select('times_used')
      .eq('user_id', userId)
      .eq('card_id', cardId)
      .single();
    
    const newTimesUsed = (currentCard?.times_used || 0) + 1;
    
    // Update card usage statistics
    await supabase
      .from('user_cards')
      .update({
        times_used: newTimesUsed,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('card_id', cardId);
      
    console.log(`📊 Recorded card play: ${cardId} → ${problemId}`);
  } catch (error) {
    console.error('Failed to record card play:', error);
    console.log(`🔄 Continuing without recording for user ${userId}`);
    // Don't throw - this is not critical for game flow
  }
}

// GET endpoint for testing and debugging
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: 'Minimal test passed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Minimal test failed'
    }, { status: 500 });
  }
}