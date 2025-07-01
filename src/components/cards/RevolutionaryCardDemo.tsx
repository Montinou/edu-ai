// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, Clock, Zap, X } from 'lucide-react';
import UniversalCard, { getRarityColorValues } from './UniversalCard';
import type { CardRarity, CardCategory } from '@/types/cards';

interface RevolutionaryCard {
  id: string;
  name: string;
  rarity: CardRarity;
  attack_power: number;
  category: string;
  problem_type_id: number;
  problem_code: string;
  problem_category: CardCategory;
  difficulty_level: number;
  image_url?: string;
  lore?: string;
  description?: string;
}

interface DynamicProblem {
  id: string;
  problem_text: string;
  correct_answer: string;
  hints: string[];
  multiple_choice_options?: string[];
  estimated_time: number;
  explanation: string;
  learning_objective: string;
}

interface PlaySession {
  card: RevolutionaryCard;
  problem: DynamicProblem;
  startTime: number;
  hintsUsed: number;
  userAnswer: string;
  isSubmitted: boolean;
  result?: {
    isCorrect: boolean;
    damage: number;
    feedback: string;
    nextDifficulty: number;
  };
}

// Mock user for demonstration
const DEMO_USER_ID = 'demo-user-123';

export default function RevolutionaryCardDemo() {
  const [cards, setCards] = useState<RevolutionaryCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingCardId, setLoadingCardId] = useState<string | null>(null); // Track which card is loading
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [isConjuring, setIsConjuring] = useState(false);
  const [showParticleExplosion, setShowParticleExplosion] = useState(false);
  const [error, setError] = useState('');
  const [selectedCard, setSelectedCard] = useState<RevolutionaryCard | null>(null);
  const [playSession, setPlaySession] = useState<PlaySession | null>(null);
  const [showHints, setShowHints] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch cards from database
  useEffect(() => {
    const fetchCards = async () => {
      try {
        setCardsLoading(true);
        console.log('🔄 Fetching cards from API...');
        
        const response = await fetch('/api/cards');
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📊 API Response data:', {
          success: data.success,
          cardsCount: data.cards?.length || 0,
          totalCount: data.count,
          firstFewCards: data.cards?.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name }))
        });
        
        if (data.success && data.cards && data.cards.length > 0) {
          // Map database cards to our interface
          const mappedCards: RevolutionaryCard[] = data.cards.map((card: any) => ({
            id: card.id,
            name: card.name,
            rarity: card.rarity || 'common',
            attack_power: card.attack_power || 0,
            category: card.category || 'arithmetic',
            problem_type_id: card.problem_type_id || 1,
            problem_code: getConsistentProblemType(card.category || 'arithmetic', card.problem_type_id || 1),
            problem_category: (card.category || 'arithmetic') as CardCategory,
            difficulty_level: card.difficulty_level || 1,
            image_url: card.image_url,
            lore: card.lore || card.description,
            description: card.description
          }));
          
          console.log(`✅ Successfully loaded ${mappedCards.length} cards from database`);
          setCards(mappedCards);
          setError(''); // Clear any previous errors
        } else {
          console.error('❌ No cards found in database');
          setError('No se pudieron cargar las cartas de la base de datos.');
        }
      } catch (error) {
        console.error('❌ Error fetching cards:', error);
        setError(`Error al cargar las cartas: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setCardsLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Helper function to make problem type consistent with category
  const getConsistentProblemType = (category: string, problemTypeId: number): string => {
    const categoryTypeMapping: Record<string, string[]> = {
      'arithmetic': ['Suma', 'Resta', 'Multiplicación', 'División'],
      'aritmética': ['Suma', 'Resta', 'Multiplicación', 'División'],
      'algebra': ['Ecuaciones', 'Desigualdades', 'Polinomios', 'Factorización'],
      'álgebra': ['Ecuaciones', 'Desigualdades', 'Polinomios', 'Factorización'],
      'geometry': ['Área y Perímetro', 'Ángulos', 'Triángulos', 'Círculos'],
      'geometría': ['Área y Perímetro', 'Ángulos', 'Triángulos', 'Círculos'],
      'logic': ['Patrones', 'Secuencias', 'Deducción', 'Lógica'],
      'lógica': ['Patrones', 'Secuencias', 'Deducción', 'Lógica'],
      'statistics': ['Estadística', 'Probabilidad', 'Fracciones', 'Porcentajes'],
      'estadística': ['Estadística', 'Probabilidad', 'Fracciones', 'Porcentajes']
    };

    const possibleTypes = categoryTypeMapping[category.toLowerCase()] || ['Suma'];
    // Use problem type ID to select from appropriate types, with fallback
    const index = (problemTypeId - 1) % possibleTypes.length;
    return possibleTypes[index];
  };

  const handlePlayCard = async (card: RevolutionaryCard) => {
    try {
      setLoading(true);
      setLoadingCardId(card.id); // Set which card is loading for magical effects
      setSelectedCard(card);
      setError('');

      console.log('🎮 Playing card:', card);

      // Start AI generation phase
      setIsGeneratingProblem(true);

      // Generate dynamic problem using AI - Updated to match API expectations
      const response = await fetch('/api/ai/generate-dynamic-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: card.problem_category || 'aritmética',
          problem_type: card.problem_code || 'suma',
          difficulty: card.difficulty_level || 5,
          playerContext: {
            level: 5,
            currentLevel: 5,
            recentMistakes: [],
            strengths: ['basic_arithmetic'],
            averageResponseTime: 25000,
            accuracy: 0.75,
            sessionProblemsCount: 0,
            weakCategories: [],
            strongCategories: []
          },
          gameContext: {
            battlePhase: 'mid',
            cardsPlayed: 1,
            timeRemaining: 300,
            opponentType: 'training_dummy',
            playerHP: 100,
            opponentHP: 100,
            difficulty_preference: 'adaptive'
          },
          cardInfo: {
            name: card.name,
            rarity: card.rarity || 'común',
            base_power: card.attack_power || 30
          }
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!data.success) {
        console.error('❌ API returned error:', data.error);
        throw new Error(data.error || 'Error al generar el problema');
      }

      // Start conjuring phase
      setIsGeneratingProblem(false);
      setIsConjuring(true);
      
      // Show conjuring effect for 3 seconds
      setTimeout(() => {
        setIsConjuring(false);
        setShowParticleExplosion(true);
        
        // Show particle explosion for 1 second, then open modal
        setTimeout(() => {
          setShowParticleExplosion(false);
          
          // Map the API response to our PlaySession format
          const problemData: buildMathProblemPrompt = {
            id: `problem_${Date.now()}`,
            problem_text: data.problem.problem_text || data.problem.question,
            correct_answer: data.problem.correct_answer || data.problem.answer,
            hints: data.problem.hints || [],
            multiple_choice_options: data.problem.multiple_choice_options || data.problem.options,
            estimated_time: data.problem.estimated_time || 30,
            explanation: data.problem.explanation || '',
            learning_objective: data.problem.learning_objective || ''
          };
          
          const newPlaySession: PlaySession = {
            card,
            problem: problemData,
            startTime: Date.now(),
            hintsUsed: 0,
            userAnswer: '',
            isSubmitted: false
          };

          console.log('✅ Created play session:', newPlaySession);
          setPlaySession(newPlaySession);
          setShowModal(true);
          setShowHints(false);
        }, 1000);
      }, 3000);

    } catch (err) {
      console.error('🚨 Error in handlePlayCard:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el problema');
      
      // Reset states on error
      setIsGeneratingProblem(false);
      setIsConjuring(false);
      setShowParticleExplosion(false);
    } finally {
      setLoading(false);
      setLoadingCardId(null); // Clear loading card ID
    }
  };

  const handleSubmitAnswer = async () => {
    if (!playSession || !playSession.userAnswer.trim()) {
      setError('Por favor ingresa una respuesta');
      return;
    }

    setLoading(true);

    try {
      const responseTime = Date.now() - playSession.startTime;
      
      const response = await fetch('/api/cards/solve-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemId: playSession.problem.id,
          userId: DEMO_USER_ID,
          cardId: playSession.card.id,
          userAnswer: playSession.userAnswer,
          responseTime,
          hintsUsed: playSession.hintsUsed,
          sessionData: {
            problem_text: playSession.problem.problem_text,
            correct_answer: playSession.problem.correct_answer,
            category: playSession.card.problem_category,
            problem_type: playSession.card.problem_code,
            difficulty: playSession.card.difficulty_level,
            estimated_time: playSession.problem.estimated_time,
            explanation: playSession.problem.explanation,
            card: playSession.card
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to submit answer: ${response.statusText}`);
      }

      const result = await response.json();

      setPlaySession(prev => prev ? {
        ...prev,
        isSubmitted: true,
        result: {
          isCorrect: result.is_correct,
          damage: result.damage_calculation.final_damage,
          feedback: result.learning_feedback.encouragement,
          nextDifficulty: result.learning_feedback.next_difficulty
        }
      } : null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = () => {
    if (playSession && !playSession.isSubmitted) {
      setPlaySession(prev => prev ? {
        ...prev,
        hintsUsed: prev.hintsUsed + 1
      } : null);
      setShowHints(true);
    }
  };

  const resetDemo = () => {
    setPlaySession(null);
    setSelectedCard(null);
    setShowHints(false);
    setShowModal(false);
    setLoadingCardId(null); // Clear loading card ID
    setIsGeneratingProblem(false);
    setIsConjuring(false);
    setShowParticleExplosion(false);
  };

  // Modal component for dynamic problems
  const DynamicProblemModal = () => {
    if (!playSession || !showModal) return null;

    return (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowModal(false)}
      >
        {/* Floating magical particles in background */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          initial={{ 
            scale: 0.3, 
            opacity: 0,
            rotateY: -90,
            z: -1000
          }}
          animate={{ 
            scale: 1, 
            opacity: 1,
            rotateY: 0,
            z: 0
          }}
          exit={{ 
            scale: 0.3, 
            opacity: 0,
            rotateY: 90,
            z: -1000
          }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            duration: 0.8
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Magical border effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl border pointer-events-none"
            style={{
              borderColor: `${getRarityColorValues(playSession.card.rarity || 'common').primary}60`,
              background: `linear-gradient(45deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
            }}
            animate={{
              background: [
                `linear-gradient(0deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
                `linear-gradient(90deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
                `linear-gradient(180deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
                `linear-gradient(270deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
                `linear-gradient(360deg, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').primary}15, transparent, ${getRarityColorValues(playSession.card.rarity || 'common').secondary}10, transparent)`,
              ]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Header */}
          <div 
            className="text-white p-6 rounded-t-2xl"
            style={{
              background: `linear-gradient(135deg, ${getRarityColorValues(playSession.card.rarity || 'common').primary}, ${getRarityColorValues(playSession.card.rarity || 'common').secondary})`
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{playSession.card.name}</h2>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Poder: {playSession.card.attack_power}
                  </span>
                  <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                    Dificultad: {playSession.card.difficulty_level}/10
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>~{playSession.problem.estimated_time}s</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
                disabled={loading}
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Problem Content */}
          <div className="p-6">
            {/* Question */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">🧠 Problema Generado por IA:</h3>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 text-lg leading-relaxed">
                  {playSession.problem.problem_text}
                </p>
              </div>
            </div>

            {/* Multiple Choice Options */}
            {playSession.problem.multiple_choice_options && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Opciones:</h4>
                <div className="grid grid-cols-2 gap-3">
                  {playSession.problem.multiple_choice_options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setPlaySession(prev => prev ? { ...prev, userAnswer: option } : null)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        playSession.userAnswer === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                      disabled={loading || playSession.isSubmitted}
                    >
                      {String.fromCharCode(65 + index)}) {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input */}
            {!playSession.problem.multiple_choice_options && (
              <div className="mb-6">
                <label className="block text-md font-semibold text-gray-800 mb-3">
                  Tu respuesta:
                </label>
                <input
                  type="text"
                  value={playSession.userAnswer}
                  onChange={(e) => setPlaySession(prev => prev ? { ...prev, userAnswer: e.target.value } : null)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                  placeholder="Escribe tu respuesta aquí..."
                  disabled={loading || playSession.isSubmitted}
                  onKeyPress={(e) => e.key === 'Enter' && !playSession.isSubmitted && handleSubmitAnswer()}
                />
              </div>
            )}

            {/* Hints */}
            {showHints && playSession.problem.hints.length > 0 && (
              <div className="mb-6">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <h4 className="font-bold text-yellow-800 mb-2">💡 Pistas:</h4>
                  {playSession.problem.hints.slice(0, playSession.hintsUsed).map((hint, index) => (
                    <p key={index} className="text-yellow-700 text-sm mb-1">
                      {index + 1}. {hint}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {playSession.result && (
              <div className={`mb-6 rounded-xl p-6 border-2 ${
                playSession.result.isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="text-center space-y-4">
                  <div className="text-4xl">
                    {playSession.result.isCorrect ? '🎉' : '😅'}
                  </div>
                  
                  <h3 className={`text-xl font-bold ${
                    playSession.result.isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {playSession.result.isCorrect ? '¡Correcto!' : 'Incorrecto'}
                  </h3>

                  <p className={`${
                    playSession.result.isCorrect ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {playSession.result.feedback}
                  </p>

                  {playSession.problem.explanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                      <h4 className="font-bold text-blue-800 mb-2">📚 Explicación:</h4>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        {playSession.problem.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!playSession.isSubmitted ? (
              <div className="flex space-x-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!playSession.userAnswer.trim() || loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-green-700 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Verificando...</span>
                    </div>
                  ) : (
                    '✅ Enviar Respuesta'
                  )}
                </button>
                
                {playSession.hintsUsed < playSession.problem.hints.length && (
                  <button
                    onClick={handleUseHint}
                    className="bg-yellow-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-yellow-600 transition-all"
                  >
                    💡 Pista ({playSession.hintsUsed + 1})
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={resetDemo}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                🔄 Probar Otra Carta
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎴 Revolución de Cartas Dinámicas
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Las cartas ya no contienen problemas estáticos. Ahora tienen <strong>etiquetas</strong> que generan 
          problemas matemáticos personalizados usando IA, adaptados a tu perfil de aprendizaje en tiempo real.
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <span className="flex items-center space-x-1 text-green-600">
            <Brain className="w-4 h-4" />
            <span>IA Personalizada</span>
          </span>
          <span className="flex items-center space-x-1 text-blue-600">
            <Target className="w-4 h-4" />
            <span>Dificultad Adaptiva</span>
          </span>
          <span className="flex items-center space-x-1 text-purple-600">
            <Zap className="w-4 h-4" />
            <span>Generación Dinámica</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          ❌ {error}
        </div>
      )}

      {/* Card Selection */}
      {cardsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Cargando cartas...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <UniversalCard
              key={card.id}
              id={card.id}
              name={card.name}
              rarity={card.rarity || 'common'}
              attack_power={card.attack_power}
              category={card.category}
              difficulty_level={card.difficulty_level}
              image_url={card.image_url}
              description={card.description}
              size="large"
              showPlayButton={false}
              isSelected={selectedCard?.id === card.id}
              isLoading={loadingCardId === card.id && (isGeneratingProblem || isConjuring)}
              canPlay={loadingCardId === null}
              loadingText={isConjuring ? "Conjurando" : "🤖 IA Generando"}
              onClick={() => {
                if (loadingCardId === null) {
                  handlePlayCard(card);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Particle Explosion Effect */}
      {showParticleExplosion && selectedCard && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                background: `radial-gradient(circle, #fbbf24, #f59e0b)`,
                boxShadow: '0 0 15px #fbbf24'
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1.5, 0],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                opacity: [1, 1, 0]
              }}
              transition={{
                duration: 1,
                ease: "easeOut",
                delay: i * 0.02
              }}
            />
          ))}
          
          {/* Central Burst */}
          <motion.div
            className="absolute w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8), rgba(245, 158, 11, 0.4), transparent)',
              boxShadow: '0 0 60px #fbbf24'
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          
          {/* Success Text */}
          <motion.div
            className="absolute text-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-yellow-300 mb-2" style={{
              textShadow: '0 0 20px #fbbf24, 2px 2px 4px rgba(0,0,0,0.8)',
              fontFamily: 'var(--font-cinzel), serif'
            }}>
              ¡PROBLEMA GENERADO!
            </h2>
            <p className="text-yellow-200" style={{
              textShadow: '0 0 10px #fbbf24, 1px 1px 3px rgba(0,0,0,0.8)'
            }}>
              ⚡ Preparándose para el desafío ⚡
            </p>
          </motion.div>
        </div>
      )}

      {/* Revolution Features */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🚀 ¿Qué hace esta revolución especial?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h3 className="font-bold text-blue-600 flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>Problemas Dinámicos</span>
            </h3>
            <p className="text-sm text-gray-600">
              Cada carta genera problemas únicos usando IA, nunca verás el mismo problema dos veces.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-green-600 flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Personalización</span>
            </h3>
            <p className="text-sm text-gray-600">
              Los problemas se adaptan a tu perfil: fortalezas, debilidades y nivel de habilidad.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-purple-600 flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Aprendizaje Continuo</span>
            </h3>
            <p className="text-sm text-gray-600">
              El sistema aprende de cada respuesta para mejorar la experiencia educativa.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Problem Modal */}
      <AnimatePresence>
        <DynamicProblemModal />
      </AnimatePresence>
    </div>
  );
} 