import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { 
  ProblemRequest, 
  GeneratedProblem, 
  CardCategory, 
  ProblemTypeCode,
  PlayerContext,
  GameContext,
  DamageCalculation
} from '@/types/dynamicCards';
import { RARITY_MULTIPLIERS } from '@/types/dynamicCards';

// Initialize Google AI
let googleAI: GoogleGenerativeAI;

function initializeGoogleAI(): GoogleGenerativeAI | null {
  if (!googleAI) {
    const apiKey = process.env.GOOGLEAI_API_KEY;
    if (!apiKey) {
      console.warn('⚠️  GOOGLEAI_API_KEY environment variable is not set, using fallback mode');
      return null;
    }
    console.log('🔑 Initializing Google AI with API key...');
    googleAI = new GoogleGenerativeAI(apiKey);
  }
  return googleAI;
}

// Helper function to clean JSON response from markdown
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Dynamic Problem Generation API called');
    const body: ProblemRequest = await request.json();

    // Enhanced validation with better defaults
    const {
      category = 'aritmética',
      problem_type = 'addition',
      difficulty = 5, // Medium difficulty default
      playerContext,
      gameContext,
      cardInfo
    } = body;

    console.log(`🎯 Generating problem: ${category}/${problem_type}, difficulty: ${difficulty}`);

    // Robust player context with defaults
    const safePlayerContext: PlayerContext = {
      level: playerContext?.level || 5,
      currentLevel: playerContext?.currentLevel || 5,
      recentMistakes: playerContext?.recentMistakes || [],
      strengths: playerContext?.strengths || [],
      averageResponseTime: playerContext?.averageResponseTime || 25000,
      accuracy: playerContext?.accuracy || 0.75,
      sessionProblemsCount: playerContext?.sessionProblemsCount || 0,
      weakCategories: playerContext?.weakCategories || [],
      strongCategories: playerContext?.strongCategories || []
    };

    // Safe game context with defaults
    const safeGameContext: GameContext = {
      battlePhase: gameContext?.battlePhase || 'mid',
      cardsPlayed: gameContext?.cardsPlayed || 1,
      timeRemaining: gameContext?.timeRemaining || 300,
      opponentType: gameContext?.opponentType || 'training_dummy',
      playerHP: gameContext?.playerHP || 100,
      opponentHP: gameContext?.opponentHP || 100,
      difficulty_preference: gameContext?.difficulty_preference || 'adaptive'
    };

    console.log(`👤 Player context: level=${safePlayerContext.currentLevel}, accuracy=${(safePlayerContext.accuracy*100).toFixed(1)}%`);

    // Initialize Google AI
    const genAI = initializeGoogleAI();
    const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('🚀 Generating content with Google AI...');

    // Build the prompt
    const prompt = buildPrompt(category, problem_type, difficulty, safePlayerContext, safeGameContext, cardInfo);
    
    // Generate content
    const result = await model?.generateContent(prompt);
    const response = await result?.response;
    const text = response?.text();

    if (!text) {
      throw new Error('No response from AI service');
    }

    console.log('✅ Content generated successfully, parsing...');

    // Parse and validate the generated problem
    const problem = parseGeneratedProblem(text, category, problem_type, difficulty);

    // Calculate damage potential
    const damageCalculation = calculateDamageCalculation(
      cardInfo?.base_power || 30,
      difficulty,
      safePlayerContext
    );

    const apiResponse = {
      success: true,
      problem: problem,
      damage_calculation: damageCalculation,
      generation_metadata: {
        ai_used: !!genAI,
        player_context_used: safePlayerContext,
        game_context_used: safeGameContext,
        difficulty_applied: difficulty,
        timestamp: new Date().toISOString()
      }
    };

    console.log(`🎉 Problem generation completed for ${category}/${problem_type}`);
    return NextResponse.json(apiResponse);

  } catch (error) {
    console.error('🚨 Problem generation error:', error);
    console.error('🚨 Error details:', error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate problem',
      details: 'Google AI generation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function buildPrompt(category: CardCategory, problem_type: ProblemTypeCode, difficulty: number, playerContext: PlayerContext, gameContext: GameContext, cardInfo: any): string {
  // Safe defaults for cardInfo to prevent undefined errors
  const safeCardInfo = {
    name: cardInfo?.name || 'Carta Misteriosa',
    rarity: cardInfo?.rarity || 'común',
    base_power: cardInfo?.base_power || 30,
    ...cardInfo
  };

  const categoryDescriptions = {
    'aritmética': 'operaciones aritméticas básicas (suma, resta, multiplicación, división)',
    'álgebra': 'ecuaciones algebraicas y manipulación de variables',
    'geometría': 'formas geométricas, áreas, perímetros y espacios',
    'lógica': 'razonamiento lógico, patrones y deducción',
    'estadística': 'estadística básica y análisis de datos'
  };

  const problemTypeDetails = {
    'suma': 'problemas de suma',
    'resta': 'problemas de resta', 
    'multiplicación': 'problemas de multiplicación',
    'división': 'problemas de división',
    'fracciones': 'operaciones con fracciones',
    'decimales': 'operaciones con decimales',
    'porcentajes': 'cálculos de porcentajes',
    'ecuaciones': 'resolver ecuaciones simples',
    'desigualdades': 'desigualdades matemáticas',
    'polinomios': 'operaciones con polinomios',
    'factorización': 'factorización',
    'área_perímetro': 'cálculo de áreas y perímetros',
    'ángulos': 'medición y cálculo de ángulos',
    'triángulos': 'propiedades de triángulos',
    'círculos': 'propiedades de círculos',
    'lógica': 'problemas de razonamiento lógico',
    'patrones': 'identificación de patrones',
    'secuencias': 'secuencias matemáticas',
    'deducción': 'deducción lógica',
    'estadística': 'estadística descriptiva',
    'probabilidad': 'cálculo de probabilidades'
  };

  const battleContextHint = gameContext?.battlePhase === 'late' ? 
    'El combate está en fase final, haz el problema más desafiante.' :
    gameContext?.battlePhase === 'early' ?
    'Es el inicio del combate, mantén el problema accesible.' :
    'El combate está en desarrollo, equilibra dificultad y engagement.';

  const playerContextHint = playerContext?.recentMistakes?.length > 0 ?
    `El jugador ha tenido dificultades recientes en: ${playerContext.recentMistakes.join(', ')}. Evita estos temas o crea un problema de refuerzo muy básico.` :
    playerContext?.strengths?.length > 0 ?
    `El jugador tiene fortalezas en: ${playerContext.strengths.join(', ')}. Puedes incorporar estos conceptos para mayor confianza.` :
    'No hay historial específico del jugador, crea un problema estándar.';

  return `Eres un experto en educación matemática y diseño de juegos. Genera un problema matemático para el juego de cartas educativo "EduCard AI".

CONTEXTO DE LA CARTA:
- Nombre: "${safeCardInfo.name}"
- Categoría: ${category} (${(categoryDescriptions as any)[category] || 'categoría matemática'})
- Tipo de problema: ${(problemTypeDetails as any)[problem_type] || 'problema matemático'}
- Dificultad objetivo: ${difficulty}/10
- Rareza: ${safeCardInfo.rarity}
- Poder base: ${safeCardInfo.base_power}

CONTEXTO DEL JUGADOR:
- Nivel actual: ${playerContext?.currentLevel || 1}
- ${playerContextHint}

CONTEXTO DE BATALLA:
- Fase: ${gameContext?.battlePhase || 'early'}
- Cartas jugadas: ${gameContext?.cardsPlayed || 0}
- ${battleContextHint}

⚠️ INSTRUCCIONES CRÍTICAS - DEBES SEGUIR ESTO EXACTAMENTE:
1. **OBLIGATORIO**: El problema DEBE ser de tipo "${problem_type}" - NO te dejes influir por el nombre de la carta
2. **OBLIGATORIO**: La dificultad DEBE ser apropiada para nivel ${difficulty}/10
3. **OBLIGATORIO**: Si el tipo es "suma", genera SOLO problemas de suma, NO fracciones ni otros temas
4. **OBLIGATORIO**: Si el tipo es "resta", genera SOLO problemas de resta
5. **OBLIGATORIO**: Si el tipo es "multiplicación", genera SOLO problemas de multiplicación
6. **OBLIGATORIO**: Si el tipo es "división", genera SOLO problemas de división

CONTEXTO NARRATIVO:
- Puedes usar el nombre de la carta "${safeCardInfo.name}" para crear contexto narrativo
- Pero el TIPO de operación matemática debe ser "${problem_type}" sin excepción
- La dificultad debe ser ${difficulty}/10 donde 1 es muy fácil y 10 es muy difícil

EJEMPLOS ESTRICTOS:
- Si problem_type="suma" y difficulty=1: genera sumas simples como 2+3, 5+4, etc.
- Si problem_type="suma" y difficulty=5: genera sumas con números más grandes
- Si problem_type="multiplicación" y difficulty=1: genera multiplicaciones simples como 2×3
- NO mezcles tipos: si pides suma, NO hagas fracciones, multiplicación, etc.

EJEMPLOS ESPECÍFICOS POR TIPO:
- "suma": Siempre format: A + B = ?, ejemplo: "En el grimorio hay 7 hechizos básicos. Si agregas 5 hechizos más, ¿cuántos hechizos tendrás en total?"
- "resta": Siempre format: A - B = ?, ejemplo: "El grimorio tenía 15 páginas mágicas. Si 6 se desvanecieron, ¿cuántas páginas quedan?"  
- "multiplicación": Siempre format: A × B = ?, ejemplo: "El grimorio tiene 4 capítulos, cada uno con 3 hechizos. ¿Cuántos hechizos hay en total?"
- "división": Siempre format: A ÷ B = ?, ejemplo: "El grimorio tiene 12 gemas que deben repartirse entre 3 magos. ¿Cuántas gemas recibe cada mago?"

PARA PROBLEM_TYPE="${problem_type}":
- Genera ÚNICAMENTE problemas de ${problem_type}
- Usa el contexto narrativo del grimorio/carta para crear la historia
- Pero la operación matemática debe ser ${problem_type} sin excepción

RESPONDE ÚNICAMENTE CON UN OBJETO JSON (sin markdown):
{
  "problem_text": "Texto claro del problema matemático",
  "correct_answer": "respuesta_correcta",
  "answer_type": "number|text|fraction|equation",
  "multiple_choice_options": ["opción1", "opción2", "opción3", "opción4"],
  "hints": [
    "Pista inicial que da dirección",
    "Pista intermedia más específica", 
    "Pista final que casi revela la solución"
  ],
  "explanation": "Explicación paso a paso completa que enseña el concepto",
  "learning_objective": "Objetivo de aprendizaje específico de este problema",
  "difficulty_actual": dificultad_real_del_problema_1_a_10,
  "estimated_time_seconds": tiempo_estimado_en_segundos,
  "problem_context": "Contexto narrativo si aplica",
  "similar_practice": "Sugerencia de práctica similar para reforzar",
  "common_mistakes": ["error típico 1", "error típico 2"],
  "success_message": "Mensaje motivacional para respuesta correcta",
  "support_message": "Mensaje de apoyo para respuesta incorrecta"
}

EJEMPLO PARA MULTIPLICATION/DIFICULTAD 3:
{
  "problem_text": "El Mago Multiplicador tiene 7 cofres mágicos. Cada cofre contiene 9 gemas de poder. ¿Cuántas gemas tiene en total?",
  "correct_answer": "63",
  "answer_type": "number",
  "multiple_choice_options": ["54", "63", "72", "81"],
  "hints": [
    "Necesitas multiplicar el número de cofres por las gemas en cada cofre",
    "7 cofres × 9 gemas por cofre = ?",
    "Puedes contar de 9 en 9: 9, 18, 27, 36, 45, 54, 63"
  ],
  "explanation": "Para encontrar el total, multiplicamos 7 × 9 = 63. La multiplicación nos dice cuántas veces sumamos el mismo número: 9 + 9 + 9 + 9 + 9 + 9 + 9 = 63 gemas.",
  "learning_objective": "Aplicar multiplicación básica en contextos de conteo de grupos",
  "difficulty_actual": 3,
  "estimated_time_seconds": 30,
  "problem_context": "Mundo mágico de aventuras",
  "similar_practice": "Problemas de multiplicación con objetos agrupados",
  "common_mistakes": ["Sumar en lugar de multiplicar", "Confundir el orden de los números"],
  "success_message": "¡Excelente! Tu magia multiplicadora es poderosa",
  "support_message": "Casi lo tienes. Recuerda que multiplicar es sumar grupos iguales"
}

Asegúrate de que el problema sea apropiado para la edad del jugador y educativamente valioso.`;
}

interface ExtendedDamageCalculation extends DamageCalculation {
  damage_range?: {
    min: number;
    max: number;
    expected: number;
  };
}

function calculateDamageCalculation(basePower: number, difficulty: number, _playerContext: PlayerContext): ExtendedDamageCalculation {
  const rarity = 'común'; // Assuming a default rarity
  const rarityMultiplier = (RARITY_MULTIPLIERS as any)[rarity] || 1.0;
  const difficultyBonus = Math.max(0, (difficulty - 5) * 0.1);
  const problemTypeBonus = 0.1; // Default bonus
  
  const baseDamage = basePower;
  const minAccuracy = 0.2;
  const maxAccuracy = 1.0;
  const avgSpeedMultiplier = 1.0;
  const maxSpeedMultiplier = 1.5;
  
  const minDamage = Math.floor(baseDamage * minAccuracy * rarityMultiplier);
  const maxDamage = Math.floor(baseDamage * maxAccuracy * maxSpeedMultiplier * rarityMultiplier * (1 + difficultyBonus + problemTypeBonus));
  const expectedDamage = Math.floor(baseDamage * avgSpeedMultiplier * rarityMultiplier * (1 + difficultyBonus));

  return {
    base_damage: baseDamage,
    accuracy_multiplier: avgSpeedMultiplier,
    speed_multiplier: avgSpeedMultiplier,
    rarity_multiplier: rarityMultiplier,
    streak_multiplier: 1.0,
    difficulty_bonus: difficultyBonus,
    problem_type_bonus: problemTypeBonus,
    final_damage: expectedDamage,
    critical_hit: false,
    multipliers_applied: {
      accuracy: 1.0,
      speed: avgSpeedMultiplier,
      rarity: rarityMultiplier,
      streak: 1.0,
      difficulty: 1 + difficultyBonus,
      problem_type: 1 + problemTypeBonus,
      total: avgSpeedMultiplier * rarityMultiplier * (1 + difficultyBonus + problemTypeBonus)
    },
    damage_range: {
      min: minDamage,
      max: maxDamage,
      expected: expectedDamage
    }
  };
}

function parseGeneratedProblem(text: string, category: CardCategory, problemType: ProblemTypeCode, difficulty: number): GeneratedProblem {
  try {
    console.log('🔍 Raw AI response:', text.substring(0, 200) + '...');
    
    // Clean the response text
    const cleanedText = cleanJsonResponse(text);
    console.log('🧹 Cleaned response:', cleanedText.substring(0, 200) + '...');
    
    // Parse JSON
    const problemData = JSON.parse(cleanedText);
    
    // Validate required fields
    if (!problemData.problem_text || !problemData.correct_answer) {
      console.error('❌ AI response missing required fields:', problemData);
      throw new Error('AI response missing required problem fields');
    }
    
    console.log('✅ Successfully parsed problem:', problemData.problem_text.substring(0, 100) + '...');
    
    return {
      id: `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      problem_text: problemData.problem_text,
      correct_answer: problemData.correct_answer,
      multiple_choice_options: problemData.multiple_choice_options || [],
      hints: problemData.hints || [],
      explanation: problemData.explanation || '',
      learning_objective: problemData.learning_objective || '',
      difficulty_actual: problemData.difficulty_actual || difficulty,
      estimated_time: problemData.estimated_time_seconds || 30,
      topic_tags: [category, problemType],
      problem_format: problemData.multiple_choice_options && problemData.multiple_choice_options.length > 0 ? 'multiple_choice' : 'numeric',
      category,
      problem_type: problemType
    };
  } catch (error) {
    console.error('❌ Failed to parse AI response:', text);
    console.error('❌ Parse error:', error);
    throw new Error(`Invalid JSON response from AI: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
  }
}

// GET endpoint for service information and debugging
export async function GET() {
  try {
    const apiKey = process.env.GOOGLEAI_API_KEY;
    const hasApiKey = !!apiKey;
    const apiKeyPreview = apiKey ? `${apiKey.substring(0, 10)}...` : 'Not set';
    
    return NextResponse.json({
      service: 'Dynamic Problem Generator',
      version: '1.0.0',
      description: 'Generates contextual mathematical problems in real-time when cards are played',
      status: {
        googleai_configured: hasApiKey,
        api_key_preview: apiKeyPreview,
        environment: process.env.NODE_ENV || 'development'
      },
      features: [
        'AI-powered problem generation',
        'Context-aware difficulty adjustment',
        'Player learning profile integration',
        'Battle context consideration',
        'Multiple problem types and categories',
        'Progressive hint system',
        'Educational explanations',
        'Damage calculation preview'
      ],
      supportedCategories: ['arithmetic', 'algebra', 'geometry', 'logic', 'statistics'],
      supportedProblemTypes: [
        'addition', 'subtraction', 'multiplication', 'division',
        'fractions', 'decimals', 'percentages',
        'equations', 'inequalities', 'polynomials', 'factoring',
        'area_perimeter', 'angles', 'triangles', 'circles',
        'logic', 'patterns', 'sequences', 'deduction',
        'statistics', 'probability'
      ],
      parameters: {
        difficulty: { min: 1, max: 10 },
        estimated_time: '10-120 seconds depending on complexity'
      }
    });
  } catch (error) {
    return NextResponse.json({
      service: 'Dynamic Problem Generator',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 