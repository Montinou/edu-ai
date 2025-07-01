// @ts-nocheck
'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Card3D } from '@/components/cards/Card3D';
import { ProblemModal } from '@/components/game/ProblemModal';
import { GameUI } from '@/components/game/GameUI';
import { useGameStore } from '@/lib/stores/gameStore';
import { databaseService } from '@/lib/services/databaseService';
import type { Card } from '@/types/cards';

// Alternative: You can use the custom hook instead of manual state management
// import { useCards } from '@/lib/hooks/useCards';

interface BattleFieldProps {
  onGameEnd?: (result: { won: boolean; score: number }) => void;
}

export function BattleField({ onGameEnd }: BattleFieldProps) {
  const {
    gameState,
    selectedCardId,
    selectCard,
    deselectCard,
    playCard,
    isLoading,
    error,
  } = useGameStore();

  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Helper function to get cards using the new API method
  const apiGetCards = async (limit: number = 3): Promise<Card[]> => {
    try {
      // Try database service first
      const cards = await databaseService.apiGetCards(limit);
      console.log(`✅ Loaded ${cards.length} cards from database service (limit: ${limit})`);
      return cards;
    } catch (serviceError) {
      console.warn('⚠️ Database service failed, trying API endpoint:', serviceError);
      
      // Fallback to API endpoint
      const response = await fetch(`/api/cards?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.cards) {
        console.log(`✅ Loaded ${data.cards.length} cards from API endpoint (limit: ${limit})`);
        return data.cards;
      } else {
        throw new Error('No cards found in API response');
      }
    }
  };

  // Function to reload cards with a specific count - Now wrapped in useCallback
  const reloadCards = useCallback(async (count: number = 3) => {
    try {
      setCardsLoading(true);
      setCardsError(null);
      
      console.log(`🔄 Reloading ${count} cards from database...`);
      
      const dbCards = await apiGetCards(count);
      
      if (dbCards && dbCards.length > 0) {
        // Mapear las cartas de la base de datos al formato esperado
        const mappedCards = dbCards.map(dbCard => ({
          id: dbCard.id,
          name: dbCard.name,
          type: dbCard.type || 'math',
          rarity: dbCard.rarity || 'común',
          description: dbCard.description || 'Carta educativa',
          power: dbCard.power || 20,
          cost: dbCard.cost || 2,
          problem: dbCard.problem || {
            question: '¿Cuánto es 2 + 2?',
            answer: 4,
            options: [3, 4, 5, 6],
            operation: 'addition',
            difficulty: 1,
            hints: ['Suma básica'],
            explanation: '2 + 2 = 4',
            type: 'math',
            timeLimit: 30,
          },
          effects: dbCard.effects || [],
          artwork: dbCard.artwork || {
            image: '/images/cards/card-images/placeholder.svg',
          },
          unlocked: true,
          image_url: dbCard.image_url,
        }));
        
        console.log(`✅ Successfully reloaded ${mappedCards.length} cards:`, 
          mappedCards.map(c => ({ id: c.id, name: c.name, image_url: c.image_url })));
        
        setPlayerHand(mappedCards);
      } else {
        console.warn('⚠️ No cards returned from database');
        setCardsError('No se encontraron cartas en la base de datos');
      }
      
    } catch (error) {
      console.error('❌ Error reloading cards:', error);
      setCardsError(`Error al cargar cartas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setCardsLoading(false);
    }
  }, []);  // Empty dependency array since it doesn't depend on any props or state

  // Cargar cartas desde la base de datos
  useEffect(() => {
    // Load initial 3 cards when component mounts
    reloadCards(3);
  }, [reloadCards]);

  // Manejar selección de carta
  const handleCardClick = (card: Card) => {
    if (selectedCardId === card.id) {
      // Si ya está seleccionada, deseleccionar
      deselectCard();
      setSelectedCard(null);
    } else {
      // Seleccionar nueva carta
      selectCard(card.id);
      setSelectedCard(card);
      setShowProblemModal(true);
    }
  };

  // Manejar hover de carta
  const handleCardHover = (cardId: string) => {
    setHoveredCardId(cardId);
  };

  // Manejar respuesta del problema
  const handleProblemAnswer = async (answer: string | number, timeSpent: number) => {
    if (!selectedCard) return;

    try {
      const result = await playCard(selectedCard.id, answer, timeSpent);
      
      // Cerrar modal y resetear selección
      setShowProblemModal(false);
      setSelectedCard(null);
      deselectCard();

      // Mostrar resultado (aquí podrías agregar animaciones de éxito/fallo)
      console.log('Battle result:', result);

      // Verificar si el juego terminó
      if (gameState?.enemy && gameState.enemy.hp <= 0) {
        onGameEnd?.({ won: true, score: result.xpGained });
      } else if (gameState?.player && gameState.player.hp <= 0) {
        onGameEnd?.({ won: false, score: 0 });
      }

    } catch (error) {
      console.error('Error playing card:', error);
      // Manejar error (mostrar mensaje al usuario)
    }
  };

  // Cerrar modal sin jugar carta
  const handleCloseModal = () => {
    setShowProblemModal(false);
    setSelectedCard(null);
    deselectCard();
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-indigo-900">
      {/* Canvas 3D para las cartas */}
      <div className="absolute inset-0">
        <Canvas>
          <Suspense fallback={null}>
            {/* Configuración de la cámara - MÁS ALEJADA */}
            <PerspectiveCamera
              makeDefault
              position={[0, 2, 15]}  // Más alejada: era [0, 0, 8], ahora [0, 2, 15]
              fov={45}              // FOV más cerrado para mejor perspectiva: era 60, ahora 45
            />

            {/* Iluminación */}
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
            />
            <pointLight position={[-10, -10, -5]} intensity={0.5} />

            {/* Entorno */}
            <Environment preset="night" />

            {/* Controles de cámara */}
            <OrbitControls
              enablePan={false}
              enableZoom={true}      // Permitir zoom para que el usuario pueda ajustar
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
              minPolarAngle={Math.PI / 6}  // Más amplio: era Math.PI / 3
              minDistance={10}       // Distancia mínima de zoom
              maxDistance={25}       // Distancia máxima de zoom
            />

            {/* Renderizar cartas en la mano del jugador */}
            {!cardsLoading && playerHand.length > 0 && playerHand.map((card, index) => {
              const isSelected = selectedCardId === card.id;
              const isHovered = hoveredCardId === card.id;
              
              // Posición en arco para las cartas - RADIO MAYOR para vista alejada
              const angle = (index - (playerHand.length - 1) / 2) * 0.4;  // Ángulo un poco mayor
              const radius = 9;      // Radio mayor: era 6, ahora 9
              const x = Math.sin(angle) * radius;
              const y = -3 + (isSelected ? 1.5 : isHovered ? 0.5 : 0);  // Posición Y más baja
              const z = Math.cos(angle) * radius - 3;  // Z más hacia atrás

              return (
                <Card3D
                  key={card.id}
                  card={card}
                  position={[x, y, z]}
                  rotation={[0, -angle, 0]}
                  scale={isSelected ? [1.3, 1.3, 1.3] : [1.1, 1.1, 1.1]}  // Escalas ligeramente mayores
                  isHovered={isHovered}
                  isSelected={isSelected}
                  isAnimating={false}
                  onHover={() => handleCardHover(card.id)}
                  onClick={() => handleCardClick(card)}
                />
              );
            })}

            {/* Efectos de fondo - AJUSTADO para perspectiva alejada */}
            <mesh position={[0, 0, -15]}>  {/* Más alejado: era -10, ahora -15 */}
              <planeGeometry args={[80, 80]} />  {/* Más grande: era [50, 50], ahora [80, 80] */}
              <meshBasicMaterial
                color="#1a1a2e"
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Plano adicional para crear profundidad */}
            <mesh position={[0, -8, -5]}>
              <planeGeometry args={[60, 20]} />
              <meshBasicMaterial
                color="#2d1b69"
                transparent
                opacity={0.6}
              />
            </mesh>
          </Suspense>
        </Canvas>
      </div>

      {/* Controles de desarrollo (opcional - para testing) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 bg-black bg-opacity-50 p-4 rounded-lg z-40">
          <h4 className="text-white text-sm font-bold mb-2">Dev Controls</h4>
          
          {/* Controles de cartas */}
          <div className="mb-3">
            <p className="text-white text-xs mb-1">Cartas:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => reloadCards(1)}
                className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                1 Carta
              </button>
              <button
                onClick={() => reloadCards(3)}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
              >
                3 Cartas
              </button>
              <button
                onClick={() => reloadCards(5)}
                className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
              >
                5 Cartas
              </button>
              <button
                onClick={() => reloadCards(10)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
              >
                10 Cartas
              </button>
            </div>
          </div>
          
          {/* Info de perspectiva */}
          <div className="text-white text-xs space-y-1">
            <p>📐 Perspectiva alejada activada</p>
            <p>🎮 Usa rueda del mouse para zoom</p>
            <p>🖱️ Arrastra para rotar vista</p>
            <p>📊 Cartas actuales: {playerHand.length}</p>
          </div>
        </div>
      )}

      {/* UI del juego superpuesta */}
      <GameUI
        gameState={gameState}
        isLoading={isLoading}
        error={error}
      />

      {/* Indicador de carga de cartas */}
      {cardsLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 flex items-center space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-gray-800 font-medium">Cargando cartas desde la base de datos...</span>
          </motion.div>
        </div>
      )}

      {/* Mensaje cuando no hay cartas */}
      {!cardsLoading && playerHand.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-40">
          <motion.div
            className="bg-white rounded-lg p-8 text-center max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">No hay cartas disponibles</h3>
            <p className="text-gray-600 mb-4">
              {cardsError || 'No se encontraron cartas en la base de datos.'}
            </p>
            <button
              onClick={() => reloadCards(3)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Recargar
            </button>
          </motion.div>
        </div>
      )}

      {/* Modal de problema matemático */}
      <AnimatePresence>
        {showProblemModal && selectedCard && (
          <ProblemModal
            card={selectedCard}
            onAnswer={handleProblemAnswer}
            onClose={handleCloseModal}
            isLoading={isLoading}
          />
        )}
      </AnimatePresence>

      {/* Indicador de carga del juego */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-lg p-6 flex items-center space-x-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-800 font-medium">Procesando...</span>
          </motion.div>
        </div>
      )}

      {/* Mensaje de error del juego */}
      {error && (
        <motion.div
          className="absolute top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

export default BattleField; 