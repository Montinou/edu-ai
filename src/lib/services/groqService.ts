// Groq Service Implementation
import { AIService, MathProblemParams, LogicProblemParams, PromptValidationParams, 
         TutoringParams, StoryParams, CharacterParams, CompleteCardParams,
         LogicProblem, PromptValidation, TutoringResponse, 
         StoryElement, CharacterDescription, AIError, AIErrorCode, CompleteCard, CardEffect } from '@/types/ai';
import { LogicType, LogicContext } from '@/types/cards';

// Groq SDK
import Groq from 'groq-sdk';

class GroqService implements AIService {
  private groq: Groq;
  private defaultModel: string = 'mixtral-8x7b-32768'; // Default model for Groq
  private apiKey?: string;
  
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    this.groq = new Groq({
      apiKey: this.apiKey || '',
    });
    
    if (!this.apiKey) {
      console.warn('⚠️ No Groq API key found. Using mock implementation.');
    }
  }

  // Helper to clean JSON from response
  private cleanJsonResponse(text: string): string {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return cleaned.trim();
  }

  // Handle AI errors in a standardized way
  private handleAIError(error: unknown, context: string): AIError {
    let code: AIErrorCode = 'SERVICE_UNAVAILABLE';
    let message = 'Unknown error in AI service';
    let retryable = true;

    const errorObj = error as { status?: number; message?: string; code?: string };

    // Check for Groq specific error structure if available
    if (errorObj.code === 'context_length_exceeded') {
        code = 'INVALID_REQUEST';
        message = 'Context length exceeded for Groq API.';
        retryable = false;
    } else if (errorObj.status === 429) {
      code = 'RATE_LIMIT_EXCEEDED';
      message = 'Rate limit exceeded. Try again in a few minutes.';
      retryable = true;
    } else if (errorObj.status === 401 || errorObj.status === 403) {
      code = 'INVALID_API_KEY';
      message = 'Invalid API key';
      retryable = false;
    } else if (errorObj.status === 400) {
      code = 'INVALID_REQUEST';
      message = 'Invalid request';
      retryable = false;
    }

    return {
      code,
      message,
      details: { context, originalError: errorObj.message || 'Unknown error' },
      retryable,
      timestamp: new Date(),
    };
  }

  /**
   * Generates a math problem using Groq
   */
  async generateMathProblem(params: MathProblemParams) {
    const { difficulty, operation, studentLevel, timeLimit = 60 } = params;
    
    // If we have an API key, we would call Groq's API here
    // For now, return a mock implementation
    
    // Mock problem generation based on parameters
    const mockProblems: Record<string, any> = {
      addition: {
        question: `¿Cuánto es ${7 * Number(difficulty)} + ${4 * Number(difficulty)}?`,
        answer: 7 * Number(difficulty) + 4 * Number(difficulty),
        options: [
          7 * Number(difficulty) + 4 * Number(difficulty) - 3,
          7 * Number(difficulty) + 4 * Number(difficulty),
          7 * Number(difficulty) + 4 * Number(difficulty) + 3,
          7 * Number(difficulty) + 4 * Number(difficulty) + 6
        ],
        explanation: `Para resolver ${7 * Number(difficulty)} + ${4 * Number(difficulty)}, sumamos los números: ${7 * Number(difficulty)} + ${4 * Number(difficulty)} = ${7 * Number(difficulty) + 4 * Number(difficulty)}`,
        hints: ['Suma los números', 'Recuerda agrupar unidades y decenas'],
      },
      multiplication: {
        question: `¿Cuánto es ${Number(difficulty) + 3} × ${studentLevel + 2}?`,
        answer: (Number(difficulty) + 3) * (studentLevel + 2),
        options: [
          (Number(difficulty) + 3) * (studentLevel + 2) - 4,
          (Number(difficulty) + 3) * (studentLevel + 2),
          (Number(difficulty) + 3) * (studentLevel + 2) + 4,
          (Number(difficulty) + 3) * (studentLevel + 2) + 8
        ],
        explanation: `Para resolver ${Number(difficulty) + 3} × ${studentLevel + 2}, multiplicamos: ${Number(difficulty) + 3} × ${studentLevel + 2} = ${(Number(difficulty) + 3) * (studentLevel + 2)}`,
        hints: ['Multiplica los números', 'Puedes usar la propiedad distributiva si es más fácil'],
      }
    };

    // Choose the problem type or use a default if not available
    const problemType = operation in mockProblems ? operation : 'addition';
    
    console.log(`⚡ Using Groq service for ${problemType} problem (difficulty: ${difficulty})`);
    
    return {
      ...mockProblems[problemType],
      difficulty,
      operation,
      studentLevel,
      timeLimit,
      type: 'math',
      model: this.defaultModel,
      provider: 'groq'
    };
  }

  /**
   * Generates a complete card with problem, metadata, and artwork description
   */
  async generateCompleteCard(params: CompleteCardParams): Promise<CompleteCard> {
    const { 
      difficulty, 
      cardType, 
      operation, 
      studentLevel, 
      rarity, 
      theme, 
      context,
      logicType
    } = params;

    // Generate problem based on card type
    let problem;
    if (cardType === 'math') {
      problem = await this.generateMathProblem({
        difficulty,
        operation: operation || 'addition',
        studentLevel,
        context: context || 'general',
      });
    } else {
      // For other card types, generate a generic problem
      problem = {
        question: `Problema de ${cardType} con dificultad ${difficulty}`,
        answer: "Respuesta correcta",
        options: ["Opción A", "Opción B", "Respuesta correcta", "Opción D"],
        type: cardType,
        subtype: cardType === 'logic' ? logicType : undefined,
        difficulty,
        explanation: "Explicación detallada del problema",
        hints: ["Pista 1: Analiza el patrón", "Pista 2: Considera todas las posibilidades"],
        model: this.defaultModel,
        provider: 'groq'
      };
    }

    // Calculate power based on difficulty and rarity
    const rarityMultiplier: Record<string, number> = {
      común: 1,
      raro: 1.5,
      épico: 2,
      legendario: 3
    };
    
    const basePower = 12 + (Number(difficulty) * 6);
    const power = Math.floor(basePower * rarityMultiplier[rarity]);

    // Generate name based on type and theme
    const names: Record<string, string[]> = {
      math: [
        `${theme === 'fantasy' ? 'Archimago' : 'Maestro'} de ${operation === 'addition' ? 'la Suma' : operation === 'multiplication' ? 'la Multiplicación' : 'los Números'}`,
        `${theme === 'fantasy' ? 'Titán' : 'Experto'} Matemático`,
        `${theme === 'fantasy' ? 'Nigromante' : 'Genio'} de las Ecuaciones`
      ],
      logic: [
        `${theme === 'fantasy' ? 'Oráculo' : 'Detective'} de la ${logicType === 'pattern' ? 'Secuencia' : 'Lógica'}`,
        `${theme === 'fantasy' ? 'Visionario' : 'Estratega'} del Pensamiento`,
        `${theme === 'fantasy' ? 'Sabio' : 'Mentor'} de los Acertijos`
      ]
    };

    const nameOptions = names[cardType] || names.math;
    const cardName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

    // Generate description based on card type
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
      ]
    };

    const descOptions = descriptions[cardType] || descriptions.math;
    const description = descOptions[Math.floor(Math.random() * descOptions.length)];

    // Generate effects based on rarity
    const effects: CardEffect[] = [];
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

    // Determine cost based on power
    const cost = Math.max(1, Math.floor(power / 10));

    console.log(`⚡ Using Groq service to generate ${cardType} card: ${cardName}`);

    // Create the complete card
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
        image: `/images/cards/card-images/${cardType}-default.svg`,
        description: `Una imagen de ${cardName} en estilo ${theme} con temática de ${context}`,
        colorScheme: ['blue', 'purple', 'gold'],
        mood: 'mystical',
        visualElements: ['academic', 'magical', 'dynamic']
      },
      unlocked: true,
      aiGenerated: true,
      balanceScore: 80,
      educationalValue: ['critical thinking', 'problem solving', 'numerical fluency'],
      thematicConsistency: 85,
      provider: 'groq',
      model: this.defaultModel
    } as CompleteCard;
  }

  // Generate logic problem with Groq
  async generateLogicProblem(params: LogicProblemParams): Promise<LogicProblem> {
     try {
      const prompt = this.buildLogicProblemPrompt(params);
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.defaultModel,
        temperature: 0.7,
        max_tokens: 1024,
      });

      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No response content from Groq AI service');
      }

      const cleanedText = this.cleanJsonResponse(generatedText);
      const problemData = JSON.parse(cleanedText);
      
      const logicProblem: LogicProblem = {
        question: problemData.question,
        answer: problemData.answer,
        type: params.type as LogicType,
        options: problemData.options,
        difficulty: params.difficulty,
        hints: problemData.hints || [],
        explanation: problemData.explanation || '',
        context: params.context as LogicContext,
        problemType: 'logic',
      };

      return logicProblem;
    } catch (error) {
      console.error('Groq API Error (generateLogicProblem):', error);
      throw this.handleAIError(error, 'generateLogicProblem');
    }
  }

  // Validate prompt with Groq
  async validatePrompt(params: PromptValidationParams): Promise<PromptValidation> {
    try {
      const prompt = `
        Evaluate this prompt created by a ${params.studentAge}-year-old child:
        
        Prompt: "${params.prompt}"
        Context: ${params.context}
        Expected result: ${params.expectedResult}
        
        Evaluate the prompt on a scale of 0-100 considering:
        - Clarity (is it easy to understand?)
        - Specificity (does it provide enough details?)
        - Creativity (is it original and interesting?)
        - Age-appropriate
        
        Respond ONLY in JSON format with the following structure and no additional text:
        {
          "isValid": boolean,
          "score": number,
          "feedback": "string",
          "suggestions": ["string"],
          "safetyFlags": []
        }
      `;

      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.defaultModel,
        temperature: 0.3,
        max_tokens: 1024,
      });

      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No response content from Groq AI service');
      }

      const cleanedText = this.cleanJsonResponse(generatedText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Groq API Error (validatePrompt):', error);
      throw this.handleAIError(error, 'validatePrompt');
    }
  }

  // Provide tutoring with Groq
  async provideTutoring(params: TutoringParams): Promise<TutoringResponse> {
    try {
      const prompt = this.buildTutoringPrompt(params); // Assuming this returns a string prompt
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.defaultModel,
        temperature: 0.5,
        max_tokens: 1500,
      });

      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No response content from Groq AI service');
      }

      const cleanedText = this.cleanJsonResponse(generatedText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Groq API Error (provideTutoring):', error);
      throw this.handleAIError(error, 'provideTutoring');
    }
  }

  // Generate story element with Groq
  async generateStoryElement(params: StoryParams): Promise<StoryElement> {
    try {
      const prompt = `
        Generate a story element with the following details:
        - Theme: ${params.theme || 'Not specified'}
        - Characters: ${params.characters?.join(', ') || 'None specified'}
        - Setting: ${params.setting || 'Not specified'}
        - Educational goal: ${params.educationalGoal || 'Not specified'}
        - Age: ${params.age || 'Not specified'}
        - Length: ${params.length || 'medium'}
        - Context: ${params.context || 'Educational story'}
        
        Return a creative story element in JSON format ONLY:
        {
          "title": "string",
          "content": "string",
          "characters": ["string"],
          "setting": "string",
          "educationalElements": ["string"],
          "questions": ["string"]
        }
      `;
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.defaultModel,
        temperature: 0.8,
        max_tokens: 2000,
      });

      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No response content from Groq AI service');
      }

      const cleanedText = this.cleanJsonResponse(generatedText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Groq API Error (generateStoryElement):', error);
      throw this.handleAIError(error, 'generateStoryElement');
    }
  }

  // Generate character with Groq
  async generateCharacter(params: CharacterParams): Promise<CharacterDescription> {
    try {
      const prompt = `
        Generate a character for an educational game with these parameters:
        - Type: ${params.type || 'Not specified'}
        - Age: ${params.age || 'Not specified'}
        - Personality: ${params.personality?.join(', ') || 'Not specified'}
        - Skills: ${params.skills?.join(', ') || 'Not specified'}
        - Appearance: ${params.appearance || 'Not specified'}
        - Role: ${params.role || 'Not specified'}
        - Context: ${params.context || 'Educational game'}
        
        Return a detailed character description in JSON format ONLY:
        {
          "name": "string",
          "description": "string",
          "personality": ["string"],
          "appearance": "string",
          "specialties": ["string"],
          "backstory": "string",
          "catchphrase": "string",
          "visualPrompt": "string"
        }
      `;
      
      const chatCompletion = await this.groq.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: this.defaultModel,
        temperature: 0.7,
        max_tokens: 1500,
      });

      const generatedText = chatCompletion.choices[0]?.message?.content;
      if (!generatedText) {
        throw new Error('No response content from Groq AI service');
      }

      const cleanedText = this.cleanJsonResponse(generatedText);
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Groq API Error (generateCharacter):', error);
      throw this.handleAIError(error, 'generateCharacter');
    }
  }

  // Helper methods for building prompts (copied from VercelAIService for consistency)
  private buildLogicProblemPrompt(params: LogicProblemParams): string {
    return `
      Generate a logic problem for a ${params.age}-year-old student with the following characteristics:
      - Type: ${params.type} (e.g., pattern recognition, categorization, etc.)
      - Difficulty level: ${params.difficulty} (1-10 scale)
      - Context: ${params.context}
      
      The problem should include:
      - A clear question
      - The correct answer
      - 4 multiple choice options
      - ${params.includeVisuals ? 'Include visual elements' : 'No visual elements'}
      - 2-3 progressive hints
      - A brief explanation of the solution
      
      Return the result in JSON format ONLY:
      {
        "question": "string",
        "answer": "string",
        "options": ["string"],
        "hints": ["string"],
        "explanation": "string"
      }
    `;
  }

  private buildTutoringPrompt(params: TutoringParams): string {
    return `
      You are a helpful tutor for a student.
      
      Problem: ${params.problem.question}
      Student's answer: ${params.studentAnswer}
      Correct answer: ${params.problem.answer}
      
      Student profile:
      - Age: ${params.studentProfile.age}
      - Level: ${params.studentProfile.level}
      - Learning style: ${params.studentProfile.learningStyle}
      - Strengths: ${params.studentProfile.strengths.join(', ')}
      - Weaknesses: ${params.studentProfile.weaknesses.join(', ')}
      
      Attempts so far: ${params.attempts}
      Time spent: ${params.timeSpent} seconds
      
      Provide personalized tutoring help that includes:
      - Assessment of where they went wrong
      - A helpful hint that leads them to discover the answer
      - An analogy or example to clarify the concept
      - Encouragement tailored to their progress
      
      Return the response in JSON format ONLY, matching the TutoringResponse interface
      {
        "feedback": {
           "isCorrect": boolean,
           "encouragement": "string",
           "hint": "string",
           "explanation": "string",
           "nextSteps": ["string"]
        },
        "adaptiveRecommendations": {
           "adjustDifficulty": "string",
           "focusAreas": ["string"],
           "suggestedPractice": ["string"],
           "timeRecommendation": number
        },
        "nextActions": [
          {
            "type": "string",
            "description": "string",
            "priority": "string",
            "estimatedTime": number
          }
        ],
        "encouragement": "string"
      }
    `;
  }
}

// Factory function to create and initialize the Groq AI service
export async function createGroqService(): Promise<AIService> {
  return new GroqService();
}

export default GroqService; 