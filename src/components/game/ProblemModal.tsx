'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Clock, Lightbulb, BookOpen } from 'lucide-react';
import type { Card } from '@/types/cards';

interface ProblemModalProps {
  card: Card;
  onAnswer: (answer: string | number, timeSpent: number) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export function ProblemModal({ card, onAnswer, onClose, isLoading = false }: ProblemModalProps) {
  const [answer, setAnswer] = useState<string>('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [startTime] = useState(Date.now());

  const problem = card.problem;
  const isMathProblem = problem.type === 'math';

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Handle answer submission
  const handleSubmit = () => {
    if (!answer.trim()) return;

    const finalAnswer = isMathProblem ? parseFloat(answer) || answer : answer;
    onAnswer(finalAnswer, timeSpent);
  };

  // Handle option selection (for multiple choice)
  const handleOptionSelect = (option: string | number) => {
    setAnswer(option.toString());
  };

  // Show next hint
  const showNextHint = () => {
    if (currentHintIndex < problem.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
    setShowHint(true);
  };

  // Get time limit color
  const getTimeColor = () => {
    const timeLimit = 'timeLimit' in problem ? problem.timeLimit : undefined;
    if (!timeLimit) return 'text-gray-400';
    const percentage = (timeSpent / timeLimit) * 100;
    if (percentage > 80) return 'text-red-500';
    if (percentage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get time limit value
  const getTimeLimit = () => {
    return 'timeLimit' in problem ? problem.timeLimit : undefined;
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">{card.name}</h2>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  Poder: {card.power}
                </span>
                <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
                  Dificultad: {problem.difficulty}/5
                </span>
                {getTimeLimit() && (
                  <span className={`flex items-center space-x-1 ${getTimeColor()}`}>
                    <Clock size={16} />
                    <span>{timeSpent}s / {getTimeLimit()}s</span>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Problem Content */}
        <div className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Problema:</h3>
            <p className="text-gray-700 text-lg leading-relaxed bg-gray-50 p-4 rounded-lg">
              {problem.question}
            </p>
          </div>

          {/* Multiple Choice Options */}
          {problem.options && problem.options.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Opciones:</h4>
              <div className="grid grid-cols-2 gap-3">
                {problem.options.map((option: string | number, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      answer === option.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                    disabled={isLoading}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Text Input (for non-multiple choice) */}
          {(!problem.options || problem.options.length === 0) && (
            <div className="mb-6">
              <label className="block text-md font-semibold text-gray-800 mb-3">
                Tu respuesta:
              </label>
              <input
                type={isMathProblem ? 'number' : 'text'}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder={isMathProblem ? 'Ingresa un número...' : 'Ingresa tu respuesta...'}
                disabled={isLoading}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              />
            </div>
          )}

          {/* Hint Section */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="mb-6">
              {!showHint ? (
                <button
                  onClick={showNextHint}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  disabled={isLoading}
                >
                  <Lightbulb size={20} />
                  <span>Mostrar pista</span>
                </button>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex items-start space-x-2">
                    <Lightbulb size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">
                        Pista {currentHintIndex + 1}:
                      </h4>
                      <p className="text-yellow-700">{problem.hints[currentHintIndex]}</p>
                      {currentHintIndex < problem.hints.length - 1 && (
                        <button
                          onClick={showNextHint}
                          className="mt-2 text-sm text-yellow-600 hover:text-yellow-700 underline"
                          disabled={isLoading}
                        >
                          Siguiente pista
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Explanation Section */}
          {problem.explanation && (
            <div className="mb-6">
              {!showExplanation ? (
                <button
                  onClick={() => setShowExplanation(true)}
                  className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
                  disabled={isLoading}
                >
                  <BookOpen size={20} />
                  <span>Ver explicación</span>
                </button>
              ) : (
                <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                  <div className="flex items-start space-x-2">
                    <BookOpen size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Explicación:</h4>
                      <p className="text-green-700">{problem.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                'Enviar Respuesta'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProblemModal; 