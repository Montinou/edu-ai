// Vercel AI SDK Service Implementation
import { AIService, MathProblemParams, LogicProblemParams, PromptValidationParams, 
         TutoringParams, StoryParams, CharacterParams, CompleteCardParams,
         LogicProblem, PromptValidation, TutoringResponse, 
         StoryElement, CharacterDescription, AIError, AIErrorCode, CompleteCard } from '@/types/ai';
import { LogicType, LogicContext } from '@/types/cards';

// Vercel AI SDK imports
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { OpenAI } from 'openai';

class VercelAIService implements AIService {
  private client: OpenAI | null = null;
  private model: string;
  
  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo';
    // Validate required API keys
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not provided. OpenAI provider will not work.');
    }
  }

  private async getClient() {
    if (!this.client) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is missing. Please set the OPENAI_API_KEY environment variable.');
      }
      this.client = new OpenAI({ apiKey });
    }
    return this.client;
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
   * Generates a math problem using OpenAI
   */
  async generateMathProblem(params: MathProblemParams) {
    const { difficulty, operation, studentLevel, context = '', timeLimit = 60, includeHints = true } = params;

    const openai = await this.getClient();

    const prompt = `
      Generate a ${operation} math problem for a student at level ${studentLevel} with difficulty ${difficulty}.
      ${context ? `Context for the problem: ${context}` : ''}
      
      The problem should include:
      1. A clear question
      2. The correct answer
      3. Four multiple choice options (including the correct answer)
      4. A detailed explanation of how to solve it
      ${includeHints ? '5. Two helpful hints' : ''}
      
      Format the response as a JSON object with the following structure:
      {
        "question": "The question text",
        "answer": "The correct answer (can be a number or string)",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "explanation": "Step by step explanation",
        "hints": ["Hint 1", "Hint 2"],
        "type": "math",
        "operation": "${operation}",
        "difficulty": ${difficulty},
        "timeLimit": ${timeLimit}
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: 'You are a math education assistant that creates engaging, appropriate math problems for children.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      try {
        // Parse the JSON response
        const problem = JSON.parse(content);
        
        // Validate the problem structure
        if (!problem.question || !problem.answer || !problem.options || !problem.explanation) {
          throw new Error('Invalid problem structure');
        }
        
        return problem;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response:', parseError);
        throw new Error('Failed to parse problem JSON from OpenAI');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to generate math problem: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate logic problem with Vercel AI SDK
  async generateLogicProblem(params: LogicProblemParams): Promise<LogicProblem> {
    try {
      const prompt = this.buildLogicProblemPrompt(params);
      
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
      });

      if (!result) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.text);
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

  // Validate prompt with Vercel AI SDK
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

      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.3,
        maxTokens: 1000,
      });

      if (!result) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'validatePrompt');
    }
  }

  // Provide tutoring with Vercel AI SDK
  async provideTutoring(params: TutoringParams): Promise<TutoringResponse> {
    try {
      const prompt = this.buildTutoringPrompt(params);
      
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.5,
        maxTokens: 1500,
      });

      if (!result) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'provideTutoring');
    }
  }

  // Generate story element with Vercel AI SDK
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
      
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.8,
        maxTokens: 2000,
      });

      if (!result) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.text);
      return JSON.parse(cleanedText);
    } catch (error) {
      throw this.handleAIError(error, 'generateStoryElement');
    }
  }

  // Generate character with Vercel AI SDK
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
      
      const result = await generateText({
        model: openai('gpt-4o'),
        prompt,
        temperature: 0.7,
        maxTokens: 1500,
      });

      if (!result) {
        throw new Error('No response from AI service');
      }

      const cleanedText = this.cleanJsonResponse(result.text);
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

    const openai = await this.getClient();

    // Generate the problem first based on card type
    let problem;
    if (cardType === 'math') {
      problem = await this.generateMathProblem({
        difficulty,
        operation: operation || 'addition',
        studentLevel,
        context: context || 'general',
      });
    } else {
      // For other card types, create the problem via a direct OpenAI call
      const problemPrompt = `
        Generate a ${cardType} problem ${cardType === 'logic' ? `of type ${logicType}` : ''} 
        for a student at level ${studentLevel} with difficulty ${difficulty}.
        Context: ${context}
        
        Format as JSON with:
        {
          "question": "The question text",
          "answer": "The correct answer",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "explanation": "Step by step explanation",
          "hints": ["Hint 1", "Hint 2"],
          "type": "${cardType}",
          ${cardType === 'logic' ? `"subtype": "${logicType}",` : ''}
          "difficulty": ${difficulty}
        }
      `;

      try {
        const response = await openai.chat.completions.create({
          model: this.model,
          messages: [
            { 
              role: 'system', 
              content: `You are an education assistant that creates engaging ${cardType} problems for children.` 
            },
            { role: 'user', content: problemPrompt }
          ],
          response_format: { type: 'json_object' }
        });

        const content = response.choices[0]?.message.content;
        
        if (!content) {
          throw new Error('No content returned from OpenAI');
        }

        problem = JSON.parse(content);
      } catch (error) {
        console.error(`Failed to generate ${cardType} problem:`, error);
        throw new Error(`Failed to generate ${cardType} problem`);
      }
    }

    // Now generate the card metadata
    const cardPrompt = `
      Create a ${theme}-themed educational card for a ${cardType} problem.
      The card is of ${rarity} rarity.
      Difficulty level: ${difficulty}
      Context: ${context}
      
      Generate a creative name, description, and power level for this card.
      
      Format as JSON:
      {
        "name": "Creative card name",
        "description": "Brief engaging description",
        "power": <number between 10-100 based on rarity and difficulty>,
        "cost": <number between 1-10 based on power>,
        "effects": ["Effect 1", "Effect 2"]
      }
    `;

    try {
      const response = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { 
            role: 'system', 
            content: 'You are a game designer creating educational trading cards for children.' 
          },
          { role: 'user', content: cardPrompt }
        ],
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message.content;
      
      if (!content) {
        throw new Error('No content returned from OpenAI');
      }

      const cardData = JSON.parse(content);

      // Combine problem and card data
      return {
        id: `card-${Date.now()}`,
        name: cardData.name,
        type: cardType,
        rarity,
        power: cardData.power,
        cost: cardData.cost,
        description: cardData.description,
        problem,
        effects: cardData.effects,
        artwork: {
          image: `/images/cards/card-images/${cardType}-default.svg`,
          description: `An image of ${cardData.name} in ${theme} style with ${context} theme`,
          colorScheme: ['blue', 'purple', 'gold'],
          mood: 'dynamic',
          visualElements: ['educational', 'themed', 'colorful']
        },
        unlocked: true,
        aiGenerated: true,
        balanceScore: 75,
        educationalValue: ['critical thinking', 'problem solving'],
        thematicConsistency: 80
      } as CompleteCard;
    } catch (error) {
      console.error('Failed to generate card metadata:', error);
      throw new Error('Failed to generate card');
    }
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

// Factory function to create and initialize the Vercel AI service
export async function createVercelAIService() {
  return new VercelAIService();
}

export default VercelAIService; 