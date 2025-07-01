import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CardCategory, ProblemTypeCode, CardRarity } from '@/types/dynamicCards';
import { createClient } from '@supabase/supabase-js';

interface DynamicCardRequest {
  category: CardCategory;
  rarity: CardRarity;
  theme?: string;
  educationalFocus?: string;
  ageGroup?: string;
  count?: number;
}

interface GeneratedCardMetadata {
  name: string;
  description: string;
  flavor_text: string;
  base_power: number;
  rarity: CardRarity;
  category: CardCategory;
  problem_type_code: ProblemTypeCode;
  level_range: [number, number];
  art_style: string;
  lore: string;
  art_prompt: string;
  magical_element: string;
  educational_theme: string;
  backstory: string;
  special_ability?: string;
  power_calculation?: {
    problem_type: string;
    base_difficulty: number;
    cognitive_load: number;
    rarity_multiplier: number;
    rarity_bonus: number;
    final_calculation: string;
  };
}

interface DynamicGenerationResult {
  success: boolean;
  cards?: GeneratedCardMetadata[];
  error?: string;
  generation_metadata?: {
    model_used: string;
    timestamp: string;
    theme_applied: string;
    tokens_used?: number;
  };
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DynamicCard {
  id: string;
  name: string;
  description: string;
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  category: string;
  base_power: number;
  level_range: [number, number];
  lore: string;
  problem_category: string;
  problem_code: string;
  problem_name_es: string;
  problem_difficulty_base: number;
  problem_icon: string;
  problem_color: string;
  special_ability?: string | undefined;
  effect_type?: 'damage_boost' | 'defense_boost' | 'healing' | 'special_attack' | 'bonus_multiplier' | undefined;
  effect_power?: number | undefined;
}

export class DynamicCardGenerator {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = process.env.GOOGLEAI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateCards(request: DynamicCardRequest): Promise<DynamicGenerationResult> {
    if (!this.genAI) {
      return {
        success: false,
        error: 'Google AI not configured'
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = this.buildGenerationPrompt(request);
      console.log('🤖 Generating dynamic cards with Gemini...');
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('No response from Gemini AI');
      }

      console.log('✅ Raw AI response received, parsing...');
      const parsedCards = this.parseGeneratedCards(text, request);

      return {
        success: true,
        cards: parsedCards,
        generation_metadata: {
          model_used: 'gemini-1.5-flash',
          timestamp: new Date().toISOString(),
          theme_applied: request.theme || 'educational-fantasy',
          tokens_used: text.length // Approximate
        }
      };

    } catch (error) {
      console.error('❌ Dynamic card generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown generation error'
      };
    }
  }

  private buildGenerationPrompt(request: DynamicCardRequest): string {
    const categoryDescriptions = {
      aritmética: 'operaciones básicas, fracciones, decimales y porcentajes',
      álgebra: 'ecuaciones, variables, polinomios y manipulación algebraica',
      geometría: 'formas geométricas, áreas, perímetros, ángulos y espacios',
      lógica: 'patrones, secuencias, deducción y razonamiento lógico',
      estadística: 'estadística, probabilidad y análisis de datos'
    };

    const targetPower = this.calculateTargetPower(request.rarity);
    const categoryDesc = categoryDescriptions[request.category];

    return `
Eres un maestro creador de cartas épicas estilo anime. Genera ${request.count} carta(s) matemática(s) 100% EN ESPAÑOL con estas especificaciones:

CATEGORÍA: ${request.category} (${categoryDesc})
RAREZA: ${request.rarity} 
PODER OBJETIVO: ${targetPower}
TEMA: ${request.theme || 'anime-epic-español'}
ENFOQUE EDUCATIVO: ${request.educationalFocus || `Dominio de ${request.category}`}

INSTRUCCIONES CRÍTICAS PARA NOMBRES:
- CADA CARTA DEBE TENER UN NOMBRE COMPLETAMENTE ÚNICO Y ORIGINAL
- NO usar plantillas repetitivas como "El Prisma de..." o "Cristal de..."
- Crear nombres épicos inspirados en:
  * Mitología: Ragnarok, Excalibur, Mjolnir, Aegis
  * Anime: Zanpakutō, Bankai, Jutsu, Kagemusha
  * Fantasy: Tempest, Voidwalker, Shadowbane, Doomhammer
  * Elementos únicos: Nombres de lugares místicos, antiguos hechiceros, artefactos legendarios

EJEMPLOS DE NOMBRES ÚNICOS (NO REPETIR):
- "Ragnarok Numérico del Infinito"
- "Katana de los Algoritmos Perdidos"
- "Tormenta de Fibonacci"
- "Vórtice de Euler"
- "Bankai de la Probabilidad Suprema"
- "Espada del Teorema Ancestral"
- "Maelstrom Algebraico"
- "Cetro de Gauss el Eterno"

RESPUESTA REQUERIDA (JSON VÁLIDO):
{
  "cards": [
    {
      "name": "NOMBRE ÚNICO Y ÉPICO - NUNCA REPETIR",
      "description": "Descripción épica en español",
      "flavor_text": "Texto evocativo en español",
      "base_power": 200,
      "category": "${request.category}",
      "rarity": "${request.rarity}",
      "problem_type_code": "addition",
      "level_range": [1, 5],
      "art_style": "anime-epic",
      "lore": "Historia épica de fondo en español",
      "art_prompt": "Prompt descriptivo para imagen anime-épica",
      "magical_element": "elemento_único",
      "educational_theme": "tema educativo específico",
      "backstory": "Historia personal del personaje/objeto",
      "special_ability": "Habilidad única si corresponde"
    }
  ]
}

REGLAS ABSOLUTAS:
1. TODO EN ESPAÑOL - Ni una sola palabra en inglés
2. NOMBRES 100% ÚNICOS - Cada carta debe tener un nombre completamente diferente
3. TEMÁTICA ANIME ÉPICA - Inspiración en anime, mythology, fantasy
4. EDUCATIVO - Relacionado con ${request.category}
5. PODER BALANCEADO - Cerca de ${targetPower} puntos
6. JSON VÁLIDO - Sin comentarios ni texto adicional

¡GENERA CARTAS ÉPICAS CON NOMBRES ÚNICOS Y MEMORABLES!`;
  }

  private parseGeneratedCards(text: string, request: DynamicCardRequest): GeneratedCardMetadata[] {
    try {
      // Clean the response text
      const cleanedText = this.cleanJsonResponse(text);
      
      // Parse JSON
      const response = JSON.parse(cleanedText);
      
      if (!response.cards || !Array.isArray(response.cards)) {
        throw new Error('Invalid response format: missing cards array');
      }

      // Validate and process each card
      const processedCards: GeneratedCardMetadata[] = [];
      
      for (const card of response.cards) {
        if (!this.validateCardData(card)) {
          console.warn('⚠️ Skipping invalid card:', card.name || 'unnamed');
          continue;
        }

        // Ensure level_range is properly formatted
        if (!Array.isArray(card.level_range) || card.level_range.length !== 2) {
          card.level_range = this.generateLevelRange(request.category, request.rarity);
        }

        // Validate power using new dynamic system
        card.base_power = this.validateDynamicPower(card, request);

        processedCards.push(card as GeneratedCardMetadata);
      }

      console.log(`✅ Successfully parsed ${processedCards.length} dynamic cards`);
      return processedCards;

    } catch (error) {
      console.error('❌ Failed to parse generated cards:', error);
      console.error('Raw text:', text.substring(0, 500) + '...');
      
      // Return fallback card if parsing fails
      return [this.createFallbackCard(request)];
    }
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
    let cleaned = text.replace(/```json\s*|\s*```/g, '');
    
    // Remove any text before the first {
    const firstBrace = cleaned.indexOf('{');
    if (firstBrace > 0) {
      cleaned = cleaned.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      cleaned = cleaned.substring(0, lastBrace + 1);
    }
    
    return cleaned.trim();
  }

  private validateCardData(card: any): boolean {
    // Campos mínimos requeridos - hago la validación menos estricta
    const required = ['name', 'description', 'base_power'];
    return required.every(field => {
      if (!card[field]) return false;
      if (typeof card[field] === 'string' && card[field].toString().trim().length === 0) return false;
      if (field === 'base_power' && (isNaN(card[field]) || card[field] <= 0)) return false;
      return true;
    });
  }

  private validateDynamicPower(card: any, request: DynamicCardRequest): number {
    // Enhanced dynamic power validation based on educational complexity
    const problemComplexityScores: Record<CardCategory, Record<string, { base: number; cognitive_load: number; max_level: number }>> = {
      aritmética: {
        addition: { base: 15, cognitive_load: 1, max_level: 6 },
        subtraction: { base: 18, cognitive_load: 1.2, max_level: 6 },
        multiplication: { base: 25, cognitive_load: 2, max_level: 8 },
        division: { base: 30, cognitive_load: 2.5, max_level: 9 },
        fractions: { base: 35, cognitive_load: 3, max_level: 10 },
        decimals: { base: 32, cognitive_load: 2.8, max_level: 9 },
        percentages: { base: 38, cognitive_load: 3.2, max_level: 11 }
      },
      álgebra: {
        equations: { base: 40, cognitive_load: 3.5, max_level: 12 },
        inequalities: { base: 45, cognitive_load: 4, max_level: 13 },
        polynomials: { base: 55, cognitive_load: 5, max_level: 15 },
        factorization: { base: 50, cognitive_load: 4.5, max_level: 14 }
      },
      geometría: {
        area_perimeter: { base: 28, cognitive_load: 2.3, max_level: 8 },
        angles: { base: 35, cognitive_load: 3.0, max_level: 10 },
        triangles: { base: 42, cognitive_load: 3.8, max_level: 12 },
        circles: { base: 48, cognitive_load: 4.2, max_level: 13 }
      },
      lógica: {
        patterns: { base: 30, cognitive_load: 2.5, max_level: 9 },
        sequences: { base: 38, cognitive_load: 3.3, max_level: 11 },
        deduction: { base: 45, cognitive_load: 4.0, max_level: 13 },
        logic: { base: 52, cognitive_load: 4.8, max_level: 14 }
      },
      estadística: {
        statistics: { base: 48, cognitive_load: 4.3, max_level: 14 },
        probability: { base: 55, cognitive_load: 5.2, max_level: 16 }
      }
    };

    const rarityMultipliers = {
      común: { multiplier: 1.0, bonus: 0, variance: 0.1 },
      raro: { multiplier: 1.3, bonus: 5, variance: 0.15 },
      épico: { multiplier: 1.6, bonus: 12, variance: 0.2 },
      legendario: { multiplier: 2.0, bonus: 20, variance: 0.25 }
    };

    try {
      const problemType = card.problem_type_code as string;
      const categoryScores = problemComplexityScores[request.category];
      const rarityData = rarityMultipliers[request.rarity];

      if (!categoryScores || !categoryScores[problemType]) {
        console.warn(`⚠️ Unknown problem type ${problemType} for category ${request.category}, using fallback calculation`);
        return this.calculateFallbackPower(request.rarity);
      }

      const problemData = categoryScores[problemType];
      
      // Dynamic power calculation: (Base × Cognitive_Load × Multiplier) + Bonus + Variance
      const basePower = problemData.base * problemData.cognitive_load * rarityData.multiplier;
      const bonusPower = rarityData.bonus;
      const variance = Math.random() * rarityData.variance * basePower * 2 - (rarityData.variance * basePower); // ±variance%
      
      const finalPower = Math.round(basePower + bonusPower + variance);

      // Ensure minimum values but allow high-end flexibility
      const minPower = Math.max(15, problemData.base);
      const maxPower = Math.min(200, problemData.base * problemData.cognitive_load * 3 + 50); // Reasonable upper limit

      const validatedPower = Math.max(minPower, Math.min(maxPower, finalPower));

      console.log(`🔢 Dynamic Power Calculation for ${card.name}:`);
      console.log(`   Problem: ${problemType} (Base: ${problemData.base}, Cognitive Load: ${problemData.cognitive_load}x)`);
      console.log(`   Rarity: ${request.rarity} (Multiplier: ${rarityData.multiplier}x, Bonus: +${rarityData.bonus})`);
      console.log(`   Calculation: (${problemData.base} × ${problemData.cognitive_load} × ${rarityData.multiplier}) + ${rarityData.bonus} + ${Math.round(variance)} = ${validatedPower}`);

      return validatedPower;

    } catch (error) {
      console.warn(`⚠️ Error in dynamic power calculation for ${card.name}, using fallback:`, error instanceof Error ? error.message : 'Unknown error');
      return this.calculateFallbackPower(request.rarity);
    }
  }

  private calculateFallbackPower(rarity: CardRarity): number {
    // Fallback power calculation if dynamic calculation fails
    const fallbackRanges = {
      común: { min: 20, max: 35 },
      raro: { min: 30, max: 50 },
      épico: { min: 45, max: 70 },
      legendario: { min: 65, max: 95 }
    };

    const range = fallbackRanges[rarity];
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }

  private generateLevelRange(category: CardCategory, rarity: CardRarity): [number, number] {
    const baseRanges = {
      aritmética: [1, 6],
      álgebra: [3, 10],
      geometría: [2, 8], 
      lógica: [2, 9],
      estadística: [4, 12]
    };

    const rarityAdjustment = {
      común: 0,
      raro: 1,
      épico: 2,
      legendario: 3
    };

    const base = baseRanges[category];
    const adjustment = rarityAdjustment[rarity];
    
    return [base[0] + adjustment, base[1] + adjustment];
  }

  private createFallbackCard(request: DynamicCardRequest): GeneratedCardMetadata {
    return {
      name: "Carta Mágica Misteriosa",
      description: "Artefacto místico envuelto en magia ancestral que aguarda ser descubierto",
      flavor_text: "Cuando la magia falla, la determinación del estudiante brilla más fuerte que cualquier hechizo.",
      base_power: 35,
      rarity: request.rarity,
      category: request.category,
      problem_type_code: 'addition' as ProblemTypeCode,
      level_range: [1, 5],
      art_style: "magia_misteriosa",
      lore: "Esta carta apareció cuando la magia de generación falló, pero su poder educativo permanece intacto.",
      art_prompt: "Mysterious magical card with swirling energy, anime style, educational magic theme",
      magical_element: "magia_misteriosa",
      educational_theme: "perseverancia_educativa",
      backstory: "Nacida del caos mágico, esta carta enseña que el aprendizaje trasciende cualquier obstáculo.",
      power_calculation: {
        problem_type: 'suma',
        base_difficulty: 15,
        cognitive_load: 1,
        rarity_multiplier: 1.0,
        rarity_bonus: 0,
        final_calculation: 'Base 15, Carga Cognitiva 1x, Multiplicador Rareza 1.0x'
      }
    };
  }

  async generateCard(
    problemType: string,
    category: string, 
    rarity: 'común' | 'raro' | 'épico' | 'legendario' = 'común',
    _userPreferences?: any
  ): Promise<DynamicCard> {
    
    // Usar la API de generación dinámica en lugar de plantillas
    const request: DynamicCardRequest = {
      category: category as CardCategory,
      rarity,
      count: 1,
      theme: 'anime-epic-español'
    };
    
    try {
      const result = await this.generateCards(request);
      
      if (result.success && result.cards && result.cards.length > 0) {
        const generatedCard = result.cards[0];
        
        // Mapear problem type a español
        const problemTypeMapping = {
          'addition': { name_es: 'Suma', icon: '➕', color: '#4ECDC4' },
          'subtraction': { name_es: 'Resta', icon: '➖', color: '#45B7D1' },
          'multiplication': { name_es: 'Multiplicación', icon: '✖️', color: '#96CEB4' },
          'division': { name_es: 'División', icon: '➗', color: '#FFEAA7' },
          'fractions': { name_es: 'Fracciones', icon: '⚖️', color: '#DDA0DD' },
          'decimals': { name_es: 'Decimales', icon: '🔢', color: '#98D8C8' },
          'percentages': { name_es: 'Porcentajes', icon: '%', color: '#F7DC6F' },
          'equations': { name_es: 'Ecuaciones', icon: '⚡', color: '#AED6F1' },
          'inequalities': { name_es: 'Desigualdades', icon: '⚖️', color: '#A9DFBF' },
          'polynomials': { name_es: 'Polinomios', icon: '🌊', color: '#D2B4DE' },
          'factorization': { name_es: 'Factorización', icon: '🔬', color: '#F8C471' },
          'area_perimeter': { name_es: 'Área y Perímetro', icon: '📐', color: '#85C1E9' },
          'angles': { name_es: 'Ángulos', icon: '📐', color: '#F0B27A' },
          'triangles': { name_es: 'Triángulos', icon: '🔺', color: '#82E0AA' },
          'circles': { name_es: 'Círculos', icon: '⭕', color: '#F1948A' },
          'patterns': { name_es: 'Patrones', icon: '🔮', color: '#BB8FCE' },
          'sequences': { name_es: 'Secuencias', icon: '🔗', color: '#85C1E9' },
          'deduction': { name_es: 'Deducción', icon: '🕵️', color: '#F8D7DA' },
          'probability': { name_es: 'Probabilidad', icon: '🎲', color: '#D1ECF1' }
        };
        
        const problemData = problemTypeMapping[problemType as keyof typeof problemTypeMapping] || 
                           { name_es: 'Matemáticas', icon: '🧮', color: '#E8F4FD' };
        
        return {
          id: `dynamic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: generatedCard.name,
          description: generatedCard.description,
          rarity,
          category,
          base_power: generatedCard.base_power,
          level_range: generatedCard.level_range,
          lore: generatedCard.lore,
          problem_category: category,
          problem_code: problemType,
          problem_name_es: problemData.name_es,
          problem_difficulty_base: Math.floor(Math.random() * 5) + (rarity === 'legendario' ? 8 : rarity === 'épico' ? 6 : rarity === 'raro' ? 4 : 1),
          problem_icon: problemData.icon,
          problem_color: problemData.color,
          special_ability: generatedCard.special_ability,
          effect_type: undefined,
          effect_power: undefined
        };
      }
    } catch (error) {
      console.error('Error generating card with AI:', error);
    }
    
    // Fallback simple sin plantillas repetitivas
    return {
      id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Artefacto del ${category}`,
      description: 'Una poderosa reliquia matemática',
      rarity,
      category,
      base_power: this.calculateTargetPower(rarity),
      level_range: this.generateLevelRange(category as CardCategory, rarity),
      lore: 'Un artefacto misterioso lleno de sabiduría matemática.',
      problem_category: category,
      problem_code: problemType,
      problem_name_es: 'Matemáticas',
      problem_difficulty_base: 3,
      problem_icon: '🧮',
      problem_color: '#E8F4FD'
    };
  }
  
  async saveCardToDatabase(card: DynamicCard): Promise<boolean> {
    try {
      // Buscar el problem_type_id
      const { data: problemTypes, error: problemError } = await supabase
        .from('cards_problem_types')
        .select('id')
        .eq('name_es', card.problem_name_es)
        .single();
      
      if (problemError) {
        console.error('Error finding problem type:', problemError);
        return false;
      }
      
      const { error } = await supabase
        .from('cards')
        .insert({
          name: card.name,
          description: card.description,
          category: card.category,
          rarity: card.rarity,
          attack_power: card.base_power,
          defense_power: Math.floor(card.base_power * 0.8),
          mana_cost: Math.floor(card.base_power / 100) + 1,
          lore: card.lore,
          problem_type_id: problemTypes.id,
          special_ability: card.special_ability,
          effect_type: card.effect_type,
          effect_power: card.effect_power,
          is_active: true,
          created_at: new Date().toISOString()
        });
      
      return !error;
    } catch (error) {
      console.error('Error saving card:', error);
      return false;
    }
  }

  /**
   * Calculate target power based on rarity
   */
  private calculateTargetPower(rarity: CardRarity): number {
    const powerRanges = {
      común: 150,
      raro: 200,
      épico: 250,
      legendario: 350
    };
    return powerRanges[rarity];
  }
}

export const dynamicCardGenerator = new DynamicCardGenerator(); 