'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Zap, Star, Trophy } from 'lucide-react';
import type { GameState } from '@/types/game';

interface GameUIProps {
  gameState: GameState | null;
  isLoading?: boolean;
  error?: string | null;
}

export function GameUI({ gameState, isLoading = false, error }: GameUIProps) {
  if (!gameState) {
    return (
      <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
        <p>Inicializando juego...</p>
      </div>
    );
  }

  const { player, enemy, currentTurn, phase, round } = gameState;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Player Stats - Bottom Left */}
      <motion.div
        className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-xl shadow-lg pointer-events-auto"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">{player.name?.charAt(0) || 'P'}</span>
          </div>
          <div>
            <h3 className="font-bold text-lg">{player.name || 'Jugador'}</h3>
            <p className="text-xs text-blue-200">Nivel {player.level}</p>
          </div>
        </div>
        
        {/* Health Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center space-x-1">
              <Heart size={14} className="text-red-400" />
              <span>Vida</span>
            </span>
            <span>{player.hp}/{player.maxHp}</span>
          </div>
          <div className="w-32 h-2 bg-blue-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-red-400"
              initial={{ width: 0 }}
              animate={{ width: `${(player.hp / player.maxHp) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* XP Bar */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center space-x-1">
              <Star size={14} className="text-yellow-400" />
              <span>XP</span>
            </span>
            <span>{player.xp}</span>
          </div>
          <div className="w-32 h-2 bg-blue-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
              initial={{ width: 0 }}
              animate={{ width: `${(player.xp % 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Energy/Mana */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="flex items-center space-x-1">
              <Zap size={14} className="text-blue-400" />
              <span>Energía</span>
            </span>
            <span>3/3</span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-8 h-2 rounded-full bg-blue-400"
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Enemy Stats - Top Right */}
      {enemy && (
        <motion.div
          className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-xl shadow-lg pointer-events-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3 mb-2">
            <div>
              <h3 className="font-bold text-lg text-right">{enemy.name}</h3>
              <p className="text-xs text-red-200 text-right">Nivel {enemy.difficulty || 1}</p>
            </div>
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{enemy.name?.charAt(0) || 'E'}</span>
            </div>
          </div>
          
          {/* Enemy Health Bar */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span>{enemy.hp}/{enemy.maxHp}</span>
              <span className="flex items-center space-x-1">
                <span>Vida</span>
                <Heart size={14} className="text-red-400" />
              </span>
            </div>
            <div className="w-32 h-2 bg-red-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 to-red-400"
                initial={{ width: '100%' }}
                animate={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Game Status - Top Center */}
      <motion.div
        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-xl shadow-lg pointer-events-auto"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center space-x-1">
            <Trophy size={16} className="text-yellow-400" />
            <span>Ronda {round}</span>
          </span>
          <span className="text-gray-300">|</span>
          <span className={`font-semibold ${
            currentTurn === 'player' ? 'text-blue-400' : 'text-red-400'
          }`}>
            {currentTurn === 'player' ? 'Tu turno' : 'Turno enemigo'}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-300 capitalize">{phase}</span>
        </div>
      </motion.div>

      {/* Turn Indicator */}
      <motion.div
        className={`absolute left-1/2 top-20 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-bold ${
          currentTurn === 'player' 
            ? 'bg-blue-500' 
            : 'bg-red-500'
        }`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        key={currentTurn}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {currentTurn === 'player' ? '¡Tu turno!' : 'Turno del enemigo'}
      </motion.div>

      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4 shadow-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-800 font-medium">Procesando...</span>
          </div>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          className="absolute top-20 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm pointer-events-auto"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
        >
          <h4 className="font-bold mb-1">Error</h4>
          <p className="text-sm">{error}</p>
        </motion.div>
      )}

      {/* Instructions - Bottom Center */}
      <motion.div
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm pointer-events-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {phase === 'battle' && currentTurn === 'player' ? (
          <p>Haz clic en una carta para jugarla</p>
        ) : phase === 'setup' ? (
          <p>Preparando batalla...</p>
        ) : (
          <p>Esperando...</p>
        )}
      </motion.div>
    </div>
  );
}

export default GameUI; 