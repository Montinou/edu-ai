import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CardCategory, ProblemTypeCode } from '@/types/dynamicCards';

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLEAI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface StoryProblemRequest {
  scenario: string; // e.g., "detective mystery", "space adventure", "cooking challenge"
  character_name: string; // protagonist name
  mathematical_concept: ProblemTypeCode;
  category: CardCategory;
  difficulty: number; // 1-10
  student_level: number; // 1-12 grade level
  problem_count: number; // 1-5 problems in the story
  interactive_choices?: boolean; // include player choices that affect the story
  language: 'es' | 'en';
}

interface StoryChapter {
  chapter_number: number;
  title: string;
  narrative: string;
  mathematical_challenge: {
    problem_text: string;
    correct_answer: string | number;
    options?: string[];
    hints: string[];
    explanation: string;
  };
  story_choices?: {
    choice_text: string;
    consequence: string;
    affects_difficulty: boolean;
  }[];
  next_chapter_condition?: string;
}

interface GeneratedStoryProblem {
  story_id: string;
  title: string;
  character: string;
  scenario: string;
  total_chapters: number;
  chapters: StoryChapter[];
  learning_objectives: string[];
  story_summary: string;
  difficulty_progression: number[];
  estimated_time: number; // minutes
  moral_lesson?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StoryProblemRequest = await request.json();
    
    // Validation
    if (!body.scenario || !body.character_name || !body.mathematical_concept || !body.category) {
      return NextResponse.json(
        { 
          error: 'Missing required parameters',
          required: ['scenario', 'character_name', 'mathematical_concept', 'category']
        },
        { status: 400 }
      );
    }

    // Validate ranges
    if (body.difficulty < 1 || body.difficulty > 10) {
      return NextResponse.json(
        { error: 'Difficulty must be between 1 and 10' },
        { status: 400 }
      );
    }

    if (body.student_level < 1 || body.student_level > 12) {
      return NextResponse.json(
        { error: 'Student level must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (body.problem_count < 1 || body.problem_count > 5) {
      return NextResponse.json(
        { error: 'Problem count must be between 1 and 5' },
        { status: 400 }
      );
    }

    console.log(`Generating story problem: "${body.scenario}" with character "${body.character_name}"`);

    // Generate the story problem using AI
    const generatedStory = await generateStoryProblemWithAI(body);

    const response = {
      success: true,
      story_problem: generatedStory,
      metadata: {
        generatedAt: new Date().toISOString(),
        scenario: body.scenario,
        character: body.character_name,
        concept: body.mathematical_concept,
        difficulty: body.difficulty,
        studentLevel: body.student_level,
        aiModel: 'Google Gemini 1.5 Flash',
        generationVersion: '1.0.0'
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Story problem generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate story problem',
      fallback: true
    }, { status: 500 });
  }
}

async function generateStoryProblemWithAI(request: StoryProblemRequest): Promise<GeneratedStoryProblem> {
  const prompt = buildStoryPrompt(request);
  
  // Generate with retry logic
  const result = await callAIWithRetry(async () => {
    return await model.generateContent(prompt);
  });

  // Parse and validate the response
  const storyData = extractJsonFromResponse(result.response.text());
  
  // Validate required fields
  if (!storyData.chapters || !Array.isArray(storyData.chapters) || storyData.chapters.length === 0) {
    throw new Error('AI response missing chapters array');
  }

  // Add unique story ID
  storyData.story_id = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return storyData;
}

function buildStoryPrompt(request: StoryProblemRequest): string {
  const {
    scenario,
    character_name,
    mathematical_concept,
    category,
    difficulty,
    student_level,
    problem_count,
    interactive_choices,
    language
  } = request;

  const languageInstructions = language === 'en' ? 
    'Respond in English with educational content appropriate for English-speaking students.' :
    'Responde en español con contenido educativo apropiado para estudiantes hispanohablantes.';

  const conceptDescriptions: Record<ProblemTypeCode, string> = {
    addition: 'suma y operaciones básicas',
    subtraction: 'resta y diferencias',
    multiplication: 'multiplicación y productos',
    division: 'división y cocientes',
    fractions: 'fracciones y números racionales',
    decimals: 'números decimales',
    percentages: 'porcentajes y proporciones',
    equations: 'ecuaciones y álgebra básica',
    inequalities: 'desigualdades',
    polynomials: 'polinomios',
    factorization: 'factorización',
    area_perimeter: 'área y perímetro',
    angles: 'ángulos y medidas',
    triangles: 'triángulos y geometría',
    circles: 'círculos y geometría circular',
    logic: 'razonamiento lógico',
    patterns: 'patrones y secuencias',
    sequences: 'sucesiones matemáticas',
    deduction: 'deducción lógica',
    statistics: 'estadística básica',
    probability: 'probabilidad y eventos'
  };

  return `Eres un experto en narrativa educativa. Crea una historia matemática interactiva para estudiantes.

PARÁMETROS DE LA HISTORIA:
- Escenario: "${scenario}"
- Protagonista: "${character_name}"
- Concepto matemático: ${mathematical_concept} (${conceptDescriptions[mathematical_concept]})
- Categoría: ${category}
- Dificultad: ${difficulty}/10
- Nivel del estudiante: ${student_level} (edad aproximada: ${student_level + 6} años)
- Número de problemas/capítulos: ${problem_count}
- Opciones interactivas: ${interactive_choices ? 'SÍ' : 'NO'}

INSTRUCCIONES:
1. Crea una historia emocionante y educativa de ${problem_count} capítulos
2. Cada capítulo debe tener un desafío matemático relacionado con ${mathematical_concept}
3. La historia debe ser apropiada para nivel ${student_level}
4. Incluye personajes memorables y situaciones realistas
5. Los problemas deben integrarse naturalmente en la narrativa
6. ${languageInstructions}
${interactive_choices ? `7. Incluye decisiones que afecten la historia y la dificultad
8. Las consecuencias de las decisiones deben ser educativas` : ''}

ESTRUCTURA REQUERIDA:
- Historia cohesiva con principio, desarrollo y final
- Personajes bien desarrollados
- Problemas matemáticos progresivos
- Explicaciones claras y didácticas
- Moraleja o lección de vida opcional

RESPONDE ÚNICAMENTE CON UN OBJETO JSON (sin markdown):
{
  "title": "Título atractivo de la historia",
  "character": "${character_name}",
  "scenario": "${scenario}",
  "total_chapters": ${problem_count},
  "story_summary": "Resumen de la historia completa (2-3 oraciones)",
  "learning_objectives": ["objetivo 1", "objetivo 2", "objetivo 3"],
  "difficulty_progression": [array de dificultades por capítulo],
  "estimated_time": tiempo_estimado_total_en_minutos,
  "moral_lesson": "Lección moral o de vida (opcional)",
  "chapters": [
    {
      "chapter_number": 1,
      "title": "Título del capítulo",
      "narrative": "Narrativa del capítulo que establece el contexto para el problema matemático (3-5 oraciones)",
      "mathematical_challenge": {
        "problem_text": "Problema matemático integrado en la historia",
        "correct_answer": "respuesta_correcta",
        "options": ["opción 1", "opción 2", "opción 3", "opción 4"],
        "hints": ["pista 1", "pista 2"],
        "explanation": "Explicación detallada de la solución paso a paso"
      }${interactive_choices ? `,
      "story_choices": [
        {
          "choice_text": "Opción de decisión para el protagonista",
          "consequence": "Consecuencia de esta decisión en la historia",
          "affects_difficulty": true/false
        }
      ],
      "next_chapter_condition": "Condición para avanzar al siguiente capítulo"` : ''}
    }
  ]
}

EJEMPLO PARA "DETECTIVE MYSTERY" + "FRACTIONS":
Capítulo 1: El detective encuentra pistas en fracciones de tiempo
- Problema: "El sospechoso estuvo 3/4 de hora en la biblioteca y 1/2 hora en el café. ¿Cuánto tiempo total?"
- Narrativa: El detective debe calcular el tiempo total para verificar la coartada

Asegúrate de que la historia sea engaging, educativa y apropiada para la edad.`;
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

// GET endpoint for information about story problem generation
export async function GET() {
  return NextResponse.json({
    service: 'Interactive Story Problem Generator',
    version: '1.0.0',
    description: 'Generate engaging mathematical stories with interactive narratives',
    features: [
      'Multi-chapter storytelling',
      'Integrated mathematical challenges',
      'Interactive story choices',
      'Progressive difficulty',
      'Character development',
      'Educational morals',
      'Bilingual support (Spanish/English)'
    ],
    supportedScenarios: [
      'detective mystery',
      'space adventure',
      'cooking challenge',
      'treasure hunt',
      'time travel',
      'superhero mission',
      'magical kingdom',
      'scientific expedition',
      'sports competition',
      'environmental rescue'
    ],
    supportedConcepts: [
      'addition', 'subtraction', 'multiplication', 'division',
      'fractions', 'decimals', 'percentages',
      'equations', 'area_perimeter', 'logic', 'patterns',
      'statistics', 'probability'
    ],
    parameters: {
      difficulty: { min: 1, max: 10 },
      student_level: { min: 1, max: 12 },
      problem_count: { min: 1, max: 5 },
      estimated_time: '5-25 minutes depending on complexity'
    }
  });
} 