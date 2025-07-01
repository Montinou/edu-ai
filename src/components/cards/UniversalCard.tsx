'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

export interface UniversalCardProps {
  id: string;
  name: string;
  rarity: string;
  attack_power: number;
  category: string;
  problem_type_id?: number;
  problem_code?: string;
  difficulty_level: number;
  image_url?: string | undefined;
  lore?: string;
  description?: string;
  // Customization props
  size?: 'small' | 'medium' | 'large';
  showPlayButton?: boolean;
  isSelected?: boolean;
  isLoading?: boolean;
  canPlay?: boolean;
  loadingText?: string;
  
  // Event handlers
  onClick?: () => void;
  onPlayClick?: () => void;
}

interface UniversalCardSize {
  width: string;
  height: string;
  imageHeight: string;
  padding: string;
  titleSize: string;
  statsSize: string;
  buttonSize: string;
}

const cardSizes: Record<string, UniversalCardSize> = {
  small: {
    width: '240px',
    height: '320px',
    imageHeight: 'h-32',
    padding: 'p-3',
    titleSize: 'text-sm',
    statsSize: 'text-xs',
    buttonSize: 'py-2 px-4 text-xs'
  },
  medium: {
    width: '280px',
    height: '380px',
    imageHeight: 'h-40',
    padding: 'p-4',
    titleSize: 'text-base',
    statsSize: 'text-xs',
    buttonSize: 'py-2 px-4 text-sm'
  },
  large: {
    width: '320px',
    height: '450px',
    imageHeight: 'h-48',
    padding: 'p-5',
    titleSize: 'text-lg',
    statsSize: 'text-sm',
    buttonSize: 'py-3 px-6 text-sm'
  }
};

// Export helper functions for reuse
export const getRarityColor = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'común': case 'common': return '#6b7280';
    case 'raro': case 'rare': return '#3b82f6';
    case 'épico': case 'epic': return '#8b5cf6';
    case 'legendario': case 'legendary': return '#f59e0b';
    default: return '#6b7280';
  }
};

export const getRarityColorValues = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'común': case 'common': 
      return { primary: '#6b7280', secondary: '#9ca3af', light: '#f3f4f6' };
    case 'raro': case 'rare': 
      return { primary: '#3b82f6', secondary: '#60a5fa', light: '#dbeafe' };
    case 'épico': case 'epic': 
      return { primary: '#8b5cf6', secondary: '#a78bfa', light: '#ede9fe' };
    case 'legendario': case 'legendary': 
      return { primary: '#f59e0b', secondary: '#fbbf24', light: '#fef3c7' };
    default: 
      return { primary: '#6b7280', secondary: '#9ca3af', light: '#f3f4f6' };
  }
};

export const getRarityIcon = (rarity: string) => {
  switch (rarity?.toLowerCase()) {
    case 'común': case 'common': return '⚪';
    case 'raro': case 'rare': return '🔵';
    case 'épico': case 'epic': return '🟣';
    case 'legendario': case 'legendary': return '🟡';
    default: return '⚪';
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category?.toLowerCase()) {
    case 'math': case 'arithmetic': case 'aritmética': return '📊';
    case 'logic': case 'lógica': return '🧠';
    case 'geometry': case 'geometría': return '📐';
    case 'algebra': case 'álgebra': return '🔢';
    default: return '📊';
  }
};

export default function UniversalCard({
  name,
  rarity = 'common',
  attack_power,
  category,
  difficulty_level,
  image_url,
  description,
  size = 'medium',
  showPlayButton = true,
  isSelected = false,
  isLoading = false,
  canPlay = true,
  loadingText = 'Generando...',
  onClick,
  onPlayClick
}: UniversalCardProps) {
  const cardSize = cardSizes[size];
  const rarityColors = getRarityColorValues(rarity);
  
  return (
    <motion.div
      className={`
        relative rounded-xl shadow-lg border-4 
        transition-all duration-300 cursor-pointer overflow-hidden flex-shrink-0
        ${isSelected ? 'ring-4 ring-blue-300' : ''}
        ${canPlay && !isLoading ? 'hover:scale-105 hover:shadow-xl' : ''}
        ${!canPlay && !isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{
        width: cardSize.width,
        height: cardSize.height,
        borderColor: getRarityColor(rarity),
        isolation: 'isolate'
      }}
      onClick={canPlay ? onClick : undefined}
      whileHover={canPlay ? { scale: 1.02, y: -5 } : {}}
      whileTap={canPlay ? { scale: 0.98 } : {}}
      animate={isLoading ? {
        boxShadow: [
          `0 0 20px ${rarityColors.primary}40`,
          `0 0 30px ${rarityColors.secondary}50`,
          `0 0 20px ${rarityColors.primary}40`
        ]
      } : {}}
      transition={{
        boxShadow: {
          duration: 1.5,
          repeat: isLoading ? Infinity : 0,
          ease: "easeInOut"
        }
      }}
    >
      {/* Background Image - FULLPICK (covers entire card) */}
      {image_url ? (
        <div className="absolute inset-0">
          <Image
            src={image_url}
            alt={name}
            width={400}
            height={600}
            className="w-full h-full object-cover"
          />
          {/* Subtle overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/20"></div>
        </div>
      ) : (
        <div 
          className="absolute inset-0 flex items-center justify-center text-6xl text-white"
          style={{
            background: `linear-gradient(135deg, ${getRarityColor(rarity)}80, ${getRarityColor(rarity)}40)`
          }}
        >
          {getCategoryIcon(category)}
          {/* Subtle overlay for consistency */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-black/15"></div>
        </div>
      )}

      {/* Loading Overlay - Holographic Magic Effect */}
      {isLoading && (
        <motion.div
          className="absolute inset-0 rounded-xl overflow-hidden z-20"
          style={{ isolation: 'isolate' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Holographic Background */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(45deg, ${rarityColors.primary}20, transparent, ${rarityColors.secondary}30, transparent, ${rarityColors.light}20)`,
              backgroundSize: '200% 200%'
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Holographic Shimmer Lines */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                ${rarityColors.primary}40 10px,
                ${rarityColors.primary}40 20px,
                transparent 20px,
                transparent 30px,
                ${rarityColors.secondary}30 30px,
                ${rarityColors.secondary}30 40px
              )`,
              backgroundSize: '100% 100%'
            }}
            animate={{
              backgroundPosition: ['0px 0px', '80px 80px', '0px 0px']
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          {/* Floating Magical Particles */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: `radial-gradient(circle, ${rarityColors.primary}, ${rarityColors.secondary})`,
                left: `${10 + (i * 10)}%`,
                top: `${20 + (i * 8)}%`,
                boxShadow: `0 0 10px ${rarityColors.primary}80`
              }}
              animate={{
                y: [-20, -40, -20],
                x: [0, 15, 0],
                scale: [1, 1.5, 1],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 2 + (i * 0.2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.3
              }}
            />
          ))}
          
          {/* Loading Text with Magical Glow */}
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="relative flex flex-col items-center justify-center">
              <motion.div
                className="relative flex items-center justify-center"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.h2 
                  className={`font-bold text-white text-center ${cardSize.statsSize === 'text-xs' ? 'text-2xl' : cardSize.statsSize === 'text-sm' ? 'text-3xl' : 'text-4xl'}`}
                  style={{
                    fontFamily: 'var(--font-cinzel), "Times New Roman", serif',
                    fontWeight: '900',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    textShadow: `
                      0 0 20px ${rarityColors.primary}ff,
                      0 0 40px ${rarityColors.secondary}cc,
                      0 0 60px ${rarityColors.light}aa,
                      4px 4px 8px rgba(0,0,0,0.9),
                      -2px -2px 6px rgba(0,0,0,0.8),
                      2px -2px 6px rgba(0,0,0,0.8),
                      -2px 2px 6px rgba(0,0,0,0.8)
                    `,
                  }}
                  animate={{
                    textShadow: [
                      `0 0 20px ${rarityColors.primary}ff, 0 0 40px ${rarityColors.secondary}cc, 0 0 60px ${rarityColors.light}aa, 4px 4px 8px rgba(0,0,0,0.9), -2px -2px 6px rgba(0,0,0,0.8), 2px -2px 6px rgba(0,0,0,0.8), -2px 2px 6px rgba(0,0,0,0.8)`,
                      `0 0 30px ${rarityColors.primary}ff, 0 0 60px ${rarityColors.secondary}ff, 0 0 90px ${rarityColors.light}cc, 4px 4px 8px rgba(0,0,0,0.9), -2px -2px 6px rgba(0,0,0,0.8), 2px -2px 6px rgba(0,0,0,0.8), -2px 2px 6px rgba(0,0,0,0.8)`,
                      `0 0 20px ${rarityColors.primary}ff, 0 0 40px ${rarityColors.secondary}cc, 0 0 60px ${rarityColors.light}aa, 4px 4px 8px rgba(0,0,0,0.9), -2px -2px 6px rgba(0,0,0,0.8), 2px -2px 6px rgba(0,0,0,0.8), -2px 2px 6px rgba(0,0,0,0.8)`
                    ]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  ⚡ CONJURANDO ⚡
                </motion.h2>
                
                {/* Mystical Runes around the text */}
                {['✦', '✧', '✩', '✪', '✫', '✬'].map((rune, index) => {
                  const angle = (index * 60) * Math.PI / 180; // 60 grados entre cada runa
                  const radius = 80; // Radio del círculo de runas
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  
                  return (
                    <motion.span
                      key={index}
                      className="absolute text-2xl"
                      style={{
                        color: rarityColors.primary,
                        textShadow: `0 0 15px ${rarityColors.primary}80`,
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [0.8, 1.2, 0.8],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 3 + (index * 0.3),
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                    >
                      {rune}
                    </motion.span>
                  );
                })}
              </motion.div>
              
              <motion.p 
                className={`text-gray-100 text-center mt-4 ${cardSize.statsSize === 'text-xs' ? 'text-sm' : cardSize.statsSize === 'text-sm' ? 'text-base' : 'text-lg'}`}
                style={{
                  fontFamily: 'var(--font-playfair), "Times New Roman", serif',
                  fontStyle: 'italic',
                  letterSpacing: '0.05em',
                  textShadow: `
                    0 0 15px ${rarityColors.primary}aa,
                    0 0 25px ${rarityColors.secondary}80,
                    2px 2px 6px rgba(0,0,0,0.95),
                    -1px -1px 4px rgba(0,0,0,0.9)
                  `
                }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale: [0.95, 1.05, 0.95]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Conjurando magia de {name}...
              </motion.p>
            </div>
          </div>
          
          {/* Ancient Magic Circles - Centered */}
          <div className="absolute inset-0 flex items-center justify-center z-20">
            {/* Outer Circle */}
            <motion.div
              className="absolute"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div
                className="w-40 h-40 rounded-full border-2 border-dashed"
                style={{
                  borderColor: rarityColors.primary + '60',
                  boxShadow: `0 0 30px ${rarityColors.primary}40`
                }}
              ></div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Rarity and Type Badge - Top Overlay */}
      {!isLoading && (
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center z-10">
          <div 
            className={`px-3 py-1 rounded-full text-white shadow-lg font-bold ${cardSize.statsSize}`}
            style={{ 
              backgroundColor: `${getRarityColor(rarity)}90`,
              boxShadow: `0 0 15px ${getRarityColor(rarity)}60`,
              textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
            }}
          >
            {getRarityIcon(rarity)} {rarity.toUpperCase()}
          </div>
          <div className="text-2xl p-2 shadow-lg">
            <span style={{
              filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9)) drop-shadow(-1px -1px 2px rgba(0,0,0,0.9)) drop-shadow(1px -1px 2px rgba(0,0,0,0.9)) drop-shadow(-1px 1px 2px rgba(0,0,0,0.9))'
            }}>
              {getCategoryIcon(category)}
            </span>
          </div>
        </div>
      )}

      {/* Card Title - Center Top Overlay */}
      {!isLoading && (
        <div className="absolute top-16 left-3 right-3 z-10">
          <h3 className={`font-bold text-white leading-tight text-center ${cardSize.titleSize}`}
              style={{
                textShadow: '3px 3px 6px rgba(0,0,0,0.95), -2px -2px 4px rgba(0,0,0,0.95), 2px -2px 4px rgba(0,0,0,0.95), -2px 2px 4px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9)'
              }}>
            {name}
          </h3>
        </div>
      )}

      {/* Stats Section - Moved Higher Up */}
      {!isLoading && (
        <div className="absolute top-32 left-3 right-3 z-10">
          <div className={`p-4 space-y-3 ${cardSize.statsSize}`}>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium" 
                    style={{textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'}}>
                Poder Base:
              </span>
              <span className="font-bold text-red-200 text-lg" 
                    style={{textShadow: '3px 3px 6px rgba(0,0,0,0.95), -2px -2px 4px rgba(0,0,0,0.95), 2px -2px 4px rgba(0,0,0,0.95), -2px 2px 4px rgba(0,0,0,0.95), 0 0 12px rgba(0,0,0,0.9)'}}>
                {attack_power}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium"
                    style={{textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'}}>
                Categoría:
              </span>
              <span className="font-semibold text-blue-200 capitalize"
                    style={{textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'}}>
                {category}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white font-medium"
                    style={{textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'}}>
                Dificultad Base:
              </span>
              <span className="font-semibold text-orange-200"
                    style={{textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.8)'}}>
                {difficulty_level}/10
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Description - Legend Text (Moved to Bottom) */}
      {description && !isLoading && (
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className={`text-amber-100 leading-relaxed italic text-center ${cardSize.statsSize === 'text-xs' ? 'text-xs' : cardSize.statsSize === 'text-sm' ? 'text-sm' : 'text-base'}`}
             style={{
               fontFamily: 'Georgia, "Times New Roman", serif',
               fontWeight: '500',
               textShadow: '2px 2px 4px rgba(0,0,0,0.95), -1px -1px 3px rgba(0,0,0,0.95), 1px -1px 3px rgba(0,0,0,0.95), -1px 1px 3px rgba(0,0,0,0.95), 0 0 10px rgba(0,0,0,0.85)'
             }}>
            &ldquo;{description}&rdquo;
          </p>
        </div>
      )}

      {/* Play Button - Bottom Overlay (Only show if explicitly requested) */}
      {showPlayButton && onPlayClick && !isLoading && (
        <button
          className={`
            absolute bottom-3 left-3 right-3 bg-gradient-to-r from-blue-600/95 to-purple-700/95 
            text-white font-bold rounded-lg shadow-xl hover:from-blue-700 hover:to-purple-800 
            transition-all duration-200 flex items-center justify-center gap-2 z-10
            ${cardSize.buttonSize}
          `}
          style={{
            boxShadow: `0 0 25px ${rarityColors.primary}50, 0 6px 20px rgba(0,0,0,0.4)`,
            textShadow: '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(0,0,0,0.9), 1px -1px 2px rgba(0,0,0,0.9), -1px 1px 2px rgba(0,0,0,0.9)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onPlayClick?.();
          }}
          disabled={isLoading || !canPlay}
        >
          <Play className="w-4 h-4" style={{
            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.9)) drop-shadow(-1px -1px 2px rgba(0,0,0,0.9)) drop-shadow(1px -1px 2px rgba(0,0,0,0.9)) drop-shadow(-1px 1px 2px rgba(0,0,0,0.9))'
          }} />
          <span>{isLoading ? loadingText : '¡Jugar Carta!'}</span>
        </button>
      )}
    </motion.div>
  );
}