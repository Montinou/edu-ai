// Store principal del juego usando Zustand
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { GameState } from '@/types/game';
import type { ProblemResult } from '@/types/cards';
import type { 
  BattleResult,
  CombatAction,
} from '@/types';

interface GameStore {
  // Estado del juego
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  
  // Acciones del juego
  initializeGame: (playerId: string) => Promise<void>;
  startBattle: (enemyId: string, difficulty: number) => Promise<void>;
  playCard: (cardId: string, answer: string | number, timeSpent: number) => Promise<BattleResult>;
  endBattle: () => void;
  resetGame: () => void;
  
  // Gestión de cartas
  selectCard: (cardId: string) => void;
  deselectCard: () => void;
  selectedCardId: string | null;
  
  // Historial de combate
  combatLog: CombatAction[];
  addCombatAction: (action: CombatAction) => void;
  clearCombatLog: () => void;
  
  // Estado de UI
  showHint: boolean;
  showExplanation: boolean;
  toggleHint: () => void;
  toggleExplanation: () => void;
  
  // Métricas de la sesión actual
  sessionStats: {
    problemsSolved: number;
    correctAnswers: number;
    totalTime: number;
    hintsUsed: number;
    averageTime: number;
  };
  updateSessionStats: (result: ProblemResult) => void;
  resetSessionStats: () => void;
}

const initialSessionStats = {
  problemsSolved: 0,
  correctAnswers: 0,
  totalTime: 0,
  hintsUsed: 0,
  averageTime: 0,
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        gameState: null,
        isLoading: false,
        error: null,
        selectedCardId: null,
        combatLog: [],
        showHint: false,
        showExplanation: false,
        sessionStats: initialSessionStats,

        // Inicializar juego
        initializeGame: async (playerId: string) => {
          set({ isLoading: true, error: null });
          
          try {
            // Aquí se cargaría el estado del jugador desde la API
            const response = await fetch(`/api/player/${playerId}`);
            if (!response.ok) throw new Error('Failed to load player data');
            
            const playerData = await response.json();
            
            // Crear estado inicial del juego
            const gameState: GameState = {
              player: playerData.player,
              enemy: null,
              currentTurn: 'player',
              phase: 'setup',
              round: 0,
              isGameActive: false,
            };
            
            set({ 
              gameState, 
              isLoading: false,
              sessionStats: initialSessionStats 
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            });
          }
        },

        // Iniciar combate
        startBattle: async (enemyId: string, difficulty: number) => {
          const { gameState } = get();
          if (!gameState) return;

          set({ isLoading: true, error: null });

          try {
            const response = await fetch('/api/game/battle/start', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                playerId: gameState.player.id,
                enemyId,
                difficulty,
              }),
            });

            if (!response.ok) throw new Error('Failed to start battle');
            
            const battleData = await response.json();
            
            set({
              gameState: {
                ...gameState,
                enemy: battleData.enemy,
                phase: 'battle',
                isGameActive: true,
                round: 1,
              },
              isLoading: false,
              combatLog: [],
            });
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to start battle',
              isLoading: false 
            });
          }
        },

        // Jugar carta
        playCard: async (cardId: string, answer: string | number, timeSpent: number) => {
          const { gameState, combatLog } = get();
          if (!gameState || !gameState.isGameActive) {
            throw new Error('No active game');
          }

          set({ isLoading: true });

          try {
            const response = await fetch('/api/game/battle/play-card', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                battleId: `${gameState.player.id}-${gameState.enemy?.id}`,
                cardId,
                answer,
                timeSpent,
              }),
            });

            if (!response.ok) throw new Error('Failed to play card');
            
            const result = await response.json();
            
            // Actualizar estado del juego
            const updatedGameState = result.gameState;
            
            // Agregar acción al log de combate
            const combatAction: CombatAction = {
              type: 'play_card',
              cardId,
              problemResult: {
                isCorrect: result.result.success,
                answer,
                timeSpent,
                hintsUsed: get().showHint ? 1 : 0,
                attempts: 1,
                score: result.result.success ? 100 : 0,
              },
              damage: result.result.damage,
              timestamp: new Date(),
              playerId: gameState.player.id,
            };

            // Actualizar estadísticas de la sesión
            get().updateSessionStats(combatAction.problemResult!);

            set({
              gameState: updatedGameState,
              combatLog: [...combatLog, combatAction],
              selectedCardId: null,
              isLoading: false,
              showHint: false,
              showExplanation: false,
            });

            return result.result;
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Failed to play card',
              isLoading: false 
            });
            throw error;
          }
        },

        // Terminar combate
        endBattle: () => {
          const { gameState } = get();
          if (!gameState) return;

          set({
            gameState: {
              ...gameState,
              phase: 'result',
              isGameActive: false,
            },
          });

          // Aquí se podría enviar el resultado a la API para persistir
          // el progreso del jugador
        },

        // Resetear juego
        resetGame: () => {
          set({
            gameState: null,
            selectedCardId: null,
            combatLog: [],
            showHint: false,
            showExplanation: false,
            sessionStats: initialSessionStats,
            error: null,
          });
        },

        // Seleccionar carta
        selectCard: (cardId: string) => {
          set({ selectedCardId: cardId });
        },

        // Deseleccionar carta
        deselectCard: () => {
          set({ selectedCardId: null });
        },

        // Agregar acción al log de combate
        addCombatAction: (action: CombatAction) => {
          const { combatLog } = get();
          set({ combatLog: [...combatLog, action] });
        },

        // Limpiar log de combate
        clearCombatLog: () => {
          set({ combatLog: [] });
        },

        // Toggle hint
        toggleHint: () => {
          set((state) => ({ showHint: !state.showHint }));
        },

        // Toggle explanation
        toggleExplanation: () => {
          set((state) => ({ showExplanation: !state.showExplanation }));
        },

        // Actualizar estadísticas de la sesión
        updateSessionStats: (result: ProblemResult) => {
          const { sessionStats } = get();
          const newStats = {
            problemsSolved: sessionStats.problemsSolved + 1,
            correctAnswers: sessionStats.correctAnswers + (result.isCorrect ? 1 : 0),
            totalTime: sessionStats.totalTime + result.timeSpent,
            hintsUsed: sessionStats.hintsUsed + result.hintsUsed,
            averageTime: 0, // Se calculará después
          };
          
          // Calcular tiempo promedio
          newStats.averageTime = newStats.totalTime / newStats.problemsSolved;
          
          set({ sessionStats: newStats });
        },

        // Resetear estadísticas de la sesión
        resetSessionStats: () => {
          set({ sessionStats: initialSessionStats });
        },
      }),
      {
        name: 'game-store',
        // Solo persistir ciertos campos
        partialize: (state) => ({
          sessionStats: state.sessionStats,
          // No persistir gameState para evitar estados inconsistentes
        }),
      }
    ),
    {
      name: 'game-store',
    }
  )
); 