// @ts-nocheck
'use client';

import React from 'react';
import Image from 'next/image';
import { 
  DynamicCard as DynamicCardType,
  getProblemTypeIcon,
  getCategoryIcon
} from '@/types/dynamicCards';

interface DynamicCardProps {
  card: DynamicCardType;
  size?: 'small' | 'medium' | 'large';
  onClick?: (() => void) | undefined;
  playable?: boolean;
  selected?: boolean;
  className?: string;
}

export function DynamicCard({ 
  card, 
  size = 'medium', 
  onClick, 
  playable = false,
  selected = false,
  className = '' 
}: DynamicCardProps) {
  
  const sizeClasses = {
    small: 'w-24 h-36',
    medium: 'w-32 h-48', 
    large: 'w-40 h-60'
  };

  const rarityGradients = {
    common: 'from-emerald-600 via-emerald-500 to-emerald-400',
    rare: 'from-blue-600 via-blue-500 to-blue-400',
    epic: 'from-purple-600 via-purple-500 to-purple-400',
    legendary: 'from-amber-500 via-yellow-400 to-orange-400'
  };

  // Use problem type info or fallback to legacy
  const problemInfo = {
    icon: card.problem_icon || getProblemTypeIcon(card.problem_code || 'addition'),
    name: card.problem_name_es || card.problem_type || 'Suma',
    category: (card.problem_category || card.category || 'arithmetic') as 'arithmetic' | 'algebra' | 'geometry' | 'logic' | 'statistics',
    color: card.problem_color || '#22C55E'
  };

  const rarityStars = {
    común: '⭐',
    raro: '⭐⭐',
    épico: '⭐⭐⭐',
    legendario: '⭐⭐⭐⭐'
  };

  const isLegendary = card.rarity === 'legendario';

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        relative rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${selected ? 'ring-4 ring-blue-400 transform scale-105' : ''}
        ${playable ? 'hover:scale-105 hover:shadow-xl' : 'hover:scale-102'}
        ${isLegendary ? 'animate-pulse' : ''}
        ${className}
      `}
      onClick={onClick}
      style={{
        borderColor: problemInfo.color || '#22C55E'
      }}
    >
      {/* Background Gradient */}
      <div className={`
        absolute inset-0 rounded-xl bg-gradient-to-br ${(rarityGradients as any)[card.rarity]}
        opacity-90
      `} />
      
      {/* Legendary Shimmer Effect */}
      {isLegendary && (
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer" />
      )}

      {/* Card Content */}
      <div className="relative p-3 h-full flex flex-col text-white">
        
        {/* Header */}
        <div className="mb-2">
          {/* Problem Type Badge */}
          <div className={`
            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
            bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30
          `}>
            <span className="text-sm">{problemInfo.icon}</span>
            <span className="capitalize font-bold">{problemInfo.name}</span>
          </div>
          
          {/* Power Badge */}
          <div className="float-right bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-bold">⚡{card.base_power}</span>
          </div>
        </div>

        {/* Card Name */}
        <div className="mb-2">
          <h3 className={`
            font-bold leading-tight text-white drop-shadow-lg
            ${size === 'small' ? 'text-xs' : size === 'medium' ? 'text-sm' : 'text-base'}
          `}>
            {card.name}
          </h3>
        </div>

        {/* Art Area */}
        <div className="flex-1 flex items-center justify-center mb-2">
          {card.image_url ? (
            <div className="relative w-full h-full">
              <Image 
                src={card.image_url} 
                alt={card.name}
                fill
                className="object-cover rounded-lg opacity-90"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className={`
                text-4xl mb-1 filter drop-shadow-lg
                ${size === 'small' ? 'text-2xl' : size === 'large' ? 'text-6xl' : 'text-4xl'}
              `}>
                {problemInfo.icon}
              </div>
              <div className="text-xs opacity-75">
                {problemInfo.name.toUpperCase()}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {getCategoryIcon(problemInfo.category)} {problemInfo.category}
              </div>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="mt-auto">
          {/* Level Range & Difficulty */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs opacity-75">
              Nivel {Array.isArray(card.level_range) ? `${card.level_range[0]}-${card.level_range[1]}` : '1-5'}
            </span>
            <span className="text-xs opacity-75">
              Dif. {card.problem_difficulty_base || 1}/10
            </span>
          </div>

          {/* Rarity and Stars */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs capitalize opacity-75">
              {card.rarity}
            </span>
            <span className="text-xs">
              {(rarityStars as any)[card.rarity]}
            </span>
          </div>

          {/* Rarity Bar */}
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
            <div 
              className={`h-1 rounded-full bg-white opacity-80`}
              style={{ 
                width: card.rarity === 'común' ? '25%' : 
                       card.rarity === 'raro' ? '50%' : 
                       card.rarity === 'épico' ? '75%' : '100%' 
              }}
            />
          </div>
        </div>

        {/* Playable Indicator */}
        {playable && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce">
            ▶
          </div>
        )}

        {/* Power Glow Effect */}
        <div className={`
          absolute inset-0 rounded-xl pointer-events-none
          ${isLegendary ? 'shadow-lg shadow-yellow-400/50' : ''}
          ${card.rarity === 'épico' ? 'shadow-md shadow-purple-400/30' : ''}
          ${card.rarity === 'raro' ? 'shadow-md shadow-blue-400/20' : ''}
        `} />
      </div>

      {/* Hover Tooltip for Large Size */}
      {size === 'large' && card.lore && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs">
            <p className="italic">&quot;{card.lore}&quot;</p>
            {card.problem_description_es && (
              <p className="mt-1 text-gray-300">{card.problem_description_es}</p>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Simplified card for collection view
export function DynamicCardSimple({ card, onClick }: { card: DynamicCardType; onClick?: () => void }) {
  return <DynamicCard card={card} size="medium" onClick={onClick} />;
}

// Playable card for battle
export function DynamicCardPlayable({ 
  card, 
  onClick, 
  playable = true,
  selected = false 
}: { 
  card: DynamicCardType; 
  onClick?: () => void;
  playable?: boolean;
  selected?: boolean;
}) {
  return (
    <DynamicCard 
      card={card} 
      size="large" 
      onClick={onClick} 
      playable={playable}
      selected={selected}
      className="transform transition-all duration-200 hover:shadow-2xl"
    />
  );
} 