'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { DynamicCard } from '@/types/dynamicCards';

interface SpecialEffectCardProps {
  card: DynamicCard & {
    special_ability?: string;
    effect_type?: 'time_pressure' | 'bonus_multiplier' | 'chain_reaction' | 'transformation' | 'protection';
    effect_duration?: number; // seconds
    effect_intensity?: number; // 1-5 scale
  };
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  isPlaying?: boolean;
  effectActive?: boolean;
  onEffectTrigger?: (effect: string) => void;
  className?: string;
}

export function SpecialEffectCard({ 
  card, 
  size = 'medium', 
  onClick, 
  isPlaying = false,
  effectActive = false,
  onEffectTrigger,
  className = '' 
}: SpecialEffectCardProps) {
  
  const [animationState, setAnimationState] = useState<'idle' | 'charging' | 'active' | 'cooling'>('idle');
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);

  const sizeClasses = {
    small: 'w-24 h-36',
    medium: 'w-32 h-48', 
    large: 'w-40 h-60'
  };

  const effectColors = {
    time_pressure: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      glow: 'shadow-red-500/50'
    },
    bonus_multiplier: {
      primary: '#4ECDC4',
      secondary: '#45B7AF',
      glow: 'shadow-cyan-500/50'
    },
    chain_reaction: {
      primary: '#A8E6CF',
      secondary: '#88D8A3',
      glow: 'shadow-green-500/50'
    },
    transformation: {
      primary: '#C7CEEA',
      secondary: '#B8C6DB',
      glow: 'shadow-purple-500/50'
    },
    protection: {
      primary: '#F8B500',
      secondary: '#FFD60A',
      glow: 'shadow-yellow-500/50'
    }
  };

  const cardColors = card.effect_type ? effectColors[card.effect_type] : effectColors.bonus_multiplier;

  // Trigger special effects
  useEffect(() => {
    if (effectActive && card.effect_type) {
      setAnimationState('active');
      generateParticles();
      onEffectTrigger?.(card.special_ability || 'Special effect activated');
      
      const timeout = setTimeout(() => {
        setAnimationState('cooling');
        setTimeout(() => setAnimationState('idle'), 1000);
      }, (card.effect_duration || 3) * 1000);

      return () => clearTimeout(timeout);
    }
    
    // Explicitly return undefined for the else case
    return undefined;
  }, [effectActive, card.effect_type, card.effect_duration, card.special_ability, onEffectTrigger]);

  const generateParticles = () => {
    const newParticles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4
    }));
    setParticles(newParticles);

    // Animate particles
    const animateParticles = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        vx: p.vx * 0.98,
        vy: p.vy * 0.98
      })).filter(p => Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1));
    };

    const interval = setInterval(animateParticles, 50);
    setTimeout(() => {
      clearInterval(interval);
      setParticles([]);
    }, 3000);
  };

  const getEffectIcon = () => {
    switch (card.effect_type) {
      case 'time_pressure': return '⏰';
      case 'bonus_multiplier': return '✨';
      case 'chain_reaction': return '⚡';
      case 'transformation': return '🔄';
      case 'protection': return '🛡️';
      default: return '🌟';
    }
  };

  const getEffectDescription = () => {
    switch (card.effect_type) {
      case 'time_pressure': return 'Presión de Tiempo';
      case 'bonus_multiplier': return 'Multiplicador';
      case 'chain_reaction': return 'Reacción en Cadena';
      case 'transformation': return 'Transformación';
      case 'protection': return 'Protección';
      default: return 'Efecto Especial';
    }
  };

  const renderSpecialEffects = () => {
    if (animationState === 'idle') return null;

    return (
      <>
        {/* Particle System */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute w-1 h-1 rounded-full opacity-70 pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: cardColors.primary,
              boxShadow: `0 0 4px ${cardColors.primary}`
            }}
          />
        ))}

        {/* Energy Waves */}
        {animationState === 'active' && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 rounded-xl border-2 animate-ping"
              style={{ borderColor: cardColors.primary }}
            />
            <div 
              className="absolute inset-2 rounded-lg border animate-pulse"
              style={{ borderColor: cardColors.secondary }}
            />
          </div>
        )}

        {/* Charging Effect */}
        {animationState === 'charging' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
        )}

        {/* Cooling Effect */}
        {animationState === 'cooling' && (
          <div 
            className="absolute inset-0 rounded-xl opacity-50 animate-pulse"
            style={{ backgroundColor: cardColors.secondary }}
          />
        )}
      </>
    );
  };

  return (
    <div 
      className={`
        ${sizeClasses[size]}
        relative rounded-xl border-2 transition-all duration-300 cursor-pointer
        ${effectActive ? `ring-4 ring-opacity-60 ${cardColors.glow}` : ''}
        ${isPlaying ? 'hover:scale-105 hover:shadow-xl' : 'hover:scale-102'}
        ${animationState === 'active' ? 'animate-bounce' : ''}
        ${className}
      `}
      onClick={() => {
        if (card.effect_type && animationState === 'idle') {
          setAnimationState('charging');
          setTimeout(() => setAnimationState('active'), 500);
        }
        onClick?.();
      }}
      style={{
        borderColor: cardColors.primary,
        boxShadow: effectActive ? `0 0 20px ${cardColors.primary}` : 'none'
      }}
    >
      {/* Background with Special Gradient */}
      <div 
        className="absolute inset-0 rounded-xl opacity-90"
        style={{
          background: `linear-gradient(135deg, ${cardColors.primary}, ${cardColors.secondary})`
        }}
      />
      
      {/* Special Effects Layer */}
      {renderSpecialEffects()}

      {/* Card Content */}
      <div className="relative p-3 h-full flex flex-col text-white z-10">
        
        {/* Header with Effect Indicator */}
        <div className="mb-2 flex justify-between items-start">
          {/* Effect Badge */}
          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30">
            <span className="text-sm">{getEffectIcon()}</span>
            <span className="capitalize font-bold">{getEffectDescription()}</span>
          </div>
          
          {/* Power Badge with Effect Multiplier */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full px-2 py-1">
            <span className="text-xs font-bold">
              ⚡{card.base_power}
              {card.effect_intensity && card.effect_intensity > 1 && (
                <span className="text-yellow-300">×{card.effect_intensity}</span>
              )}
            </span>
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

        {/* Art Area with Effect Overlay */}
        <div className="flex-1 flex items-center justify-center mb-2 relative">
          {card.image_url ? (
            <div className="relative w-full h-full">
              <Image 
                src={card.image_url} 
                alt={card.name}
                fill
                className={`
                  object-cover rounded-lg transition-all duration-300
                  ${animationState === 'active' ? 'brightness-150 contrast-125' : 'opacity-90'}
                `}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          ) : (
            <div className="text-center">
              <div className={`
                text-4xl mb-1 filter drop-shadow-lg transition-all duration-300
                ${size === 'small' ? 'text-2xl' : size === 'large' ? 'text-6xl' : 'text-4xl'}
                ${animationState === 'active' ? 'scale-125 animate-pulse' : ''}
              `}>
                {getEffectIcon()}
              </div>
              <div className="text-xs opacity-75">
                {getEffectDescription().toUpperCase()}
              </div>
              <div className="text-xs opacity-60 mt-1">
                {card.problem_category || 'special'}
              </div>
            </div>
          )}

          {/* Effect Duration Indicator */}
          {animationState === 'active' && card.effect_duration && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              {card.effect_duration}s
            </div>
          )}
        </div>

        {/* Special Ability Description */}
        {card.special_ability && (
          <div className="mb-2 text-xs italic opacity-90 text-center bg-black bg-opacity-20 rounded px-2 py-1">
            &quot;{card.special_ability}&quot;
          </div>
        )}

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

          {/* Rarity and Effect Intensity */}
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs capitalize opacity-75">
              {card.rarity}
            </span>
            <span className="text-xs">
              {Array.from({ length: card.effect_intensity || 1 }, (_, _i) => '✨').join('')}
            </span>
          </div>

          {/* Effect Progress Bar */}
          <div className="w-full bg-white bg-opacity-20 rounded-full h-1">
            <div 
              className={`
                h-1 rounded-full transition-all duration-1000
                ${animationState === 'active' ? 'animate-pulse' : ''}
              `}
              style={{ 
                backgroundColor: cardColors.primary,
                width: animationState === 'active' ? '100%' : 
                       animationState === 'charging' ? '75%' :
                       animationState === 'cooling' ? '25%' : '0%'
              }}
            />
          </div>
        </div>

        {/* Playable/Effect Indicator */}
        {(isPlaying || effectActive) && (
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold animate-bounce"
               style={{ backgroundColor: cardColors.primary }}>
            {effectActive ? '⚡' : '▶'}
          </div>
        )}

        {/* Power Glow Effect */}
        <div className={`
          absolute inset-0 rounded-xl pointer-events-none transition-all duration-300
          ${animationState === 'active' ? cardColors.glow : ''}
        `} />
      </div>

      {/* Hover Tooltip for Effect Details */}
      {size === 'large' && (card.special_ability || card.effect_type) && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
          <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs">
            {card.special_ability && (
              <p className="italic mb-1">&quot;{card.special_ability}&quot;</p>
            )}
            {card.effect_type && (
              <p className="text-gray-300">
                Efecto: {getEffectDescription()}
                {card.effect_duration && ` (${card.effect_duration}s)`}
                {card.effect_intensity && card.effect_intensity > 1 && ` - Intensidad: ${card.effect_intensity}`}
              </p>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

// Utility component for simple special effect display
export function SpecialEffectBadge({ 
  effectType, 
  intensity = 1,
  active = false 
}: { 
  effectType: string; 
  intensity?: number;
  active?: boolean;
}) {
  const getEffectIcon = () => {
    switch (effectType) {
      case 'time_pressure': return '⏰';
      case 'bonus_multiplier': return '✨';
      case 'chain_reaction': return '⚡';
      case 'transformation': return '🔄';
      case 'protection': return '🛡️';
      default: return '🌟';
    }
  };

  return (
    <div className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300
      ${active ? 'bg-yellow-500 text-black animate-pulse' : 'bg-gray-700 text-white'}
    `}>
      <span className="text-sm">{getEffectIcon()}</span>
      {intensity > 1 && <span className="font-bold">×{intensity}</span>}
    </div>
  );
} 