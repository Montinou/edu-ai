'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { DatabaseCard } from './Card';
import { X, Star, Sword, Shield, Target, Brain } from 'lucide-react';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface CardModalProps {
  card: DatabaseCard;
  isOpen: boolean;
  onClose: () => void;
}

interface MathProblem {
  id: string;
  content_type: string;
  title: string;
  content: {
    problem: string;
    answer: number | string;
    explanation: string;
    options?: (number | string)[];
  };
  difficulty_level: number;
  target_age: number;
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const [mathProblem, setMathProblem] = useState<MathProblem | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch associated math problem
  useEffect(() => {
    if (isOpen && card) {
      fetchMathProblem();
    }
  }, [isOpen, card]);

  const fetchMathProblem = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_generated_content')
        .select('*')
        .eq('content_type', 'math_problem')
        .eq('is_approved', true)
        .limit(1)
        .single();

      if (error) {
        console.warn('No math problem found for card:', error.message);
        return;
      }

      setMathProblem(data);
    } catch (err) {
      console.error('Error fetching math problem:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const rarityColors = {
    común: {
      gradient: 'from-emerald-600 to-emerald-400',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-900',
      accent: 'text-emerald-600'
    },
    raro: {
      gradient: 'from-blue-600 to-blue-400',
      bg: 'bg-blue-50',
      border: 'border-blue-200', 
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    épico: {
      gradient: 'from-purple-600 to-purple-400',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-900', 
      accent: 'text-purple-600'
    },
    legendario: {
      gradient: 'from-amber-500 to-orange-400',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      accent: 'text-amber-600'
    }
  };

  const typeColors = {
    attack: 'text-red-600',
    defense: 'text-blue-600',
    special: 'text-purple-600',
    support: 'text-green-600'
  };

  const problemTypeIcons = {
    addition: '➕',
    subtraction: '➖',
    multiplication: '✖️',
    division: '➗',
    fractions: '🔢',
    patterns: '🔄',
    logic: '🧠',
    deduction: '🔍'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className={`relative p-6 bg-gradient-to-r ${(rarityColors as any)[card.rarity].gradient} text-white rounded-t-2xl`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          {/* Card Header Info */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{card.name}</h2>
              <div className="flex items-center gap-4 text-sm opacity-90">
                <span className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
                </span>
                <span className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  {card.type.charAt(0).toUpperCase() + card.type.slice(1)}
                </span>
                <span className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                  Coste: {card.cost}
                </span>
              </div>
            </div>
            
            {/* Rarity Gem */}
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl">
              {card.rarity === 'legendario' && '👑'}
              {card.rarity === 'épico' && '⚡'}
              {card.rarity === 'raro' && '💎'}
              {card.rarity === 'común' && '🌿'}
            </div>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-6 space-y-6">
          {/* Card Image and Stats */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {/* Image Section - Takes more space for wider cards */}
            <div className="lg:col-span-2 space-y-4">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                {card.image_url ? (
                  <Image 
                    src={card.image_url} 
                    alt={card.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                  />
                ) : (
                  <div className="text-6xl opacity-50">
                    {card.type === 'attack' && '⚔️'}
                    {card.type === 'defense' && '🛡️'}
                    {card.type === 'special' && '✨'}
                    {card.type === 'support' && '🌟'}
                  </div>
                )}
                
                {/* Type Badge */}
                <div className={`absolute top-3 left-3 bg-white rounded-full px-2 py-1 text-sm font-medium ${typeColors[card.type]}`}>
                  {card.type === 'attack' && '⚔️ Ataque'}
                  {card.type === 'defense' && '🛡️ Defensa'}
                  {card.type === 'special' && '✨ Especial'}
                  {card.type === 'support' && '🌟 Apoyo'}
                </div>
              </div>

              {/* Problem Type */}
              <div className={`text-center p-4 ${(rarityColors as any)[card.rarity].bg} ${(rarityColors as any)[card.rarity].border} border rounded-lg`}>
                <div className="text-3xl mb-2">{problemTypeIcons[card.problem_type]}</div>
                <div className={`font-medium text-lg ${(rarityColors as any)[card.rarity].text} capitalize`}>
                  {card.problem_type === 'addition' && 'Suma'}
                  {card.problem_type === 'subtraction' && 'Resta'}
                  {card.problem_type === 'multiplication' && 'Multiplicación'}
                  {card.problem_type === 'division' && 'División'}
                  {card.problem_type === 'fractions' && 'Fracciones'}
                  {card.problem_type === 'patterns' && 'Patrones'}
                  {card.problem_type === 'logic' && 'Lógica'}
                  {card.problem_type === 'deduction' && 'Deducción'}
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="space-y-4">
              {/* Combat Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <Sword className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{card.attack_power}</div>
                  <div className="text-sm text-red-700">Ataque</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Shield className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{card.defense_power}</div>
                  <div className="text-sm text-blue-700">Defensa</div>
                </div>
              </div>

              {/* Difficulty */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">Dificultad</span>
                  <Target className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex justify-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < card.difficulty_level
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600 mt-1">
                  Nivel {card.difficulty_level}/5
                </div>
              </div>

              {/* Card Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tipo de carta:</span>
                  <span className="font-medium">{card.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rareza:</span>
                  <span className="font-medium">{card.rarity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coste de mana:</span>
                  <span className="font-medium">{card.cost}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {card.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-700">{card.description}</p>
            </div>
          )}

          {/* Math Problem Section - RARITY COLOR THEMED */}
          <div className={`${(rarityColors as any)[card.rarity].bg} ${(rarityColors as any)[card.rarity].border} border rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className={`w-5 h-5 ${(rarityColors as any)[card.rarity].accent}`} />
              <h3 className={`font-semibold ${(rarityColors as any)[card.rarity].text}`}>Problema Matemático</h3>
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="loading-spinner w-6 h-6 mx-auto"></div>
                <p className={`${(rarityColors as any)[card.rarity].text} mt-2`}>Cargando problema...</p>
              </div>
            ) : mathProblem ? (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-white shadow-inner">
                  <h4 className={`font-medium ${(rarityColors as any)[card.rarity].text} mb-2`}>Pregunta:</h4>
                  <p className="text-gray-700">{mathProblem.content.problem}</p>
                </div>
                
                {mathProblem.content.options && (
                  <div className="bg-white rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2">Opciones:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {mathProblem.content.options.map((option, index) => (
                        <div key={index} className="bg-gray-50 rounded px-3 py-2 text-center">
                          {option}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <details className="bg-white rounded-lg p-3">
                  <summary className="font-medium text-gray-900 cursor-pointer">
                    Ver respuesta y explicación
                  </summary>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><strong>Respuesta:</strong> {mathProblem.content.answer}</p>
                    <p><strong>Explicación:</strong> {mathProblem.content.explanation}</p>
                  </div>
                </details>
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">
                No hay problema matemático disponible para esta carta
              </p>
            )}
          </div>

          {/* Visual Generation Prompt */}
          {card.image_prompt && (
            <details className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Prompt de Generación Visual
              </summary>
              <p className="text-gray-700 mt-2 text-sm italic">{card.image_prompt}</p>
            </details>
          )}
        </div>
      </div>
    </div>
  );
} 