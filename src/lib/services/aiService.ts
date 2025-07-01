import { AIService as AIServiceInterface, MathProblemParams, LogicProblemParams, PromptValidationParams, 
         TutoringParams, StoryParams, CharacterParams, CompleteCardParams,
         LogicProblem, PromptValidation, TutoringResponse, 
         StoryElement, CharacterDescription, CompleteCard } from '@/types/ai';
import { createGroqService } from './groqService';
import { createHuggingFaceService } from './huggingfaceService';
import { createVercelAIService } from './vercelAIService';

// Default to mock implementation
class MockAIService implements AIServiceInterface {
  private defaultModel: string = 'mock-model';
  private provider: string = 'mock';
  
  /**
   * Generates a math problem based on the provided parameters
   */
  async generateMathProblem(params: MathProblemParams) {
    // This is a placeholder implementation until actual AI service integration
    const { difficulty, operation, studentLevel, timeLimit = 60 } = params;
    
    // Mock problem generation based on parameters
    const mockProblems: Record<string, any> = {
      addition: {
        question: `¿Cuánto es ${5 * Number(difficulty)} + ${3 * Number(difficulty)}?`,
        answer: 5 * Number(difficulty) + 3 * Number(difficulty),
        options: [
          5 * Number(difficulty) + 3 * Number(difficulty) - 2,
          5 * Number(difficulty) + 3 * Number(difficulty),
          5 * Number(difficulty) + 3 * Number(difficulty) + 2,
          5 * Number(difficulty) + 3 * Number(difficulty) + 4
        ],
        explanation: `Para resolver ${5 * Number(difficulty)} + ${3 * Number(difficulty)}, simplemente sumamos los números: ${5 * Number(difficulty)} + ${3 * Number(difficulty)} = ${5 * Number(difficulty) + 3 * Number(difficulty)}`,
        hints: ['Suma los números', 'Recuerda las reglas de suma'],
      },
      multiplication: {
        question: `¿Cuánto es ${Number(difficulty) + 2} × ${studentLevel}?`,
        answer: (Number(difficulty) + 2) * studentLevel,
        options: [
          (Number(difficulty) + 2) * studentLevel - 2,
          (Number(difficulty) + 2) * studentLevel,
          (Number(difficulty) + 2) * studentLevel + 2,
          (Number(difficulty) + 2) * studentLevel + 4
        ],
        explanation: `Para resolver ${Number(difficulty) + 2} × ${studentLevel}, multiplicamos los números: ${Number(difficulty) + 2} × ${studentLevel} = ${(Number(difficulty) + 2) * studentLevel}`,
        hints: ['Multiplica los números', 'Recuerda las tablas de multiplicar'],
      },
      fractions: {
        question: `¿Cuánto es 1/${Number(difficulty) + 1} + 1/${Number(difficulty) + 2}?`,
        answer: `${(Number(difficulty) + 2) + (Number(difficulty) + 1)}/((${Number(difficulty) + 1}) × (${Number(difficulty) + 2}))`,
        options: [
          `${(Number(difficulty) + 2) + (Number(difficulty) + 1)}/((${Number(difficulty) + 1}) × (${Number(difficulty) + 2}))`,
          `2/((${Number(difficulty) + 1}) + (${Number(difficulty) + 2}))`,
          `${Number(difficulty) + 1}/${Number(difficulty) + 2}`,
          `${Number(difficulty) + 2}/${Number(difficulty) + 1}`
        ],
        explanation: `Para sumar 1/${Number(difficulty) + 1} + 1/${Number(difficulty) + 2}, encontramos el mínimo común múltiplo y realizamos la suma.`,
        hints: ['Encuentra el mínimo común múltiplo', 'Convierte las fracciones al mismo denominador'],
      }
    };

    // Elegir el tipo de problema o usar un problema genérico si el tipo no está disponible
    const problemType = operation in mockProblems ? operation : 'addition';
    
    return {
      ...mockProblems[problemType],
      difficulty,
      operation,
      studentLevel,
      timeLimit,
      type: 'math',
      model: this.defaultModel,
      provider: this.provider
    };
  }

  /**
   * Generates a complete card with problem, metadata, and artwork description
   */
  async generateCompleteCard(params: CompleteCardParams): Promise<CompleteCard> {
    const { 
      difficulty, 
      cardType, 
      operation = 'addition', 
      studentLevel, 
      rarity, 
      theme, 
      context,
      logicType = 'pattern'
    } = params;

    // Generar problema según el tipo de carta
    let problem;
    if (cardType === 'math') {
      problem = await this.generateMathProblem({
        difficulty,
        operation,
        studentLevel,
        context: context || '',
      });
    } else if (cardType === 'logic') {
      // Usar logicType para problemas de lógica
      problem = {
        question: `Problema de lógica tipo ${logicType} con dificultad ${difficulty}`,
        answer: "Respuesta lógica",
        options: ["Opción A", "Respuesta lógica", "Opción C", "Opción D"],
        type: 'logic',
        subtype: logicType,
        difficulty,
        explanation: "Explicación del problema de lógica",
        hints: ["Pista 1", "Pista 2"],
        model: this.defaultModel,
        provider: this.provider
      };
    } else {
      // Para otros tipos de cartas, generar un problema genérico
      problem = {
        question: `Problema de ${cardType} con dificultad ${difficulty}`,
        answer: "Respuesta",
        options: ["Opción A", "Respuesta", "Opción C", "Opción D"],
        type: cardType,
        difficulty,
        explanation: "Explicación del problema",
        hints: ["Pista 1", "Pista 2"],
        model: this.defaultModel,
        provider: this.provider
      };
    }

    // Calcular poder basado en dificultad y rareza
    const rarityMultiplier: Record<string, number> = {
      común: 1,
      raro: 1.5,
      épico: 2,
      legendario: 3
    };
    
    const basePower = 10 + (Number(difficulty) * 5);
    const power = Math.floor(basePower * rarityMultiplier[rarity]);

    // Generar nombre según el tipo y tema
    const names: Record<string, string[]> = {
      math: [
        `${theme === 'fantasy' ? 'Mago' : 'Maestro'} de ${operation === 'addition' ? 'la Suma' : operation === 'multiplication' ? 'la Multiplicación' : 'los Números'}`,
        `${theme === 'fantasy' ? 'Guardián' : 'Experto'} Matemático`,
        `${theme === 'fantasy' ? 'Hechicero' : 'Genio'} de las Ecuaciones`
      ],
      logic: [
        `${theme === 'fantasy' ? 'Oráculo' : 'Detective'} de la ${logicType === 'pattern' ? 'Secuencia' : 'Lógica'}`,
        `${theme === 'fantasy' ? 'Visionario' : 'Estratega'} del Pensamiento`,
        `${theme === 'fantasy' ? 'Sabio' : 'Mentor'} de los Acertijos`
      ],
      special: [
        `${theme === 'fantasy' ? 'Campeón' : 'As'} Especial`,
        `${theme === 'fantasy' ? 'Héroe' : 'Estrella'} Único`,
        `${theme === 'fantasy' ? 'Leyenda' : 'Prodigio'} Extraordinario`
      ],
      defense: [
        `${theme === 'fantasy' ? 'Escudo' : 'Protector'} Invencible`,
        `${theme === 'fantasy' ? 'Guardián' : 'Defensor'} Impenetrable`,
        `${theme === 'fantasy' ? 'Centinela' : 'Vigía'} Vigilante`
      ]
    };

    const nameOptions = names[cardType] || names.special;
    const cardName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

    // Generar descripción según tipo y contexto
    const descriptions: Record<string, string[]> = {
      math: [
        `Domina los números con precisión y velocidad.`,
        `Resuelve problemas matemáticos con facilidad asombrosa.`,
        `Convierte números complejos en soluciones simples.`
      ],
      logic: [
        `Descifra patrones ocultos y resuelve enigmas imposibles.`,
        `Su mente aguda encuentra soluciones donde otros ven caos.`,
        `Maestro del pensamiento lateral y la deducción lógica.`
      ],
      special: [
        `Poder único que transforma el campo de batalla.`,
        `Habilidades extraordinarias que cambian las reglas del juego.`,
        `Talento especial que sorprende a amigos y enemigos.`
      ],
      defense: [
        `Protege de ataques y fortalece tus defensas.`,
        `Barrera impenetrable contra los desafíos más difíciles.`,
        `Escudo inquebrantable que asegura tu victoria.`
      ]
    };

    const descOptions = descriptions[cardType] || descriptions.special;
    const description = descOptions[Math.floor(Math.random() * descOptions.length)];

    // Generar efectos según tipo y rareza
    const effects = [];
    if (rarity === 'raro' || rarity === 'épico' || rarity === 'legendario') {
      effects.push({
        id: 'power_boost',
        type: 'damage_boost',
        value: Number(difficulty) * 2,
        duration: 1,
        description: `Aumenta poder en +${Number(difficulty) * 2} al resolver correctamente`,
        trigger: 'on_correct_answer'
      });
    }
    if (rarity === 'épico' || rarity === 'legendario') {
      effects.push({
        id: 'shield',
        type: 'shield',
        value: Number(difficulty) * 3,
        duration: 1,
        description: `Otorga escudo de ${Number(difficulty) * 3} puntos`,
        trigger: 'on_play'
      });
    }
    if (rarity === 'legendario') {
      effects.push({
        id: 'extra_card',
        type: 'draw_card',
        value: 1,
        duration: 1,
        description: 'Permite jugar una carta adicional este turno',
        trigger: 'on_play'
      });
    }

    // Determinar coste basado en poder
    const cost = Math.max(1, Math.floor(power / 10));

    // Crear la carta completa
    return {
      id: `card-${Date.now()}`,
      name: cardName,
      type: cardType,
      rarity,
      power,
      cost,
      description,
      problem,
      effects,
      artwork: {
        theme,
        context,
        description: `Una imagen de ${cardName} en estilo ${theme} con temática de ${context}`,
        image: `/images/cards/card-images/${cardType}-default.svg`,
        colorScheme: ['blue', 'purple'],
        mood: 'energetic',
        visualElements: ['academic', 'magical']
      },
      unlocked: true,
      aiGenerated: true,
      balanceScore: 75,
      educationalValue: ['critical thinking', 'problem solving'],
      thematicConsistency: 80,
      provider: this.provider,
      model: this.defaultModel
    } as CompleteCard;
  }

  // Methods required by AIServiceInterface but not implemented in mock version
  async generateLogicProblem(_params: LogicProblemParams): Promise<LogicProblem> {
    throw new Error('Method not implemented in mock service');
  }

  async validatePrompt(_params: PromptValidationParams): Promise<PromptValidation> {
    throw new Error('Method not implemented in mock service');
  }

  async provideTutoring(_params: TutoringParams): Promise<TutoringResponse> {
    throw new Error('Method not implemented in mock service');
  }

  async generateStoryElement(_params: StoryParams): Promise<StoryElement> {
    throw new Error('Method not implemented in mock service');
  }

  async generateCharacter(_params: CharacterParams): Promise<CharacterDescription> {
    throw new Error('Method not implemented in mock service');
  }
}

// Create a singleton instance for import
let serviceInstance: AIServiceInterface | null = null;

// Factory function to create and configure an AIService instance
export async function createAIService(): Promise<AIServiceInterface> {
  // If we already have an instance, return it
  if (serviceInstance) {
    return serviceInstance;
  }

  // Determine which AI provider to use based on environment variables
  const provider = process.env.AI_PROVIDER || 'mock';
  
  try {
    switch (provider.toLowerCase()) {
      case 'groq':
        console.log('🤖 Initializing Groq AI service');
        serviceInstance = await createGroqService();
        break;
      case 'huggingface':
        console.log('🤗 Initializing Hugging Face AI service');
        serviceInstance = await createHuggingFaceService();
        break;
      case 'vercel':
      case 'openai':
        console.log('✨ Initializing Vercel/OpenAI AI service');
        serviceInstance = await createVercelAIService();
        break;
      default:
        console.warn('⚠️ No AI provider specified or invalid provider. Using mock implementation.');
        serviceInstance = new MockAIService();
    }
    
    return serviceInstance;
  } catch (error) {
    console.error('❌ Error initializing AI service:', error);
    console.warn('⚠️ Falling back to mock implementation.');
    serviceInstance = new MockAIService();
    return serviceInstance;
  }
}

// Initialize the service on module load
const aiServicePromise = createAIService();

// Export a pre-initialized instance for direct import
export const aiService = {
  async generateMathProblem(params: MathProblemParams) {
    const service = await aiServicePromise;
    return service.generateMathProblem(params);
  },
  
  async generateCompleteCard(params: CompleteCardParams) {
    const service = await aiServicePromise;
    return service.generateCompleteCard(params);
  },
  
  async generateLogicProblem(params: LogicProblemParams) {
    const service = await aiServicePromise;
    return service.generateLogicProblem(params);
  },
  
  async validatePrompt(params: PromptValidationParams) {
    const service = await aiServicePromise;
    return service.validatePrompt(params);
  },
  
  async provideTutoring(params: TutoringParams) {
    const service = await aiServicePromise;
    return service.provideTutoring(params);
  },
  
  async generateStoryElement(params: StoryParams) {
    const service = await aiServicePromise;
    return service.generateStoryElement(params);
  },
  
  async generateCharacter(params: CharacterParams) {
    const service = await aiServicePromise;
    return service.generateCharacter(params);
  }
};

export default MockAIService;
