'use client';

import React, { useState } from 'react';
import { DynamicCard } from '@/components/cards/DynamicCard';
import { SpecialEffectCard } from '@/components/cards/SpecialEffectCard';
import type { CardCategory, ProblemTypeCode, CardRarity, DynamicCard as DynamicCardType } from '@/types/dynamicCards';

interface ThematicBatch {
  theme: string;
  cards: DynamicCardType[];
  theme_story: string;
  learning_objectives: string[];
  estimated_playtime: number;
  difficulty_range: [number, number];
  suggested_sequence: string[];
}

interface StoryChapter {
  chapter_number: number;
  title: string;
  content: string;
  narrative?: string;
  problem_type: ProblemTypeCode;
  difficulty: number;
  mathematical_challenge?: {
    problem_text: string;
    correct_answer: string;
  };
  [key: string]: unknown;
}

interface StoryProblem {
  story_id: string;
  title: string;
  character: string;
  scenario: string;
  total_chapters: number;
  chapters: StoryChapter[];
  learning_objectives: string[];
  story_summary: string;
  difficulty_progression: number[];
  estimated_time: number;
  moral_lesson?: string;
}

export default function DynamicCreatorPage() {
  const [activeTab, setActiveTab] = useState<'themed-batch' | 'story-problem' | 'special-cards'>('themed-batch');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ThematicBatch | StoryProblem | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for themed batch generation
  const [themeForm, setThemeForm] = useState({
    theme: 'Piratas Matemáticos',
    card_count: 6,
    student_level: 5,
    target_categories: ['aritmética'] as CardCategory[],
    difficulty_spread: 'balanced' as 'focused' | 'balanced' | 'progressive',
    rarity_distribution: 'pyramid' as 'equal' | 'pyramid' | 'custom',
    special_mechanics: true
  });

  // Form states for story problem generation  
  const [storyForm, setStoryForm] = useState({
    scenario: 'detective mystery',
    character_name: 'Detective Álgebra',
    mathematical_concept: 'fractions' as ProblemTypeCode,
    category: 'aritmética' as CardCategory,
    difficulty: 5,
    student_level: 6,
    problem_count: 3,
    interactive_choices: true,
    language: 'es' as 'es' | 'en'
  });

  // Example special effect cards
  const exampleSpecialCards = [
    {
      id: 'special_1',
      name: 'Rayo Multiplicador',
      description: 'Multiplica el daño de las próximas 3 cartas',
      rarity: 'épico' as CardRarity,
      category: 'aritmética',
      base_power: 75,
      level_range: [4, 8],
      lore: 'Un poder ancestral que amplifica las matemáticas',
      problem_category: 'aritmética' as CardCategory,
      problem_code: 'multiplication' as ProblemTypeCode,
      problem_name_es: 'Multiplicación Potenciada',
      problem_difficulty_base: 6,
      problem_icon: '⚡',
      problem_color: '#4ECDC4',
      special_ability: 'Multiplica el daño de las próximas 3 cartas por 1.5',
      effect_type: 'bonus_multiplier' as const,
      effect_duration: 5,
      effect_intensity: 3
    },
    {
      id: 'special_2', 
      name: 'Escudo Protector',
      description: 'Reduce la dificultad de problemas complejos',
      rarity: 'raro' as CardRarity,
      category: 'lógica',
      base_power: 50,
      level_range: [3, 7],
      lore: 'Un escudo mágico que simplifica los desafíos',
      problem_category: 'lógica' as CardCategory,
      problem_code: 'logic' as ProblemTypeCode,
      problem_name_es: 'Protección Lógica',
      problem_difficulty_base: 4,
      problem_icon: '🛡️',
      problem_color: '#F8B500',
      special_ability: 'Reduce la dificultad de los próximos problemas en 2 niveles',
      effect_type: 'protection' as const,
      effect_duration: 8,
      effect_intensity: 2
    },
    {
      id: 'special_3',
      name: 'Bomba de Tiempo',
      description: 'Resolver rápido otorga bonificación extra',
      rarity: 'legendario' as CardRarity,
      category: 'estadística', 
      base_power: 100,
      level_range: [6, 10],
      lore: 'El tiempo es poder en las manos correctas',
      problem_category: 'estadística' as CardCategory,
      problem_code: 'probability' as ProblemTypeCode,
      problem_name_es: 'Presión Temporal',
      problem_difficulty_base: 8,
      problem_icon: '⏰',
      problem_color: '#FF6B6B',
      special_ability: 'Resuelve en menos de 10 segundos para daño crítico',
      effect_type: 'time_pressure' as const,
      effect_duration: 10,
      effect_intensity: 4
    }
  ];

  const generateThematicBatch = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-themed-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(themeForm),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.batch);
      } else {
        setError(data.error || 'Error al generar el lote temático');
      }
    } catch (err) {
      setError('Error de conexión al generar el lote temático');
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStoryProblem = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/generate-story-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyForm),
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedContent(data.story_problem);
      } else {
        setError(data.error || 'Error al generar la historia problema');
      }
    } catch (err) {
      setError('Error de conexión al generar la historia problema');
      console.error('Error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const presetThemes = [
    'Piratas Matemáticos',
    'Reino de Fracciones',
    'Aventura Espacial',
    'Laboratorio de Ciencias',
    'Castillo de Geometría',
    'Bosque de Probabilidades',
    'Ciudad de Álgebra',
    'Océano de Estadísticas'
  ];

  const presetScenarios = [
    'detective mystery',
    'space adventure',
    'cooking challenge',
    'treasure hunt',
    'time travel',
    'superhero mission',
    'magical kingdom',
    'scientific expedition'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Creador Dinámico de Cartas y Problemas
          </h1>
          <p className="text-blue-200 text-lg">
            Genera contenido educativo personalizado con IA
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab('themed-batch')}
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'themed-batch'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-blue-200 hover:text-white hover:bg-blue-600'
              }`}
            >
              🎯 Lotes Temáticos
            </button>
            <button
              onClick={() => setActiveTab('story-problem')}
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'story-problem'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'text-green-200 hover:text-white hover:bg-green-600'
              }`}
            >
              📚 Historias Problema
            </button>
            <button
              onClick={() => setActiveTab('special-cards')}
              className={`px-6 py-3 rounded-md transition-all duration-300 ${
                activeTab === 'special-cards'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-purple-200 hover:text-white hover:bg-purple-600'
              }`}
            >
              ✨ Cartas Especiales
            </button>
          </div>
        </div>

        {/* Content Based on Active Tab */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel - Forms */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
            
            {activeTab === 'themed-batch' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">🎯 Generador de Lotes Temáticos</h2>
                
                <div className="space-y-4">
                  {/* Theme Selection */}
                  <div>
                    <label className="block text-blue-200 mb-2">Tema:</label>
                    <select
                      value={themeForm.theme}
                      onChange={(e) => setThemeForm({...themeForm, theme: e.target.value})}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-blue-300"
                    >
                      {presetThemes.map(theme => (
                        <option key={theme} value={theme} className="text-gray-900">{theme}</option>
                      ))}
                    </select>
                  </div>

                  {/* Card Count */}
                  <div>
                    <label className="block text-blue-200 mb-2">Número de Cartas: {themeForm.card_count}</label>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={themeForm.card_count}
                      onChange={(e) => setThemeForm({...themeForm, card_count: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Student Level */}
                  <div>
                    <label className="block text-blue-200 mb-2">Nivel del Estudiante: {themeForm.student_level}</label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={themeForm.student_level}
                      onChange={(e) => setThemeForm({...themeForm, student_level: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Difficulty Spread */}
                  <div>
                    <label className="block text-blue-200 mb-2">Distribución de Dificultad:</label>
                    <select
                      value={themeForm.difficulty_spread}
                      onChange={(e) => setThemeForm({...themeForm, difficulty_spread: e.target.value as 'focused' | 'balanced' | 'progressive'})}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-blue-300"
                    >
                      <option value="focused" className="text-gray-900">Concentrada</option>
                      <option value="balanced" className="text-gray-900">Balanceada</option>
                      <option value="progressive" className="text-gray-900">Progresiva</option>
                    </select>
                  </div>

                  {/* Special Mechanics */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={themeForm.special_mechanics}
                      onChange={(e) => setThemeForm({...themeForm, special_mechanics: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-blue-200">Incluir mecánicas especiales</label>
                  </div>

                  <button
                    onClick={generateThematicBatch}
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-all duration-300 font-semibold"
                  >
                    {isGenerating ? '🔄 Generando...' : '🎯 Generar Lote Temático'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'story-problem' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">📚 Generador de Historias Problema</h2>
                
                <div className="space-y-4">
                  {/* Scenario */}
                  <div>
                    <label className="block text-green-200 mb-2">Escenario:</label>
                    <select
                      value={storyForm.scenario}
                      onChange={(e) => setStoryForm({...storyForm, scenario: e.target.value})}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-green-300"
                    >
                      {presetScenarios.map(scenario => (
                        <option key={scenario} value={scenario} className="text-gray-900">{scenario}</option>
                      ))}
                    </select>
                  </div>

                  {/* Character Name */}
                  <div>
                    <label className="block text-green-200 mb-2">Nombre del Protagonista:</label>
                    <input
                      type="text"
                      value={storyForm.character_name}
                      onChange={(e) => setStoryForm({...storyForm, character_name: e.target.value})}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-green-300"
                      placeholder="Ej: Detective Álgebra"
                    />
                  </div>

                  {/* Mathematical Concept */}
                  <div>
                    <label className="block text-green-200 mb-2">Concepto Matemático:</label>
                    <select
                      value={storyForm.mathematical_concept}
                      onChange={(e) => setStoryForm({...storyForm, mathematical_concept: e.target.value as ProblemTypeCode})}
                      className="w-full p-3 rounded-lg bg-white bg-opacity-20 text-white border border-green-300"
                    >
                      <option value="fractions" className="text-gray-900">Fracciones</option>
                      <option value="addition" className="text-gray-900">Suma</option>
                      <option value="multiplication" className="text-gray-900">Multiplicación</option>
                      <option value="equations" className="text-gray-900">Ecuaciones</option>
                      <option value="area_perimeter" className="text-gray-900">Área y Perímetro</option>
                      <option value="probability" className="text-gray-900">Probabilidad</option>
                    </select>
                  </div>

                  {/* Problem Count */}
                  <div>
                    <label className="block text-green-200 mb-2">Número de Capítulos: {storyForm.problem_count}</label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={storyForm.problem_count}
                      onChange={(e) => setStoryForm({...storyForm, problem_count: parseInt(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  {/* Interactive Choices */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storyForm.interactive_choices}
                      onChange={(e) => setStoryForm({...storyForm, interactive_choices: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-green-200">Incluir opciones interactivas</label>
                  </div>

                  <button
                    onClick={generateStoryProblem}
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-all duration-300 font-semibold"
                  >
                    {isGenerating ? '🔄 Generando...' : '📚 Generar Historia Problema'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'special-cards' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">✨ Cartas con Efectos Especiales</h2>
                <p className="text-purple-200 mb-4">
                  Estas cartas tienen mecánicas únicas que afectan el gameplay de maneras especiales.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-purple-500 bg-opacity-20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">🎮 Tipos de Efectos Disponibles:</h3>
                    <ul className="text-purple-200 space-y-1">
                      <li>⏰ <strong>Presión de Tiempo:</strong> Bonificación por velocidad</li>
                      <li>✨ <strong>Multiplicador:</strong> Amplifica el daño</li>
                      <li>⚡ <strong>Reacción en Cadena:</strong> Efectos acumulativos</li>
                      <li>🔄 <strong>Transformación:</strong> Cambia otras cartas</li>
                      <li>🛡️ <strong>Protección:</strong> Reduce dificultad</li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-500 bg-opacity-20 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">🎯 Cómo Usar:</h3>
                    <p className="text-purple-200 text-sm">
                      Haz clic en las cartas especiales de la derecha para activar sus efectos.
                      Observa las animaciones y partículas especiales que indican cuando están activas.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
                <p className="text-red-200">❌ {error}</p>
              </div>
            )}
          </div>

          {/* Right Panel - Results */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
            
            {activeTab === 'special-cards' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🎮 Cartas Especiales de Ejemplo</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                  {exampleSpecialCards.map((card, _index) => (
                    <SpecialEffectCard
                      key={card.id}
                      card={card}
                      size="medium"
                      isPlaying={true}
                      onEffectTrigger={(effect) => {
                        console.log('Effect triggered:', effect);
                        // You could show a toast notification here
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'themed-batch' || activeTab === 'story-problem') && !generatedContent && (
              <div className="text-center text-white opacity-60 mt-20">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-lg">El contenido generado aparecerá aquí</p>
                <p className="text-sm mt-2">Configura los parámetros y presiona generar</p>
              </div>
            )}

            {generatedContent && activeTab === 'themed-batch' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">🎯 Lote Temático Generado</h3>
                <div className="mb-4 p-4 bg-blue-500 bg-opacity-20 rounded-lg">
                  <h4 className="font-semibold text-blue-100">{(generatedContent as ThematicBatch).theme}</h4>
                  <p className="text-blue-200 text-sm mt-1">{(generatedContent as ThematicBatch).theme_story}</p>
                  <p className="text-blue-200 text-xs mt-2">
                    🎯 {(generatedContent as ThematicBatch).learning_objectives?.join(', ')}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {(generatedContent as ThematicBatch).cards?.map((card, index) => (
                    <DynamicCard
                      key={index}
                      card={card}
                      size="medium"
                      playable={true}
                    />
                  ))}
                </div>
              </div>
            )}

            {generatedContent && activeTab === 'story-problem' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">📚 Historia Problema Generada</h3>
                <div className="mb-4 p-4 bg-green-500 bg-opacity-20 rounded-lg">
                  <h4 className="font-semibold text-green-100">{(generatedContent as StoryProblem).title}</h4>
                  <p className="text-green-200 text-sm mt-1">{(generatedContent as StoryProblem).story_summary}</p>
                  <p className="text-green-200 text-xs mt-2">
                    👤 Protagonista: {(generatedContent as StoryProblem).character} | 
                    ⏱️ Tiempo estimado: {(generatedContent as StoryProblem).estimated_time} min
                  </p>
                  {(generatedContent as StoryProblem).moral_lesson && (
                    <p className="text-green-200 text-xs mt-1 italic">
                      💡 Moraleja: {(generatedContent as StoryProblem).moral_lesson}
                    </p>
                  )}
                </div>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {(generatedContent as StoryProblem).chapters?.map((chapter, index) => (
                    <div key={index} className="bg-white bg-opacity-10 rounded-lg p-4">
                      <h5 className="font-semibold text-white mb-2">
                        Capítulo {chapter.chapter_number}: {chapter.title}
                      </h5>
                      <p className="text-gray-200 text-sm mb-3">{chapter.narrative}</p>
                      <div className="bg-yellow-500 bg-opacity-20 rounded p-3">
                        <p className="text-yellow-100 text-sm font-medium">
                          🧮 Desafío: {chapter.mathematical_challenge?.problem_text}
                        </p>
                        <p className="text-yellow-200 text-xs mt-1">
                          ✅ Respuesta: {chapter.mathematical_challenge?.correct_answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 