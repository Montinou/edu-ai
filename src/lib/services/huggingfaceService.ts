// Hugging Face Service Implementation
import { AIService, MathProblemParams, LogicProblemParams, PromptValidationParams, 
         TutoringParams, StoryParams, CharacterParams, CompleteCardParams,
         LogicProblem, PromptValidation, TutoringResponse, 
         StoryElement, CharacterDescription, AIError, AIErrorCode, CompleteCard, CardEffect } from '@/types/ai';
import { LogicType, LogicContext } from '@/types/cards';

// Hugging Face Inference
import { HfInference } from '@huggingface/inference';

class HuggingFaceService implements AIService {
  private hf: HfInference;
  private defaultModel: string = 'mistralai/Mixtral-8x7B-Instruct-v0.1';
  
  constructor() {
    // Validate required API keys
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.warn('HUGGINGFACE_API_KEY not provided. Hugging Face provider will not work.');
    }
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  // Helper to clean JSON from response
  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
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

    const errorObj = error as { status?: number; message?: string };

    if (errorObj.status === 429) {
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
   * Generates a math problem using Hugging Face
   */
  async generateMathProblem(params: MathProblemParams) {
    const { difficulty, operation, studentLevel, timeLimit = 60 } = params;
    
    // If we have an API key, we would call Hugging Face's API here
    // For now, return a mock implementation
    
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
      }
    };

    // Choose the problem type or use a default if not available
    const problemType = operation in mockProblems ? operation : 'addition';
    
    console.log(`🤗 Using Hugging Face service for ${problemType} problem (difficulty: ${difficulty})`);
    
    return {
      ...mockProblems[problemType],
      difficulty,
      operation,
      studentLevel,
      timeLimit,
      type: 'math',
      model: this.defaultModel,
      provider: 'huggingface'
    };
  }

  // Generate logic problem with Hugging Face
  async generateLogicProblem(params: LogicProblemParams): Promise<LogicProblem> {
    try {
      const prompt = this.buildLogicProblemPrompt(params);
      
      const result = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      if (!result || !result.generated_text) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.generated_text);
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
      throw this.handleAIError(error, 'generateLogicProblem');
    }
  }

  // Validate prompt with Hugging Face
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
        
        Respond in JSON format with:
        {
          "isValid": boolean,
          "score": number,
          "feedback": "string",
          "suggestions": ["string"],
          "safetyFlags": []
        }
      `;

      const result = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1000,
          temperature: 0.3,
          return_full_text: false,
        }
      });

      if (!result || !result.generated_text) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.generated_text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'validatePrompt');
    }
  }

  // Provide tutoring with Hugging Face
  async provideTutoring(params: TutoringParams): Promise<TutoringResponse> {
    try {
      const prompt = this.buildTutoringPrompt(params);
      
      const result = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.5,
          return_full_text: false,
        }
      });

      if (!result || !result.generated_text) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.generated_text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'provideTutoring');
    }
  }

  // Generate story element with Hugging Face
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
        
        Return a creative story element in JSON format:
        {
          "title": "string",
          "content": "string",
          "characters": ["string"],
          "setting": "string",
          "educationalElements": ["string"],
          "questions": ["string"]
        }
      `;
      
      const result = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 2000,
          temperature: 0.8,
          return_full_text: false,
        }
      });

      if (!result || !result.generated_text) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.generated_text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'generateStoryElement');
    }
  }

  // Generate character with Hugging Face
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
        
        Return a detailed character description in JSON format:
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
      
      const result = await this.hf.textGeneration({
        model: this.defaultModel,
        inputs: prompt,
        parameters: {
          max_new_tokens: 1500,
          temperature: 0.7,
          return_full_text: false,
        }
      });

      if (!result || !result.generated_text) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.generated_text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'generateCharacter');
    }
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
        answer: "Respuesta",
        options: ["Opción A", "Respuesta", "Opción C", "Opción D"],
        type: cardType,
        subtype: cardType === 'logic' ? logicType : undefined,
        difficulty,
        explanation: "Explicación del problema",
        hints: ["Pista 1", "Pista 2"],
        model: this.defaultModel,
        provider: 'huggingface'
      };
    }

    // Calculate power based on difficulty and rarity
    const rarityMultiplier: Record<string, number> = {
      común: 1,
      raro: 1.5,
      épico: 2,
      legendario: 3
    };
    
    const basePower = 10 + (Number(difficulty) * 5);
    const power = Math.floor(basePower * rarityMultiplier[rarity]);

    // Generate name based on type and theme
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
      ]
    };

    const nameOptions = names[cardType] || names.math;
    const cardName = nameOptions[Math.floor(Math.random() * nameOptions.length)];

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

    console.log(`🤗 Using Hugging Face service to generate ${cardType} card: ${cardName}`);

    // Create the complete card
    return {
      id: `card-${Date.now()}`,
      name: cardName,
      type: cardType,
      rarity,
      power,
      cost,
      description: `Una poderosa carta de ${cardType} con estilo ${theme}`,
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
      provider: 'huggingface',
      model: this.defaultModel
    } as CompleteCard;
  }

  // Helper methods for building prompts
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
      
      Return the result in JSON format:
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
      
      Return the response in JSON format matching the TutoringResponse interface
    `;
  }
}

// Factory function to create and initialize the Hugging Face service
export async function createHuggingFaceService(): Promise<AIService> {
  return new HuggingFaceService();
}

export default HuggingFaceService; 