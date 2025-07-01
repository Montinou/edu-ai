import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DynamicCard, CardRarity, CardCategory } from '@/types/dynamicCards';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface ThematicBatchRequest {
  theme: string; // e.g., "Piratas Matemáticos", "Reino de Fracciones", "Aventura Espacial"
  card_count: number; // 4-12 cards per batch
  student_level: number; // 1-12 grade level
  target_categories: CardCategory[]; // mathematical categories to focus on
  difficulty_spread: 'focused' | 'balanced' | 'progressive'; // how to distribute difficulty
  rarity_distribution?: 'equal' | 'pyramid' | 'custom';
  special_mechanics?: boolean; // include cards with unique game mechanics
}

interface GeneratedThematicBatch {
  theme: string;
  cards: DynamicCard[];
  theme_story: string;
  learning_objectives: string[];
  estimated_playtime: number; // minutes
  difficulty_range: [number, number];
  suggested_sequence: string[]; // card IDs in recommended play order
}

export async function POST(request: NextRequest) {
  try {
    const body: ThematicBatchRequest = await request.json();
    
    // Validation
    if (!body.theme || !body.card_count || !body.student_level || !body.target_categories?.length) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['theme', 'card_count', 'student_level', 'target_categories']
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (body.card_count < 4 || body.card_count > 12) {
      return NextResponse.json(
        { error: 'Card count must be between 4 and 12' },
        { status: 400 }
      );
    }

    if (body.student_level < 1 || body.student_level > 12) {
      return NextResponse.json(
        { error: 'Student level must be between 1 and 12' },
        { status: 400 }
      );
    }

    console.log(`Generating themed batch: "${body.theme}" with ${body.card_count} cards for level ${body.student_level}`);

    // Generate the themed batch using AI
    const generatedBatch = await generateThematicBatchWithAI(body);

    const response = {
      success: true,
      batch: generatedBatch,
      metadata: {
        generatedAt: new Date().toISOString(),
        theme: body.theme,
        cardCount: body.card_count,
        studentLevel: body.student_level,
        targetCategories: body.target_categories,
        aiModel: 'Google Gemini 1.5 Flash',
        generationVersion: '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Thematic batch generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate thematic batch',
      fallback: true
    }, { status: 500 });
  }
}

async function generateThematicBatchWithAI(request: ThematicBatchRequest): Promise<GeneratedThematicBatch> {
  const prompt = buildThematicPrompt(request);
  
  // Generate with retry logic
  const result = await callAIWithRetry(async () => {
    return await model.generateContent(prompt);
  });

  // Parse and validate the response
  const batchData = extractJsonFromResponse(result.response.text());
  
  // Validate required fields
  if (!batchData.cards || !Array.isArray(batchData.cards) || batchData.cards.length === 0) {
    throw new Error('AI response missing cards array');
  }

  // Add unique IDs and metadata to cards
  batchData.cards = batchData.cards.map((card: any, index: number) => ({
    ...card,
    id: `themed_${Date.now()}_${index}`,
    created_at: new Date().toISOString(),
    category: card.problem_category || request.target_categories[0]
  }));

  return batchData;
}

function buildThematicPrompt(request: ThematicBatchRequest): string {
  const { theme, card_count, student_level, target_categories, difficulty_spread, special_mechanics } = request;

  // Calculate difficulty distribution
  const difficulties = generateDifficultyDistribution(card_count, difficulty_spread, student_level);
  
  // Calculate rarity distribution
  const rarities = generateRarityDistribution(card_count, request.rarity_distribution || 'pyramid');

  return `Eres un experto diseñador de juegos educativos. Genera una colección temática de ${card_count} cartas para el juego "EduCard AI".

TEMA: "${theme}"
NIVEL EDUCATIVO: ${student_level} (edad aproximada: ${student_level + 6} años)
CATEGORÍAS OBJETIVO: ${target_categories.join(', ')}
DISTRIBUCIÓN DE DIFICULTAD: ${difficulty_spread}
MECÁNICAS ESPECIALES: ${special_mechanics ? 'SÍ' : 'NO'}

INSTRUCCIONES:
1. Crea ${card_count} cartas que formen una experiencia cohesiva del tema "${theme}"
2. Cada carta debe tener problemas matemáticos apropiados para el nivel educativo
3. Las cartas deben contar una historia progresiva relacionada con el tema
4. Incluye diversidad en tipos de problemas: ${target_categories.join(', ')}
5. Distribución de dificultades: ${difficulties.join(', ')}
6. Distribución de rarezas: ${rarities.join(', ')}
7. Nombres creativos que reflejen el tema y el concepto matemático
8. Lore/trasfondo que conecte el tema con el aprendizaje

${special_mechanics ? `
MECÁNICAS ESPECIALES A INCLUIR:
- Cartas que requieran resolver problemas en secuencia
- Cartas que modifiquen la dificultad de otros problemas
- Cartas que otorguen bonificaciones por precisión
- Cartas con efectos de tiempo limitado
` : ''}

RESPONDE ÚNICAMENTE CON UN OBJETO JSON (sin markdown):
{
  "theme": "${theme}",
  "theme_story": "Historia narrativa que conecta todas las cartas del tema (2-3 oraciones)",
  "learning_objectives": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "estimated_playtime": tiempo_estimado_en_minutos,
  "difficulty_range": [dificultad_mínima, dificultad_máxima],
  "cards": [
    {
      "name": "Nombre de la carta relacionado con el tema",
      "description": "Descripción del problema o habilidad que enseña",
      "rarity": "común|raro|épico|legendario",
      "base_power": poder_entre_10_y_100,
      "level_range": [nivel_mínimo, nivel_máximo],
      "lore": "Historia de la carta en el contexto del tema (1-2 oraciones)",
      "problem_category": "arithmetic|algebra|geometry|logic|statistics",
      "problem_code": "addition|subtraction|multiplication|division|fractions|decimals|equations|area_perimeter|logic|patterns",
      "problem_name_es": "Nombre en español del tipo de problema",
      "problem_description_es": "Descripción del tipo de problema que presenta",
      "problem_difficulty_base": dificultad_entre_1_y_10,
      "problem_icon": "emoji representativo del tipo de problema",
      "problem_color": "color_hexadecimal",
      "art_style": "Descripción del estilo visual de la carta",
      "special_ability": "Habilidad especial si aplica (opcional)"
    }
  ],
  "suggested_sequence": ["card_name_1", "card_name_2", ...]
}

EJEMPLO DE TEMA "Piratas Matemáticos":
- "Capitán Suma": carta común de adición con tesoros
- "Navegante de Fracciones": carta rara para dividir el botín
- "Kraken Multiplicador": carta épica con productos complejos
- "Tesoro Legendario de Álgebra": carta legendaria con ecuaciones

Asegúrate de que cada carta tenga coherencia temática y educativa.`;
}

function generateDifficultyDistribution(cardCount: number, spread: string, studentLevel: number): number[] {
  const baseDifficulty = Math.max(1, Math.min(8, studentLevel - 2)); // Base difficulty around student level
  
  switch (spread) {
    case 'focused':
      // Most cards around the same difficulty ±1
      return Array(cardCount).fill(0).map(() => 
        Math.max(1, Math.min(10, baseDifficulty + Math.floor(Math.random() * 3) - 1))
      );
    
    case 'progressive':
      // Gradually increasing difficulty
      return Array(cardCount).fill(0).map((_, index) => 
        Math.max(1, Math.min(10, baseDifficulty + Math.floor(index * 2 / cardCount)))
      );
    
    case 'balanced':
    default:
      // Even distribution across difficulty range
      const range = Math.min(5, Math.max(3, Math.floor(cardCount / 2)));
      return Array(cardCount).fill(0).map(() => 
        Math.max(1, Math.min(10, baseDifficulty + Math.floor(Math.random() * range) - Math.floor(range / 2)))
      );
  }
}

function generateRarityDistribution(cardCount: number, distribution: string): CardRarity[] {
  switch (distribution) {
    case 'equal':
      // Even distribution
      const rarityTypes: CardRarity[] = ['común', 'raro', 'épico', 'legendario'];
      return Array(cardCount).fill(0).map((_, index) => 
        rarityTypes[index % rarityTypes.length]
      );
    
    case 'custom':
      // More epic and legendary cards
      const customPattern: CardRarity[] = ['raro', 'épico', 'legendario', 'épico'];
      return Array(cardCount).fill(0).map((_, index) => 
        customPattern[index % customPattern.length]
      );
    
    case 'pyramid':
    default:
      // Pyramid distribution: many common, few legendary
      const pyramid: CardRarity[] = [];
      const commonCount = Math.ceil(cardCount * 0.5);
      const rareCount = Math.ceil(cardCount * 0.3);
      const epicCount = Math.ceil(cardCount * 0.15);
      const legendaryCount = Math.max(1, cardCount - commonCount - rareCount - epicCount);
      
      pyramid.push(...Array(commonCount).fill('común'));
      pyramid.push(...Array(rareCount).fill('raro'));
      pyramid.push(...Array(epicCount).fill('épico'));
      pyramid.push(...Array(legendaryCount).fill('legendario'));
      
      // Shuffle the array
      return pyramid.sort(() => Math.random() - 0.5).slice(0, cardCount);
  }
}

async function callAIWithRetry(generateFn: () => Promise<any>, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateFn();
    } catch (error: any) {
      console.log(`AI generation attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

function extractJsonFromResponse(text: string): any {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', text);
    throw new Error('Invalid JSON response from AI');
  }
}

// GET endpoint for information about thematic generation
export async function GET() {
  return NextResponse.json({
    service: 'Thematic Card Batch Generator',
    version: '1.0.0',
    description: 'Generate cohesive collections of educational cards around specific themes',
    features: [
      'Themed storytelling',
      'Difficulty distribution control',
      'Rarity balancing',
      'Special mechanics integration',
      'Educational progression',
      'Contextual problem generation'
    ],
    supportedThemes: [
      'Piratas Matemáticos',
      'Reino de Fracciones',
      'Aventura Espacial',
      'Laboratorio de Ciencias',
      'Castillo de Geometría',
      'Bosque de Probabilidades',
      'Ciudad de Álgebra',
      'Océano de Estadísticas'
    ],
    parameters: {
      card_count: { min: 4, max: 12 },
      student_level: { min: 1, max: 12 },
      difficulty_spread: ['focused', 'balanced', 'progressive'],
      rarity_distribution: ['equal', 'pyramid', 'custom']
    }
  });
} 