import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { 
  DamageCalculation,
  CardCategory,
  ProblemTypeCode
} from '@/types/dynamicCards';

// Helper function to get Supabase client
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

interface SolveProblemRequest {
  problemId: string;
  userId: string;
  cardId: string;
  userAnswer: string;
  responseTime: number; // milliseconds
  hintsUsed: number;
  sessionData: any; // From card play response
}

interface LearningFeedback {
  explanation: string;
  concept_mastered: boolean;
  next_difficulty: number;
  encouragement: string;
  problem_type_progress: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SolveProblemRequest = await request.json();
    
    // Validation
    if (!body.problemId || !body.userId || !body.userAnswer || !body.cardId) {
      return NextResponse.json(
        { error: 'Missing required fields: problemId, userId, userAnswer, cardId' },
        { status: 400 }
      );
    }

    console.log(`🧠 Solving problem ${body.problemId} for user ${body.userId}`);

    // 1. Get the generated problem details to check correctness
    const problemDetails = await getProblemDetails(body.problemId, body.sessionData);
    if (!problemDetails) {
      return NextResponse.json(
        { error: 'Problem not found or expired' },
        { status: 404 }
      );
    }

    // 2. Check if answer is correct
    const isCorrect = checkAnswer(body.userAnswer, problemDetails.correct_answer);
    
    // 3. Calculate damage based on performance
    const damageCalculation = calculateDamage(
      body.sessionData,
      isCorrect,
      body.responseTime,
      body.hintsUsed,
      problemDetails.estimated_time
    );

    // 4. Generate learning feedback
    const learningFeedback = generateLearningFeedback(
      isCorrect,
      problemDetails,
      body.responseTime,
      body.hintsUsed
    );

    // 5. Update user learning profile
    await updateLearningProfile(
      body.userId,
      problemDetails.category,
      problemDetails.problem_type,
      isCorrect,
      body.responseTime,
      damageCalculation.final_damage
    );

    // 6. Record problem result in history
    await recordProblemResult(body, problemDetails, isCorrect, damageCalculation);

    // 7. Return comprehensive response
    const response = {
      success: true,
      is_correct: isCorrect,
      damage_calculation: damageCalculation,
      learning_feedback: learningFeedback,
      session_updated: true,
      correct_answer: problemDetails.correct_answer,
      explanation: problemDetails.explanation,
      performance_metrics: {
        response_time: body.responseTime,
        hints_used: body.hintsUsed,
        accuracy: isCorrect ? 1.0 : 0.0,
        speed_score: calculateSpeedScore(body.responseTime, problemDetails.estimated_time),
        efficiency_score: calculateEfficiencyScore(isCorrect, body.hintsUsed)
      },
      next_recommendations: {
        continue_difficulty: learningFeedback.next_difficulty,
        focus_areas: isCorrect ? [] : [problemDetails.problem_type],
        practice_suggestion: isCorrect ? 'Ready for harder challenges!' : 'Practice similar problems for mastery'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Problem solving error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar la solucion del problema'
    }, { status: 500 });
  }
}

async function getProblemDetails(problemId: string, sessionData: any) {
  // For now, we'll use the session data since problems are generated on-the-fly
  // In a production system, you might want to cache problems in the database
  return {
    id: problemId,
    problem_text: sessionData?.problem_text || '',
    correct_answer: sessionData?.correct_answer || '',
    category: sessionData?.category || 'aritmética',
    problem_type: sessionData?.problem_type || 'suma',
    difficulty: sessionData?.difficulty || 1,
    estimated_time: sessionData?.estimated_time || 30,
    explanation: sessionData?.explanation || 'No hay explicacion disponible',
    hints: sessionData?.hints || []
  };
}

function checkAnswer(userAnswer: string, correctAnswer: string): boolean {
  // Normalize answers for comparison
  const normalizeAnswer = (answer: string) => {
    return answer.toString().trim().toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
      .replace(/[,\.]/g, ''); // Remove commas and dots for number formatting
  };
  
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);
  
  // Check exact match first
  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Check if both are numbers and are mathematically equal
  const userNum = parseFloat(userAnswer);
  const correctNum = parseFloat(correctAnswer);
  
  if (!isNaN(userNum) && !isNaN(correctNum)) {
    return Math.abs(userNum - correctNum) < 0.001; // Allow for small floating point errors
  }
  
  return false;
}

function calculateDamage(
  sessionData: any,
  isCorrect: boolean,
  responseTime: number,
  hintsUsed: number,
  estimatedTime: number
): DamageCalculation {
  const baseDamage = sessionData?.card?.base_power || 30;
  const rarity = sessionData?.card?.rarity || 'común';
  
  // Base multipliers
  const rarityMultipliers = {
    comun: 1.0,
    raro: 1.3,
    épico: 1.6,
    legendario: 2.0
  };
  
  const rarityMultiplier = rarityMultipliers[rarity as keyof typeof rarityMultipliers] || 1.0;
  
  // Accuracy multiplier
  const accuracyMultiplier = isCorrect ? 1.0 : 0.2; // Penalty for wrong answers
  // Speed multiplier (bonus for solving quickly)
  const speedMultiplier = calculateSpeedMultiplier(responseTime, estimatedTime);
  
  // Hint penalty
  const hintPenalty = Math.max(0.5, 1.0 - (hintsUsed * 0.15)); // 15% penalty per hint
  
  // Calculate final damage
  const finalDamage = Math.floor(
    baseDamage * accuracyMultiplier * speedMultiplier * rarityMultiplier * hintPenalty
  );
  
  // Check for critical hit (perfect speed + no hints + correct)
  const criticalHit = isCorrect && hintsUsed === 0 && speedMultiplier >= 1.4;
  const criticalMultiplier = criticalHit ? 1.5 : 1.0;
  
  return {
    base_damage: baseDamage,
    accuracy_multiplier: accuracyMultiplier,
    speed_multiplier: speedMultiplier,
    rarity_multiplier: rarityMultiplier,
    streak_multiplier: 1.0, // TODO: Implement streak tracking
    difficulty_bonus: 0.0, // TODO: Add difficulty bonus
    problem_type_bonus: 0.0, // TODO: Add problem type complexity bonus
    final_damage: Math.floor(finalDamage * criticalMultiplier),
    critical_hit: criticalHit,
    multipliers_applied: {
      accuracy: accuracyMultiplier,
      speed: speedMultiplier,
      rarity: rarityMultiplier,
      streak: 1.0,
      difficulty: 1.0,
      problem_type: 1.0,
      total: accuracyMultiplier * speedMultiplier * rarityMultiplier * criticalMultiplier
    }
  };
}

function calculateSpeedMultiplier(responseTime: number, estimatedTime: number): number {
  const timeRatio = responseTime / (estimatedTime * 1000); // Convert to milliseconds
  
  if (timeRatio <= 0.5) return 1.5; // Very fast
  if (timeRatio <= 0.8) return 1.2; // Fast
  if (timeRatio <= 1.2) return 1.0; // Normal
  if (timeRatio <= 2.0) return 0.8; // Slow
  return 0.6; // Very slow
}

function calculateSpeedScore(responseTime: number, estimatedTime: number): number {
  const speedMultiplier = calculateSpeedMultiplier(responseTime, estimatedTime);
  return Math.round(speedMultiplier * 100);
}

function calculateEfficiencyScore(isCorrect: boolean, hintsUsed: number): number {
  if (!isCorrect) return 0;
  return Math.max(20, 100 - (hintsUsed * 20)); // 20% penalty per hint
}

function generateLearningFeedback(
  isCorrect: boolean,
  problemDetails: any,
  responseTime: number,
  hintsUsed: number
): LearningFeedback {
  const encouragementMessages = {
    perfect: [
      "¡Increíble! Dominas completamente este tipo de problema 🌟",
      "¡Perfecto! Tu rapidez y precisión son excepcionales ⚡",
      "¡Excelente trabajo! Estás listo para desafíos más difíciles 🚀"
    ],
    correct_fast: [
      "¡Muy bien! Resolviste el problema correctamente y rápido 👏",
      "¡Genial! Tu velocidad de cálculo está mejorando mucho ⭐",
      "¡Fantástico! Cada vez eres más eficiente resolviendo problemas 💪"
    ],
    correct_slow: [
      "¡Correcto! Aunque tomó tiempo, la precisión es importante 🎯",
      "¡Bien hecho! La práctica te ayudará a ser más rápido ⏰",
      "¡Correcto! Sigue practicando para ganar velocidad 📈"
    ],
    incorrect: [
      "No te preocupes, los errores nos ayudan a aprender 💡",
      "¡Sigue intentando! Cada problema te hace más fuerte 🌱",
      "¡Ánimo! Revisar la explicación te ayudará mucho 📚"
    ]
  };

  let category: keyof typeof encouragementMessages;
  let conceptMastered = false;
  let nextDifficulty = problemDetails.difficulty;

  if (isCorrect) {
    const speedScore = calculateSpeedScore(responseTime, problemDetails.estimated_time);
    if (speedScore >= 120 && hintsUsed === 0) {
      category = 'perfect';
      conceptMastered = true;
      nextDifficulty = Math.min(10, problemDetails.difficulty + 1);
    } else if (speedScore >= 100) {
      category = 'correct_fast';
      nextDifficulty = Math.min(10, problemDetails.difficulty + 0.5);
    } else {
      category = 'correct_slow';
      // Keep same difficulty
    }
  } else {
    category = 'incorrect';
    nextDifficulty = Math.max(1, problemDetails.difficulty - 0.5);
  }

  const encouragement = encouragementMessages[category][
    Math.floor(Math.random() * encouragementMessages[category].length)
  ];

  return {
    explanation: problemDetails.explanation,
    concept_mastered: conceptMastered,
    next_difficulty: Math.round(nextDifficulty * 2) / 2, // Round to nearest 0.5
    encouragement,
    problem_type_progress: isCorrect ? 0.1 : -0.05 // Small progress increment/decrement
  };
}

async function updateLearningProfile(
  userId: string,
  category: CardCategory,
  problemType: ProblemTypeCode,
  isCorrect: boolean,
  responseTime: number,
  damage: number
): Promise<void> {
  try {
    console.log(`📊 Updating learning profile for ${userId}/${category}`);
    
    // For demo users, just log the action without database operations
    if (userId.startsWith('demo-user')) {
      console.log(`🎯 Demo mode: would update profile - correct: ${isCorrect}, time: ${responseTime}ms, damage: ${damage}`);
      return;
    }

    // Get existing profile or create default
    const supabase = getSupabaseClient();
    const { data: existingProfile } = await supabase
      .from('player_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('category', category)
      .single();

    const totalAttempts = (existingProfile?.total_attempts || 0) + 1;
    const successfulAttempts = (existingProfile?.successful_attempts || 0) + (isCorrect ? 1 : 0);
    const newAccuracy = successfulAttempts / totalAttempts;
    
    // Calculate new average response time
    const existingAvgTime = existingProfile?.average_response_time || 30000;
    const newAvgTime = Math.round(
      (existingAvgTime * (totalAttempts - 1) + responseTime) / totalAttempts
    );

    // Update skill level based on recent performance
    let newSkillLevel = existingProfile?.skill_level || 1.0;
    if (isCorrect) {
      newSkillLevel = Math.min(10.0, newSkillLevel + 0.1);
    } else {
      newSkillLevel = Math.max(1.0, newSkillLevel - 0.05);
    }

    // Update weak/strong topics
    const weakTopics = existingProfile?.weak_topics || [];
    const strongTopics = existingProfile?.strong_topics || [];
    
    if (!isCorrect && !weakTopics.includes(problemType)) {
      weakTopics.push(problemType);
    } else if (isCorrect && weakTopics.includes(problemType)) {
      const index = weakTopics.indexOf(problemType);
      weakTopics.splice(index, 1);
      if (!strongTopics.includes(problemType)) {
        strongTopics.push(problemType);
      }
    }

    // Upsert profile
    await supabase
      .from('player_learning_profiles')
      .upsert({
        user_id: userId,
        category,
        skill_level: newSkillLevel,
        total_attempts: totalAttempts,
        successful_attempts: successfulAttempts,
        average_response_time: newAvgTime,
        last_problem_date: new Date().toISOString(),
        weak_topics: weakTopics,
        strong_topics: strongTopics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,category'
      });

    console.log(`📊 Updated learning profile for ${userId}/${category}: skill=${newSkillLevel.toFixed(1)}, accuracy=${(newAccuracy*100).toFixed(1)}%`);

  } catch (error) {
    console.error('Failed to update learning profile:', error);
    console.log(`🔄 Continuing without profile update for user ${userId}`);
    // Don't throw - this shouldn't break the game flow
  }
}

async function recordProblemResult(
  request: SolveProblemRequest,
  problemDetails: any,
  isCorrect: boolean,
  damageCalculation: DamageCalculation
): Promise<void> {
  try {
    console.log(`📝 Recording problem result for ${request.userId}`);
    
    // For demo users, just log the action without database operations
    if (request.userId.startsWith('demo-user')) {
      console.log(`🎯 Demo mode: would record result - ${request.problemId} → ${isCorrect ? 'correct' : 'incorrect'}`);
      return;
    }

    const supabase = getSupabaseClient();
    await supabase
      .from('problem_history')
      .insert({
        user_id: request.userId,
        category: problemDetails.category,
        problem_type: problemDetails.problem_type,
        problem_text: problemDetails.problem_text,
        correct_answer: problemDetails.correct_answer,
        player_answer: request.userAnswer,
        is_correct: isCorrect,
        response_time: request.responseTime,
        difficulty_level: problemDetails.difficulty,
        card_id: request.cardId,
        base_damage: damageCalculation.base_damage,
        final_damage: damageCalculation.final_damage,
        multipliers: damageCalculation.multipliers_applied,
        battle_context: request.sessionData?.gameContext || {}
      });

    console.log(`📝 Recorded problem result: ${request.problemId} → ${isCorrect ? 'correct' : 'incorrect'}`);

  } catch (error) {
    console.error('Failed to record problem result:', error);
    console.log(`🔄 Continuing without recording for user ${request.userId}`);
    // Don't throw - this shouldn't break the game flow
  }
}

// GET endpoint for service information
export async function GET() {
  return NextResponse.json({
    service: 'Problem Solving & Learning System',
    version: '1.0.0',
    description: 'Processes problem solutions and updates user learning profiles',
    features: [
      'Answer validation with fuzzy matching',
      'Performance-based damage calculation',
      'Adaptive learning profile updates',
      'Learning analytics and feedback',
      'Problem history tracking',
      'Personalized encouragement messages'
    ],
    damage_factors: [
      'Base card power',
      'Answer accuracy (correct/incorrect)',
      'Response speed (vs. estimated time)',
      'Card rarity multiplier',
      'Hints used penalty',
      'Critical hit bonus (perfect performance)'
    ],
    learning_updates: [
      'Skill level adjustment',
      'Accuracy tracking',
      'Response time averaging',
      'Weak/strong topic identification',
      'Progress measurement'
    ]
  });
} 