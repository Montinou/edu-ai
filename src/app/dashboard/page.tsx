'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Trophy, LogOut, User, Settings } from 'lucide-react';
import BattleField from '@/components/game/BattleField';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

export default function DashboardPage() {
  const { user, loading, authenticated, logout, redirectIfNotAuthenticated } = useAuth();
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    redirectIfNotAuthenticated();
  }, [authenticated, loading, redirectIfNotAuthenticated]);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleGameEnd = (result: { won: boolean; score: number }) => {
    console.log('Game ended:', result);
    setGameStarted(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will be redirected)
  if (!authenticated) {
    return null;
  }

  if (gameStarted) {
    return <BattleField onGameEnd={handleGameEnd} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Navigation Bar */}
      <nav className="bg-white bg-opacity-10 backdrop-blur-lg border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">EduCard AI</h1>
              {user && (
                <span className="ml-4 text-blue-200">
                  Hola, {user.firstName}!
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-purple-300 transition-colors">
                <User size={20} />
              </button>
              <button className="text-white hover:text-purple-300 transition-colors">
                <Settings size={20} />
              </button>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-red-300 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="max-w-6xl w-full">
          {/* Hero Section */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-7xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EduCard AI
            </h1>
            <p className="text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Aprende matemáticas y lógica mientras juegas con cartas mágicas. 
              Combina diversión con aprendizaje en una aventura educativa única.
            </p>
            
            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-opacity-20 transition-all duration-300"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Play size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Juego Interactivo</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Resuelve problemas matemáticos para activar el poder de tus cartas mágicas
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-opacity-20 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">IA Educativa</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Tutor inteligente que se adapta a tu nivel y estilo de aprendizaje
                </p>
              </motion.div>

              <motion.div
                className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 text-white hover:bg-opacity-20 transition-all duration-300"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                whileHover={{ y: -5 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Trophy size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Progresión</h3>
                <p className="text-lg text-gray-300 leading-relaxed">
                  Desbloquea nuevas cartas y niveles mientras mejoras tus habilidades
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-2xl text-xl transition-all shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <Play size={28} />
                <span>Comenzar Aventura</span>
              </div>
            </motion.button>

            <motion.button
              onClick={() => setShowInstructions(true)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-5 px-10 rounded-2xl text-xl transition-all backdrop-blur-lg border border-white border-opacity-30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center space-x-3">
                <BookOpen size={24} />
                <span>Cómo Jugar</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <Link
              href="/game"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-purple-600 bg-white hover:bg-gray-50 transition-all shadow-lg"
            >
              🎮 Juego 3D
            </Link>
            <Link
              href="/battle-2d"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            >
              ⚔️ Batalla 2D
            </Link>
            <Link
              href="/card-revolution"
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-purple-600 transition-all"
            >
              📚 Ver Colección
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center px-8 py-4 border border-white text-lg font-medium rounded-xl text-white hover:bg-white hover:text-purple-600 transition-all"
            >
              👤 Mi Perfil
            </Link>
          </motion.div>

          {/* Instructions Modal */}
          {showInstructions && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowInstructions(false)}
            >
              <motion.div
                className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-10 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              >
                <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">Cómo Jugar</h2>
                
                <div className="space-y-8">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">🎯 Objetivo</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Derrota a tus enemigos resolviendo problemas matemáticos y de lógica para activar 
                      el poder de tus cartas mágicas.
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">🃏 Cartas</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      Cada carta tiene un problema único. Resuelve correctamente para hacer daño al enemigo. 
                      Las cartas más raras tienen problemas más difíciles pero mayor poder.
                    </p>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">⚡ Combate</h3>
                    <ul className="text-lg text-gray-600 space-y-2">
                      <li>• Haz clic en una carta para seleccionarla</li>
                      <li>• Resuelve el problema matemático o de lógica</li>
                      <li>• El daño depende de tu precisión y velocidad</li>
                      <li>• Usa pistas si necesitas ayuda</li>
                    </ul>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                    <h3 className="text-2xl font-semibold text-gray-700 mb-4">🎓 Aprendizaje</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      El tutor IA se adapta a tu nivel y te proporciona explicaciones personalizadas. 
                      ¡No tengas miedo de cometer errores, son parte del aprendizaje!
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowInstructions(false)}
                  className="mt-10 w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all text-xl"
                >
                  ¡Entendido, vamos a jugar!
                </button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 