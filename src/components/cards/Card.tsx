'use client';

import React from 'react';
import Image from 'next/image';

// Database card interface (matching our generated cards)
export interface DatabaseCard {
  id: string;
  name: string;
  description?: string;
  type: 'attack' | 'defense' | 'special' | 'support';
  rarity: 'común' | 'raro' | 'épico' | 'legendario';
  attack_power: number;
  defense_power: number;
  cost: number;
  difficulty_level: number;
  problem_type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions' | 'patterns' | 'logic' | 'deduction';
  image_url?: string;
  image_prompt?: string;
  created_at?: string;
  is_active?: boolean;
}

interface CardProps {
  card: DatabaseCard;
  size?: 'small' | 'medium' | 'large';
  isHovered?: boolean;
  isSelected?: boolean;
  showDetails?: boolean;
  onClick?: () => void;
  onHover?: () => void;
  className?: string;
}

// Rarity configurations - ACTUALIZADAS con colores sólidos más distintivos
const rarityConfig = {
  común: {
    gradient: 'from-emerald-600 via-emerald-500 to-emerald-400',
    border: 'border-emerald-500',
    glow: 'shadow-emerald-400',
    accent: 'text-emerald-50',
    bgOverlay: 'bg-emerald-600',
    icon: '🌿',
    frame: 'border-2',
    solidColor: '#10b981' // emerald-500
  },
  raro: {
    gradient: 'from-blue-600 via-blue-500 to-blue-400',
    border: 'border-blue-500',
    glow: 'shadow-blue-400',
    accent: 'text-blue-50',
    bgOverlay: 'bg-blue-600',
    icon: '💎',
    frame: 'border-2 shadow-md',
    solidColor: '#3b82f6' // blue-500
  },
  épico: {
    gradient: 'from-purple-600 via-purple-500 to-purple-400',
    border: 'border-purple-500',
    glow: 'shadow-purple-400',
    accent: 'text-purple-50',
    bgOverlay: 'bg-purple-600',
    icon: '⚡',
    frame: 'border-3 shadow-lg',
    solidColor: '#8b5cf6' // purple-500
  },
  legendario: {
    gradient: 'from-amber-500 via-yellow-400 to-orange-400',
    border: 'border-amber-400',
    glow: 'shadow-amber-300',
    accent: 'text-amber-50',
    bgOverlay: 'bg-amber-500',
    icon: '👑',
    frame: 'border-4 shadow-xl',
    solidColor: '#f59e0b' // amber-500
  }
};

// Type configurations
const typeConfig = {
  attack: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    icon: '⚔️',
    name: 'Ataque'
  },
  defense: {
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    icon: '🛡️',
    name: 'Defensa'
  },
  special: {
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    icon: '✨',
    name: 'Especial'
  },
  support: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    icon: '🌟',
    name: 'Apoyo'
  }
};

// Problem type configurations
const problemTypeConfig = {
  addition: { icon: '➕', name: 'Suma', color: 'text-green-600' },
  subtraction: { icon: '➖', name: 'Resta', color: 'text-orange-600' },
  multiplication: { icon: '✖️', name: 'Multiplicación', color: 'text-red-600' },
  division: { icon: '➗', name: 'División', color: 'text-blue-600' },
  fractions: { icon: '🔢', name: 'Fracciones', color: 'text-purple-600' },
  patterns: { icon: '🔄', name: 'Patrones', color: 'text-indigo-600' },
  logic: { icon: '🧠', name: 'Lógica', color: 'text-cyan-600' },
  deduction: { icon: '🔍', name: 'Deducción', color: 'text-teal-600' }
};

// Size configurations - UPDATED to be wider like MTG cards with better proportions
const sizeConfig = {
  small: {
    container: 'w-40 h-56', // Much wider ratio (approx 2.5:3.5)
    text: {
      name: 'text-xs',
      stats: 'text-xs',
      cost: 'text-xs'
    },
    padding: 'p-2',
    gap: 'gap-1',
    imageHeight: 'h-24' // more presence for image
  },
  medium: {
    container: 'w-52 h-72', // Much wider ratio (approx 2.6:3.6)  
    text: {
      name: 'text-sm',
      stats: 'text-sm',
      cost: 'text-sm'
    },
    padding: 'p-3',
    gap: 'gap-2',
    imageHeight: 'h-36' // more presence for image
  },
  large: {
    container: 'w-64 h-88', // Much wider ratio (approx 2.9:4.0)
    text: {
      name: 'text-base',
      stats: 'text-base',
      cost: 'text-base'
    },
    padding: 'p-4',
    gap: 'gap-3',
    imageHeight: 'h-44' // more presence for image
  }
};

export function Card({ 
  card, 
  size = 'medium', 
  isHovered = false, 
  isSelected = false, 
  showDetails = false,
  onClick, 
  onHover,
  className = ''
}: CardProps) {
  const rarity = rarityConfig[card.rarity];
  const typeData = typeConfig[card.type];
  const problemType = problemTypeConfig[card.problem_type] || problemTypeConfig.logic;
  const sizeData = sizeConfig[size];

  const handleClick = () => {
    onClick?.();
  };

  const handleMouseEnter = () => {
    onHover?.();
  };

  return (
    <div
      className={`
        relative ${sizeData.container} ${sizeData.padding}
        bg-gradient-to-br ${rarity.gradient}
        ${rarity.border} ${rarity.frame}
        rounded-xl overflow-hidden
        cursor-pointer transform transition-all duration-300
        ${isHovered ? 'scale-105 -translate-y-1' : ''}
        ${isSelected ? 'ring-4 ring-blue-400 ring-opacity-50' : ''}
        ${isHovered ? `shadow-xl ${rarity.glow}` : 'shadow-md'}
        hover:shadow-xl
        ${className}
      `}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" 
             style={{
               backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), 
                                radial-gradient(circle at 80% 50%, white 1px, transparent 1px)`,
               backgroundSize: '20px 20px'
             }} 
        />
      </div>

      {/* Card Content with improved spacing */}
      <div className="relative z-10 h-full flex flex-col">
        
        {/* Header Section - Fixed height for consistency */}
        <div className="flex justify-between items-start mb-2">
          {/* Cost Badge - Improved design */}
          <div className={`
            ${typeData.bg} ${typeData.color}
            rounded-full w-7 h-7 flex items-center justify-center
            ${sizeData.text.cost} font-bold border-2 border-white shadow-sm
          `}>
            {card.cost}
          </div>

          {/* Rarity Indicator - Better positioning */}
          <div className="text-lg drop-shadow-sm">
            {rarity.icon}
          </div>
        </div>

        {/* Card Name - Consistent height */}
        <div className={`${sizeData.text.name} font-bold ${rarity.accent} text-center leading-tight mb-2 min-h-[2rem] flex items-center justify-center`}>
          {card.name}
        </div>

        {/* Card Image Area - MORE PRESENCE like MTG cards */}
        <div className={`relative ${sizeData.imageHeight} w-full mb-3 rounded-lg overflow-hidden border-2 border-white/30`}>
          {card.image_url ? (
            <Image 
              src={card.image_url} 
              alt={card.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={`
              w-full h-full ${typeData.bg} 
              flex items-center justify-center text-6xl
            `}>
              {typeData.icon}
            </div>
          )}
          
          {/* Type Overlay - MTG style */}
          <div className={`
            absolute bottom-1 left-1 
            ${typeData.bg} ${typeData.color}
            rounded-md px-2 py-1 ${sizeData.text.stats} font-medium
            border border-white/30 shadow-sm backdrop-blur-sm
          `}>
            <span className="mr-1">{typeData.icon}</span>
            {typeData.name}
          </div>
        </div>

        {/* TEXT FRAME SECTION - Like MTG cards */}
        <div className="space-y-2">
          {/* Problem Type - MTG style text box */}
          <div className={`
            ${sizeData.text.stats} font-medium
            bg-gradient-to-r from-white/25 to-white/15 
            border border-white/40 rounded-lg px-3 py-2
            backdrop-blur-sm shadow-inner
            text-center text-white
          `}>
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">{problemType.icon}</span>
              <span className="font-bold">{problemType.name}</span>
            </div>
          </div>

          {/* Stats Section - MTG style P/T box */}
          <div className={`
            flex justify-between ${sizeData.text.stats} font-bold
            bg-gradient-to-r from-white/25 to-white/15 
            border border-white/40 rounded-lg px-3 py-2
            backdrop-blur-sm shadow-inner
          `}>
            <div className="flex items-center gap-2">
              <span className="text-red-300 text-lg">⚔️</span>
              <span className="text-white font-bold">{card.attack_power}</span>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="flex items-center gap-2">
              <span className="text-blue-300 text-lg">🛡️</span>
              <span className="text-white font-bold">{card.defense_power}</span>
            </div>
          </div>
        </div>

        {/* Difficulty Stars - MTG style */}
        <div className={`
          flex justify-center gap-1 py-2 px-3 mt-2
          bg-gradient-to-r from-white/20 to-white/10 
          border border-white/30 rounded-lg
          backdrop-blur-sm shadow-inner
        `}>
          {Array.from({ length: 5 }, (_, i) => (
            <span 
              key={i} 
              className={`
                text-lg
                ${i < card.difficulty_level ? 'text-yellow-300 drop-shadow-sm' : 'text-white/30'}
              `}
            >
              ⭐
            </span>
          ))}
        </div>

        {/* Extended Details - MTG style text box */}
        {showDetails && card.description && (
          <div className={`
            text-xs text-white/90 leading-tight mt-2
            bg-gradient-to-r from-white/20 to-white/10 
            border border-white/30 rounded-lg p-3
            backdrop-blur-sm shadow-inner
          `}>
            <div className="text-center italic">
              &ldquo;{card.description}&rdquo;
            </div>
          </div>
        )}
      </div>

      {/* Hover Effect Overlay */}
      {isHovered && (
        <div className="absolute inset-0 bg-white bg-opacity-15 rounded-xl pointer-events-none" />
      )}

      {/* Magical Shine Effect for Legendary */}
      {card.rarity === 'legendario' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer rounded-xl pointer-events-none" />
      )}
    </div>
  );
} 