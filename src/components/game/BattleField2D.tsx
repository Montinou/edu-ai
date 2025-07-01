'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, 
  Shield, 
  Heart, 
  Clock, 
  Star, 
  Play,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import UniversalCard from '@/components/cards/UniversalCard';
import type { Card } from '@/types/cards';

interface BattleCard extends Card {
  currentHp?: number;
  maxHp?: number;
  isPlayed?: boolean;
  position?: 'hand' | 'field' | 'graveyard';
}

interface Player {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  hand: BattleCard[];
  field: BattleCard[];
  graveyard: BattleCard[];
}

interface BattleState {
  player: Player;
  enemy: Player;
  currentTurn: 'player' | 'enemy';
  turnCount: number;
  phase: 'preparation' | 'battle' | 'resolution' | 'ended';
  winner: string | null;
}

interface ProblemChallenge {
  card: BattleCard;
  problem: {
    question: string;
    answer: string | number;
    options?: string[];
    type: 'math' | 'logic';
    difficulty: number;
    timeLimit: number;
  };
  isActive: boolean;
}

export function BattleField2D() {
  const { user } = useAuth();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedCard, setSelectedCard] = useState<BattleCard | null>(null);
  const [centerCard, setCenterCard] = useState<BattleCard | null>(null);
  const [problemChallenge, setProblemChallenge] = useState<ProblemChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [isConjuring, setIsConjuring] = useState(false);
  const [showParticleExplosion, setShowParticleExplosion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playerAnswer, setPlayerAnswer] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(0);

  // Initialize battle
  useEffect(() => {
    if (user) {
      initializeBattle();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Timer for problem challenges
  useEffect(() => {
    if (problemChallenge?.isActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && problemChallenge?.isActive) {
      handleTimeUp();
    }
    // Return nothing for consistency - no cleanup needed for the else if case
    return undefined;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, problemChallenge]);

  const initializeBattle = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('Usuario no autenticado o sin ID válido');
      }

      // Get player's cards using the same API as card-revolution but with user_id
      const playerCardsResponse = await fetch(`/api/cards?limit=10&user_id=${user.id}`);
      console.log('📡 Player cards response status:', playerCardsResponse.status);
      
      if (!playerCardsResponse.ok) {
        throw new Error(`Error ${playerCardsResponse.status}: ${playerCardsResponse.statusText}`);
      }
      
      const playerCardsData = await playerCardsResponse.json();
      console.log('📊 Player cards data:', {
        success: playerCardsData.success,
        cardsCount: playerCardsData.cards?.length || 0,
        user_id: playerCardsData.user_id
      });
      
      if (!playerCardsData.success) {
        throw new Error('Error al cargar las cartas del usuario');
      }
      
      if (!playerCardsData.cards || playerCardsData.cards.length === 0) {
        throw new Error('No tienes cartas en tu colección. Necesitas que se ejecute el script de migración para asignar cartas a tu usuario.');
      }

      // Map cards to our interface (same as card-revolution)
      const playerCards = playerCardsData.cards.slice(0, 5).map((card: any): BattleCard => ({
        id: card.id,
        name: card.name,
        description: card.description || '',
        type: card.category || 'math',
        rarity: card.rarity || 'common',
        power: card.attack_power || 0,
        cost: card.cost || 1,
        problem: {
          question: '',
          answer: '',
          operation: 'addition',
          difficulty: card.difficulty_level || 1,
          timeLimit: 30,
          hints: [],
          explanation: '',
          type: 'math'
        } as any,
        effects: [],
        artwork: {
          style: 'default',
          background: '#ffffff',
          foreground: '#000000',
          image: ''
        } as any,
        unlocked: true,
        image_url: card.image_url
      }));
      
      // Get enemy cards (using same API)
      const enemyCardsResponse = await fetch('/api/cards?limit=8');
      if (!enemyCardsResponse.ok) {
        throw new Error('Error al cargar cartas enemigas');
      }
      
      const enemyCardsData = await enemyCardsResponse.json();
      const enemyCards = enemyCardsData.cards.slice(0, 5).map((card: any): BattleCard => ({
        id: card.id,
        name: card.name,
        description: card.description || '',
        type: card.category || 'math',
        rarity: card.rarity || 'common',
        power: card.attack_power || 0,
        cost: card.cost || 1,
        problem: {
          question: '',
          answer: '',
          operation: 'addition',
          difficulty: card.difficulty_level || 1,
          timeLimit: 30,
          hints: [],
          explanation: '',
          type: 'math'
        } as any,
        effects: [],
        artwork: {
          style: 'default',
          background: '#ffffff',
          foreground: '#000000',
          image: ''
        } as any,
        unlocked: true,
        image_url: card.image_url
      }));

      // Create battle state
      const newBattleState: BattleState = {
        player: {
          id: user!.id,
          name: (user as any).name || (user as any).username || 'Jugador',
          hp: 100,
          maxHp: 100,
          hand: playerCards.map((card: BattleCard) => ({
            ...card,
            currentHp: card.power,
            maxHp: card.power,
            position: 'hand' as const
          })),
          field: [],
          graveyard: []
        },
        enemy: {
          id: 'enemy-ai',
          name: 'Oponente IA',
          hp: 100,
          maxHp: 100,
          hand: enemyCards.map((card: BattleCard) => ({
            ...card,
            currentHp: card.power,
            maxHp: card.power,
            position: 'hand' as const
          })),
          field: [],
          graveyard: []
        },
        currentTurn: 'player',
        turnCount: 1,
        phase: 'preparation',
        winner: null
      };

      setBattleState(newBattleState);
    } catch (error) {
      console.error('Error initializing battle:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido al inicializar la batalla');
    } finally {
      setIsLoading(false);
    }
  };

  const playCard = async (card: BattleCard) => {
    if (!battleState || battleState.currentTurn !== 'player' || problemChallenge) return;

    setSelectedCard(card);
    setCenterCard(card);
    setError(null);

    // Wait for card to slide to center (1 second)
    setTimeout(async () => {
      try {
        setIsGeneratingProblem(true);
        
        console.log('🎮 Playing card:', card);

        // Generate dynamic problem using AI - Same API as card-revolution
        const response = await fetch('/api/ai/generate-dynamic-problem', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category: card.type || 'aritmética',
            problem_type: 'suma', // Default to suma for now
            difficulty: card.power || 5,
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
              cardsPlayed: battleState.player.field.length + 1,
              timeRemaining: 300,
              opponentType: 'ai_opponent',
              playerHP: battleState.player.hp,
              opponentHP: battleState.enemy.hp,
              difficulty_preference: 'adaptive'
            },
            cardInfo: {
              name: card.name,
              rarity: card.rarity || 'común',
              base_power: card.power || 30
            }
          }),
        });

        console.log('📡 Response status:', response.status);

        let challenge: ProblemChallenge;

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

        // Create problem challenge with dynamic AI-generated content
        challenge = {
          card,
          problem: {
            question: data.problem.problem_text || data.problem.question,
            answer: data.problem.correct_answer || data.problem.answer,
            options: data.problem.multiple_choice_options || data.problem.options,
            type: 'math',
            difficulty: card.power || 1,
            timeLimit: data.problem.estimated_time || 30
          },
          isActive: false // Start as inactive for conjuring phase
        };

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
            setCenterCard(null);
            setProblemChallenge({ ...challenge, isActive: true });
            setTimeLeft(challenge.problem.timeLimit);
            setPlayerAnswer('');
          }, 1000);
        }, 3000);

      } catch (err) {
        console.error('🚨 Error in playCard:', err);
        setError(err instanceof Error ? err.message : 'Error al generar el problema');
        
        // Fallback to simple problem if AI fails - also with conjuring
        const challenge: ProblemChallenge = {
          card,
          problem: generateFallbackProblem(card),
          isActive: false
        };
        
        setIsGeneratingProblem(false);
        setIsConjuring(true);
        
        setTimeout(() => {
          setIsConjuring(false);
          setShowParticleExplosion(true);
          
          setTimeout(() => {
            setShowParticleExplosion(false);
            setCenterCard(null);
            setProblemChallenge({ ...challenge, isActive: true });
            setTimeLeft(challenge.problem.timeLimit);
            setPlayerAnswer('');
          }, 1000);
        }, 3000);
      }
    }, 1000);
  };

  const generateFallbackProblem = (card: BattleCard) => {
    // Simple fallback problem if AI service fails
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    const question = `¿Cuánto es ${num1} + ${num2}?`;
    
    const wrongAnswers = [
      answer + 1,
      answer - 1,
      answer + 2
    ].filter(a => a !== answer && a > 0).slice(0, 3);
    
    const options = [answer.toString(), ...wrongAnswers.map(a => a.toString())]
      .sort(() => Math.random() - 0.5);

    return {
      question,
      answer: answer.toString(),
      options,
      type: 'math' as const,
      difficulty: card.power || 1,
      timeLimit: 30
    };
  };

  const handleAnswerSubmit = () => {
    if (!problemChallenge || !battleState) return;

    const isCorrect = playerAnswer === problemChallenge.problem.answer.toString();
    
    if (isCorrect) {
      // Move card to field and deal damage
      const updatedBattleState = { ...battleState };
      const cardIndex = updatedBattleState.player.hand.findIndex(c => c.id === problemChallenge.card.id);
      
      if (cardIndex >= 0) {
        const playedCard = { ...updatedBattleState.player.hand[cardIndex] };
        playedCard.position = 'field';
        playedCard.isPlayed = true;
        
        // Remove from hand and add to field
        updatedBattleState.player.hand.splice(cardIndex, 1);
        updatedBattleState.player.field.push(playedCard);
        
        // Deal damage to enemy
        updatedBattleState.enemy.hp = Math.max(0, updatedBattleState.enemy.hp - playedCard.power!);
        
        // Check for win condition
        if (updatedBattleState.enemy.hp <= 0) {
          updatedBattleState.phase = 'ended';
          updatedBattleState.winner = 'player';
        }
        
        setBattleState(updatedBattleState);
      }
    } else {
      // Incorrect answer: player takes damage
      const updatedBattleState = { ...battleState };
      updatedBattleState.player.hp = Math.max(0, updatedBattleState.player.hp - 10);
      
      if (updatedBattleState.player.hp <= 0) {
        updatedBattleState.phase = 'ended';
        updatedBattleState.winner = 'enemy';
      }
      
      setBattleState(updatedBattleState);
    }

    // End turn and clear challenge
    endPlayerTurn();
    setProblemChallenge(null);
    setSelectedCard(null);
    setCenterCard(null);
    setIsGeneratingProblem(false);
    setIsConjuring(false);
    setShowParticleExplosion(false);
  };

  const handleTimeUp = () => {
    // Time up is treated as wrong answer
    if (battleState) {
      const updatedBattleState = { ...battleState };
      updatedBattleState.player.hp = Math.max(0, updatedBattleState.player.hp - 15);
      
      if (updatedBattleState.player.hp <= 0) {
        updatedBattleState.phase = 'ended';
        updatedBattleState.winner = 'enemy';
      }
      
      setBattleState(updatedBattleState);
    }

    endPlayerTurn();
    setProblemChallenge(null);
    setSelectedCard(null);
    setCenterCard(null);
    setIsGeneratingProblem(false);
    setIsConjuring(false);
    setShowParticleExplosion(false);
  };

  const endPlayerTurn = () => {
    if (!battleState) return;

    // Simple AI turn: play a random card
    setTimeout(() => {
      const updatedBattleState = { ...battleState };
      updatedBattleState.currentTurn = 'enemy';
      
      if (updatedBattleState.enemy.hand.length > 0) {
        const randomCardIndex = Math.floor(Math.random() * updatedBattleState.enemy.hand.length);
        const enemyCard = updatedBattleState.enemy.hand[randomCardIndex];
        
        // Move enemy card to field
        enemyCard.position = 'field';
        enemyCard.isPlayed = true;
        updatedBattleState.enemy.hand.splice(randomCardIndex, 1);
        updatedBattleState.enemy.field.push(enemyCard);
        
        // Deal damage to player
        updatedBattleState.player.hp = Math.max(0, updatedBattleState.player.hp - enemyCard.power!);
        
        if (updatedBattleState.player.hp <= 0) {
          updatedBattleState.phase = 'ended';
          updatedBattleState.winner = 'enemy';
        }
      }
      
      // End enemy turn
      updatedBattleState.currentTurn = 'player';
      updatedBattleState.turnCount++;
      
      setBattleState(updatedBattleState);
    }, 2000);
  };

  const resetBattle = () => {
    setProblemChallenge(null);
    setSelectedCard(null);
    setCenterCard(null);
    setIsGeneratingProblem(false);
    setIsConjuring(false);
    setShowParticleExplosion(false);
    initializeBattle();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Preparando Batalla</h2>
          <p className="text-blue-200">Cargando cartas y configurando el campo...</p>
        </motion.div>
      </div>
    );
  }

  if (!battleState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="max-w-md text-center text-white p-6">
          <h2 className="text-2xl font-bold mb-4">Error al cargar la batalla</h2>
          
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
              <p className="text-red-200 text-sm mb-2">{error}</p>
              {error.includes('colección') && (
                <div className="text-xs text-red-300 mt-3 p-3 bg-red-800/30 rounded">
                  <p className="font-medium mb-2">💡 ¿Qué significa esto?</p>
                  <p className="mb-2">El sistema de batalla requiere que tengas cartas asignadas en tu colección personal.</p>
                  <p className="font-medium mb-1">🔧 Solución:</p>
                  <p>Ejecuta el script de migración SQL para crear la tabla user_collection y asignar cartas a tu usuario ({user?.email}).</p>
                </div>
              )}
            </div>
          )}
          
          <div className="space-y-3">
            <button
              onClick={initializeBattle}
              className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Reintentar'}
            </button>
            
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 50 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Battle UI */}
      <div className="relative z-10 p-4 h-screen flex flex-col">
        {/* Top Bar - Enemy Info */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-red-600/20 backdrop-blur-sm rounded-lg p-3 border border-red-500/30">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-400" />
                <span className="text-white font-bold">{battleState.enemy.name}</span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-32 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(battleState.enemy.hp / battleState.enemy.maxHp) * 100}%` }}
                  />
                </div>
                <span className="text-white text-sm">{battleState.enemy.hp}/{battleState.enemy.maxHp}</span>
              </div>
            </div>
          </div>

          {/* Turn Indicator */}
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className="text-white text-sm">Turno {battleState.turnCount}</div>
              <div className={`text-lg font-bold ${
                battleState.currentTurn === 'player' ? 'text-blue-400' : 'text-red-400'
              }`}>
                {battleState.currentTurn === 'player' ? 'Tu Turno' : 'Turno Enemigo'}
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetBattle}
            className="bg-gray-600/20 backdrop-blur-sm rounded-lg p-3 border border-gray-500/30 text-white hover:bg-gray-600/40 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Battle Field - Enemy */}
        <div className="mb-4">
          <h3 className="text-white text-sm mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-1" />
            Campo Enemigo ({battleState.enemy.field.length})
          </h3>
          <div className="flex space-x-2 min-h-[120px] bg-red-900/20 rounded-lg p-2 border border-red-500/30">
            {battleState.enemy.field.map((card, index) => (
              <EnemyFieldCard key={`${card.id}-${index}`} card={card} />
            ))}
          </div>
        </div>

        {/* Center - Battle Actions */}
        <div className="flex-1 flex items-center justify-center relative">
          {battleState.phase === 'ended' ? (
            <motion.div
              className="text-center text-white bg-black/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="text-6xl mb-4">
                {battleState.winner === 'player' ? '🏆' : '💀'}
              </div>
              <h2 className="text-3xl font-bold mb-2">
                {battleState.winner === 'player' ? '¡Victoria!' : 'Derrota'}
              </h2>
              <p className="text-xl mb-6">
                {battleState.winner === 'player' 
                  ? '¡Has demostrado tu dominio matemático!' 
                  : 'No te rindas, inténtalo de nuevo'}
              </p>
              <button
                onClick={resetBattle}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-lg flex items-center space-x-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                <span>Nueva Batalla</span>
              </button>
            </motion.div>
          ) : centerCard ? (
            <div className="relative">
              {/* Centered Card with Effects */}
              <motion.div
                initial={{ scale: 0.8, x: 0, y: 200 }}
                animate={{ scale: 1.2, x: 0, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-20"
              >
                <UniversalCard
                  id={centerCard.id}
                  name={centerCard.name}
                  rarity={centerCard.rarity}
                  attack_power={centerCard.power || 0}
                  category={centerCard.type}
                  difficulty_level={centerCard.problem?.difficulty || 1}
                  image_url={centerCard.image_url}
                  description={centerCard.description}
                  size="large"
                  showPlayButton={false}
                  isSelected={false}
                  isLoading={isGeneratingProblem || isConjuring}
                  canPlay={false}
                  loadingText={isConjuring ? "Conjurando" : "🤖 IA Generando"}
                />
              </motion.div>

              {/* Particle Explosion Effect */}
              {showParticleExplosion && (
                <div className="absolute inset-0 flex items-center justify-center z-30">
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
            </div>
          ) : (
            <div className="text-center text-white">
              <div className="text-4xl mb-2">⚔️</div>
              <p className="text-lg">
                {battleState.currentTurn === 'player' 
                  ? 'Selecciona una carta para atacar' 
                  : 'El enemigo está pensando...'}
              </p>
            </div>
          )}
        </div>

        {/* Battle Field - Player */}
        <div className="mb-4">
          <h3 className="text-white text-sm mb-2 flex items-center">
            <Sword className="w-4 h-4 mr-1" />
            Tu Campo ({battleState.player.field.length})
          </h3>
          <div className="flex space-x-2 min-h-[120px] bg-blue-900/20 rounded-lg p-2 border border-blue-500/30">
            {battleState.player.field.map((card, index) => (
              <PlayerFieldCard key={`${card.id}-${index}`} card={card} />
            ))}
          </div>
        </div>

        {/* Bottom Bar - Player Info and Hand */}
        <div className="space-y-4">
          {/* Player HP */}
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-lg p-3 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold">{battleState.player.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-48 bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(battleState.player.hp / battleState.player.maxHp) * 100}%` }}
                  />
                </div>
                <span className="text-white">{battleState.player.hp}/{battleState.player.maxHp}</span>
              </div>
            </div>
          </div>

          {/* Player Hand */}
          <div>
            <h3 className="text-white text-sm mb-2 flex items-center">
              <Star className="w-4 h-4 mr-1" />
              Tu Mano ({battleState.player.hand.length})
            </h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 min-h-[400px]">
              {battleState.player.hand.map((card, index) => {
                // Hide the card if it's currently in the center
                if (centerCard && centerCard.id === card.id) {
                  return (
                    <motion.div
                      key={`${card.id}-${index}-placeholder`}
                      className="w-[280px] h-[380px] rounded-xl border-2 border-dashed border-blue-400/50 bg-blue-500/10 flex items-center justify-center flex-shrink-0"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-center text-blue-300">
                        <div className="text-4xl mb-2">⚡</div>
                        <p className="text-sm">Carta en batalla</p>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <UniversalCard
                    key={`${card.id}-${index}`}
                    id={card.id}
                    name={card.name}
                    rarity={card.rarity}
                    attack_power={card.power || 0}
                    category={card.type}
                    difficulty_level={card.problem?.difficulty || 1}
                    image_url={card.image_url}
                    description={card.description}
                    size="medium"
                    showPlayButton={false}
                    isSelected={selectedCard?.id === card.id}
                    isLoading={false}
                    canPlay={battleState.currentTurn === 'player' && !problemChallenge && !centerCard && !isGeneratingProblem && !isConjuring}
                    loadingText=""
                    onClick={async () => {
                      if (battleState.currentTurn === 'player' && !problemChallenge && !centerCard && !isGeneratingProblem && !isConjuring) {
                        await playCard(card);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Problem Challenge Modal */}
      <AnimatePresence>
        {problemChallenge && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold">{problemChallenge.card.name}</h3>
                    <p className="text-blue-100">Resuelve para atacar</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">{timeLeft}s</span>
                  </div>
                </div>
              </div>

              {/* Problem Content */}
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-gray-800 mb-2">
                    {problemChallenge.problem.question}
                  </h4>
                  <p className="text-gray-600">
                    Poder de ataque: {problemChallenge.card.power}
                  </p>
                </div>

                {/* Answer Options or Input */}
                {problemChallenge.problem.options ? (
                  <div className="grid grid-cols-2 gap-3">
                    {problemChallenge.problem.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setPlayerAnswer(option)}
                        className={`p-3 rounded-lg border-2 font-medium transition-all ${
                          playerAnswer === option
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={playerAnswer}
                    onChange={(e) => setPlayerAnswer(e.target.value)}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg text-center text-lg font-medium"
                    placeholder="Tu respuesta..."
                    autoFocus
                  />
                )}

                {/* Submit Button */}
                <button
                  onClick={handleAnswerSubmit}
                  disabled={!playerAnswer.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  ⚔️ Atacar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Component for cards in player's field
function PlayerFieldCard({ card }: { card: BattleCard }) {
  return (
    <motion.div
      className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 w-24 h-28 flex flex-col items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <div className="text-blue-600 text-lg mb-1">
        {card.type === 'math' ? '📊' : '🧠'}
      </div>
      <p className="text-xs font-bold text-blue-800 text-center truncate w-full">{card.name}</p>
      <div className="flex items-center space-x-1 mt-1">
        <Sword className="w-3 h-3 text-red-500" />
        <span className="text-xs font-bold">{card.power}</span>
      </div>
    </motion.div>
  );
}

// Component for cards in enemy's field
function EnemyFieldCard({ card }: { card: BattleCard }) {
  return (
    <motion.div
      className="bg-red-100 border-2 border-red-500 rounded-lg p-2 w-24 h-28 flex flex-col items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
    >
      <div className="text-red-600 text-lg mb-1">
        {card.type === 'math' ? '📊' : '🧠'}
      </div>
      <p className="text-xs font-bold text-red-800 text-center truncate w-full">{card.name}</p>
      <div className="flex items-center space-x-1 mt-1">
        <Sword className="w-3 h-3 text-red-500" />
        <span className="text-xs font-bold">{card.power}</span>
      </div>
    </motion.div>
  );
}

export default BattleField2D;