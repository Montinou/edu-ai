// @ts-nocheck
'use client';

import React, { useRef, useState, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import type { Card3DProps, CardRenderState, CardFrameType } from '@/types/cards';

// Extend Three.js objects to be available as JSX elements
extend(THREE);

// Frame configurations for the 5 card types
const frameConfigs = {
  basicas: {
    imagePath: '/images/cards/frames/basicas-frame.png',
    borderColor: '#22c55e', // Green
    accentColor: '#4ade80',
    glowColor: '#86efac',
    textColor: '#ffffff',
    backgroundPattern: 'dots',
    foilEffect: false,
    holographicEffect: false,
  },
  intermedias: {
    imagePath: '/images/cards/frames/intermedias-frame.png',
    borderColor: '#8b5cf6', // Purple
    accentColor: '#a78bfa',
    glowColor: '#c4b5fd',
    textColor: '#ffffff',
    backgroundPattern: 'stars',
    foilEffect: true,
    holographicEffect: false,
  },
  avanzadas: {
    imagePath: '/images/cards/frames/avanzadas-frame.png',
    borderColor: '#ef4444', // Red
    accentColor: '#f87171',
    glowColor: '#fca5a5',
    textColor: '#ffffff',
    backgroundPattern: 'runes',
    foilEffect: true,
    holographicEffect: true,
  },
  logica: {
    imagePath: '/images/cards/frames/logica-frame.png',
    borderColor: '#3b82f6', // Blue
    accentColor: '#60a5fa',
    glowColor: '#93c5fd',
    textColor: '#ffffff',
    backgroundPattern: 'circuits',
    foilEffect: false,
    holographicEffect: false,
  },
  especiales: {
    imagePath: '/images/cards/frames/especiales-frame.png',
    borderColor: '#f8fafc', // White/Silver
    accentColor: '#e2e8f0',
    glowColor: '#cbd5e1',
    textColor: '#1e293b',
    backgroundPattern: 'cosmic',
    foilEffect: true,
    holographicEffect: true,
  },
};

// Function to determine frame type based on card properties
function getFrameType(card: { frame?: { type?: CardFrameType }; type?: string; rarity?: string; power?: number }): CardFrameType {
  if (card.frame?.type) return card.frame.type;
  
  // Special handling for logic cards
  if (card.type === 'logic') return 'logica';
  
  // Fallback based on rarity and power level
  if (card.rarity === 'legendary' || (card.power && card.power >= 80)) return 'especiales';
  if (card.rarity === 'epic' || (card.power && card.power >= 60)) return 'avanzadas';
  if (card.rarity === 'rare' || (card.power && card.power >= 40)) return 'intermedias';
  return 'basicas';
}

// Function to get card image based on card properties - UPDATED to match RevolutionaryCardDemo
function getCardImage(card: { name?: string; type?: string; id?: string; image_url?: string }): string {
  // First priority: use the image_url from database if available (exactly like RevolutionaryCardDemo)
  if (card.image_url) {
    console.log(`🖼️ Using database image for card ${card.name}: ${card.image_url}`);
    return card.image_url;
  }

  // Map specific cards to their images (fallback for cards without image_url)
  const cardImageMap: { [key: string]: string } = {
    'suma básica': '/images/cards/card-images/suma-basica.svg',
    'multiplicación mágica': '/images/cards/card-images/multiplicacion-magica.svg',
    'patrón del dragón': '/images/cards/card-images/patron-dragon.svg',
    // Add more mappings as needed
  };

  // Try to find by name first
  if (card.name && cardImageMap[card.name.toLowerCase()]) {
    console.log(`🗂️ Using mapped image for card ${card.name}: ${cardImageMap[card.name.toLowerCase()]}`);
    return cardImageMap[card.name.toLowerCase()];
  }

  // Fallback based on card type
  if (card.type === 'math') {
    console.log(`📐 Using math default for card ${card.name}`);
    return '/images/cards/card-images/math-default.svg';
  } else if (card.type === 'logic') {
    console.log(`🧩 Using logic default for card ${card.name}`);
    return '/images/cards/card-images/logic-default.svg';
  }

  // Ultimate fallback - use a placeholder image
  console.log(`🎴 Using placeholder for card ${card.name}`);
  return '/images/cards/card-images/placeholder.svg';
}

// Enhanced shader for custom frames with better visual effects
const enhancedCardVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    vViewPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const enhancedCardFragmentShader = `
  uniform float time;
  uniform float glowIntensity;
  uniform vec3 frameColor;
  uniform vec3 accentColor;
  uniform vec3 glowColor;
  uniform bool holographic;
  uniform bool foilEffect;
  uniform sampler2D cardTexture;
  uniform sampler2D frameTexture;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;
  
  // Noise function for texture generation
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }
  
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  
  void main() {
    vec2 uv = vUv;
    
    // Sample the card artwork texture - THIS IS THE MAIN IMAGE
    vec4 cardImage = texture2D(cardTexture, uv);
    
    // If card image is valid, show it prominently like in RevolutionaryCardDemo
    if (cardImage.a > 0.1) {
      // Show the card image with a subtle frame overlay
      vec3 finalColor = cardImage.rgb;
      
      // Add subtle frame border (only at edges)
      float borderWidth = 0.05;
      float borderMask = 1.0 - smoothstep(borderWidth - 0.01, borderWidth, 
        min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
      
      // Mix frame color with image only at borders
      finalColor = mix(finalColor, frameColor, borderMask * 0.3);
      
      // Add glow effect when hovered
      if (glowIntensity > 0.0) {
        finalColor += glowColor * glowIntensity * 0.2;
      }
      
      // Subtle foil effect if enabled
      if (foilEffect) {
        float foil = sin(uv.x * 20.0 + time) * sin(uv.y * 20.0 + time) * 0.1;
        finalColor += accentColor * foil * 0.1;
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    } else {
      // Fallback: generate procedural card background similar to RevolutionaryCardDemo style
      vec3 backgroundColor = frameColor;
      
      // Create a gradient similar to the cards in RevolutionaryCardDemo
      float centerDist = distance(uv, vec2(0.5));
      float gradient = 1.0 - smoothstep(0.0, 0.8, centerDist);
      backgroundColor = mix(backgroundColor, accentColor, gradient * 0.3);
      
      // Add subtle texture
      float paperNoise = noise(uv * 30.0) * 0.05;
      backgroundColor += paperNoise;
      
      // Add frame border
      float borderWidth = 0.08;
      float borderMask = 1.0 - smoothstep(borderWidth - 0.01, borderWidth, 
        min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
      
      vec3 finalColor = mix(backgroundColor, frameColor, borderMask);
      
      // Add glow effect when hovered
      if (glowIntensity > 0.0) {
        finalColor += glowColor * glowIntensity * 0.3;
      }
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  }
`;

// Custom hook for loading frame textures with fallbacks
function useFrameTexture(framePath: string, fallbackTexture: THREE.Texture) {
  const [texture, setTexture] = useState<THREE.Texture>(fallbackTexture);
  
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    loader.load(
      framePath,
      // Success callback
      (loadedTexture) => {
        console.log(`✅ Frame texture loaded: ${framePath}`);
        setTexture(loadedTexture);
      },
      // Progress callback
      undefined,
      // Error callback
      (error) => {
        console.warn(`⚠️ Frame texture not found: ${framePath}, using procedural frame`, error);
        setTexture(fallbackTexture);
      }
    );
  }, [framePath, fallbackTexture]);
  
  return texture;
}

export function Card3D({
  card,
  position,
  rotation,
  scale,
  isHovered,
  isSelected,
  onHover,
  onClick,
}: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [renderState, setRenderState] = useState<CardRenderState>({
    position,
    rotation,
    scale,
    opacity: 1,
    glowIntensity: 0,
    animationState: 'idle',
  });

  // Get frame configuration for this card
  const frameType = getFrameType(card);
  const frameConfig = frameConfigs[frameType];

  // Load card artwork image with better error handling
  const cardImagePath = getCardImage(card);
  const [cardArtworkTexture, setCardArtworkTexture] = useState<THREE.Texture | null>(null);
  
  React.useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    const loadImage = (imagePath: string, isRetry = false) => {
      console.log(`🔄 Attempting to load card image: ${imagePath} for card: ${card.name}`);
      
      loader.load(
        imagePath,
        // Success callback
        (texture) => {
          console.log(`✅ Card image loaded successfully: ${imagePath} for card: ${card.name}`);
          texture.flipY = false; // Important for proper texture orientation
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          setCardArtworkTexture(texture);
        },
        // Progress callback
        (progress) => {
          if (progress.total > 0) {
            console.log(`📊 Loading progress for ${imagePath}: ${Math.round((progress.loaded / progress.total) * 100)}%`);
          }
        },
        // Error callback
        (error) => {
          console.warn(`⚠️ Failed to load card image: ${imagePath} for card: ${card.name}`, error);
          
          if (!isRetry) {
            // Try different fallback strategies
            const fallbackPaths = [
              '/images/cards/card-images/placeholder.svg',
              '/images/placeholder-cards/default.png',
              '/images/cards/placeholder.jpg'
            ];
            
            let fallbackIndex = 0;
            const tryFallback = () => {
              if (fallbackIndex < fallbackPaths.length) {
                const fallbackPath = fallbackPaths[fallbackIndex];
                console.log(`🔄 Trying fallback image ${fallbackIndex + 1}/${fallbackPaths.length}: ${fallbackPath}`);
                
                loader.load(
                  fallbackPath,
                  (texture) => {
                    console.log(`✅ Fallback image loaded: ${fallbackPath}`);
                    texture.flipY = false;
                    texture.wrapS = THREE.ClampToEdgeWrapping;
                    texture.wrapT = THREE.ClampToEdgeWrapping;
                    setCardArtworkTexture(texture);
                  },
                  undefined,
                  (fallbackError) => {
                    console.warn(`⚠️ Fallback ${fallbackIndex + 1} failed: ${fallbackPath}`, fallbackError);
                    fallbackIndex++;
                    tryFallback();
                  }
                );
              } else {
                // Create a simple colored texture as ultimate fallback (exactly like RevolutionaryCardDemo style)
                console.log(`🎨 Creating procedural texture for card: ${card.name}`);
                createProceduralTexture();
              }
            };
            
            tryFallback();
          } else {
            // Final fallback: create procedural texture
            createProceduralTexture();
          }
        }
      );
    };
    
    const createProceduralTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 600; // Taller aspect ratio like real cards
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create a gradient based on card type/rarity - similar to RevolutionaryCardDemo
        const gradient = ctx.createLinearGradient(0, 0, 400, 600);
        
        // Choose colors based on card properties
        if (card.rarity === 'legendary' || card.rarity === 'legendario') {
          gradient.addColorStop(0, '#fbbf24'); // Gold
          gradient.addColorStop(1, '#f59e0b');
        } else if (card.rarity === 'epic' || card.rarity === 'épico') {
          gradient.addColorStop(0, '#a78bfa'); // Purple
          gradient.addColorStop(1, '#8b5cf6');
        } else if (card.rarity === 'rare' || card.rarity === 'raro') {
          gradient.addColorStop(0, '#60a5fa'); // Blue
          gradient.addColorStop(1, '#3b82f6');
        } else if (card.type === 'math') {
          gradient.addColorStop(0, '#4ade80'); // Green
          gradient.addColorStop(1, '#22c55e');
        } else if (card.type === 'logic') {
          gradient.addColorStop(0, '#60a5fa'); // Blue
          gradient.addColorStop(1, '#3b82f6');
        } else {
          gradient.addColorStop(0, '#a78bfa'); // Purple default
          gradient.addColorStop(1, '#8b5cf6');
        }
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 600);
        
        // Add decorative border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 360, 560);
        
        // Add card name with better styling
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 4;
        
        // Wrap text if too long
        const maxWidth = 320;
        const words = card.name.split(' ');
        let line = '';
        let y = 300;
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;
          
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, 200, y);
            line = words[n] + ' ';
            y += 35;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, 200, y);
        
        // Add type/rarity indicator
        ctx.font = 'bold 18px Arial';
        ctx.fillText(`${card.type?.toUpperCase() || 'CARD'} • ${card.rarity?.toUpperCase() || 'COMMON'}`, 200, y + 50);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.flipY = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      setCardArtworkTexture(texture);
      console.log(`🎨 Created procedural texture for card: ${card.name}`);
    };
    
    if (cardImagePath) {
      loadImage(cardImagePath);
    } else {
      console.warn(`⚠️ No image path found for card: ${card.name}, creating procedural texture`);
      createProceduralTexture();
    }
  }, [cardImagePath, card.name, card.type, card.rarity]);
  
  // Use clean frame overlays as fallback
  const frameOverlayPath = `/images/cards/frames/${frameType}-clean-frame.png`;
  const frameTexture = useFrameTexture(frameConfig.imagePath, useTexture(frameOverlayPath));

  // Enhanced shader material with frame support
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: enhancedCardVertexShader,
      fragmentShader: enhancedCardFragmentShader,
      uniforms: {
        time: { value: 0 },
        glowIntensity: { value: 0 },
        frameColor: { value: new THREE.Color(frameConfig.borderColor) },
        accentColor: { value: new THREE.Color(frameConfig.accentColor) },
        glowColor: { value: new THREE.Color(frameConfig.glowColor) },
        holographic: { value: frameConfig.holographicEffect },
        foilEffect: { value: frameConfig.foilEffect },
        cardTexture: { value: cardArtworkTexture || new THREE.Texture() },
        frameTexture: { value: frameTexture },
      },
      transparent: true,
    });
  }, [frameConfig, cardArtworkTexture, frameTexture]);

  // Simple fallback material when shader fails or for better image display
  const simpleMaterial = useMemo(() => {
    if (cardArtworkTexture) {
      return new THREE.MeshBasicMaterial({
        map: cardArtworkTexture,
        transparent: true,
        side: THREE.DoubleSide,
      });
    }
    // Fallback with just colors
    return new THREE.MeshLambertMaterial({
      color: new THREE.Color(frameConfig.borderColor),
      transparent: true,
      opacity: 0.9,
    });
  }, [cardArtworkTexture, frameConfig.borderColor]);

  // Choose material based on whether we have a good texture
  const finalMaterial = useMemo(() => {
    // Use simple material if we have a card texture for better compatibility
    if (cardArtworkTexture) {
      console.log(`🖼️ Using simple material for better image display: ${card.name}`);
      return simpleMaterial;
    }
    // Use shader material for procedural effects
    console.log(`🎨 Using shader material for procedural effects: ${card.name}`);
    return shaderMaterial;
  }, [cardArtworkTexture, simpleMaterial, shaderMaterial, card.name]);

  // Animación del frame
  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;

    // Update shader uniforms only if using shader material
    if (finalMaterial instanceof THREE.ShaderMaterial) {
      finalMaterial.uniforms.time.value = state.clock.elapsedTime;
      finalMaterial.uniforms.glowIntensity.value = renderState.glowIntensity;
    }

    // Efectos de hover más sutiles
    if (isHovered) {
      setRenderState(prev => ({
        ...prev,
        glowIntensity: Math.min(prev.glowIntensity + 0.03, 0.6),
        animationState: 'hover',
      }));
      
      // Rotación muy sutil en hover
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.01;
    } else {
      setRenderState(prev => ({
        ...prev,
        glowIntensity: Math.max(prev.glowIntensity - 0.02, 0),
        animationState: 'idle',
      }));
      
      // Volver a posición original
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation[1], 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, position[1], 0.1);
    }

    // Efecto de selección más sutil
    if (isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.05 + 1;
      groupRef.current.scale.setScalar(pulse);
    } else {
      groupRef.current.scale.lerp(new THREE.Vector3(...scale), 0.1);
    }
  });

  // Geometría de la carta - MÁS PLANA
  const cardGeometry = useMemo(() => {
    return new THREE.PlaneGeometry(2, 3, 1, 1); // Geometría simple y plana
  }, []);

  // Manejar eventos de mouse
  const handlePointerEnter = () => {
    document.body.style.cursor = 'pointer';
    onHover();
  };

  const handlePointerLeave = () => {
    document.body.style.cursor = 'default';
  };

  const handleClick = (event: unknown) => {
    if (event && typeof event === 'object' && 'stopPropagation' in event) {
      (event as { stopPropagation: () => void }).stopPropagation();
    }
    onClick();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
    >
      {/* Carta principal - PLANA como MTG/Pokemon */}
      <mesh
        ref={meshRef}
        geometry={cardGeometry}
        material={finalMaterial}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      />

      {/* Borde mejorado para material simple - similar a card-revolution */}
      {cardArtworkTexture && (
        <>
          {/* Marco exterior */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[2.08, 3.08]} />
            <meshBasicMaterial
              color={frameConfig.borderColor}
              transparent
              opacity={0.9}
            />
          </mesh>
          
          {/* Marco interior decorativo */}
          <mesh position={[0, 0, -0.0005]}>
            <planeGeometry args={[2.04, 3.04]} />
            <meshBasicMaterial
              color={frameConfig.accentColor}
              transparent
              opacity={0.7}
            />
          </mesh>
        </>
      )}

      {/* Sutil borde brillante para efectos - SOLO para shader material */}
      {!cardArtworkTexture && (
        <mesh position={[0, 0, -0.001]}>
          <planeGeometry args={[2.02, 3.02]} />
          <meshBasicMaterial
            color={frameConfig.borderColor}
            transparent
            opacity={renderState.glowIntensity * 0.3}
          />
        </mesh>
      )}

      {/* Texto del nombre de la carta - Estilo MTG/Pokemon */}
      <Text
        position={[0, 1.25, 0.001]}
        fontSize={0.1}
        color={frameConfig.textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.6}
        textAlign="center"
        outlineWidth={0.008}
        outlineColor="#000000"
      >
        {card.name.toUpperCase()}
      </Text>

      {/* Tipo y rareza - Estilo limpio */}
      <Text
        position={[0, 1.1, 0.001]}
        fontSize={0.06}
        color={frameConfig.accentColor}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.005}
        outlineColor="#000000"
      >
        {card.type.charAt(0).toUpperCase() + card.type.slice(1)} • {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
      </Text>

      {/* Área de artwork/contenido - Con imagen de la carta */}
      <mesh position={[0, 0.1, 0.001]}>
        <planeGeometry args={[1.7, 1.4]} />
        <meshBasicMaterial
          map={cardArtworkTexture}
          color={cardArtworkTexture ? "#ffffff" : frameConfig.accentColor}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Overlay semi-transparente para el texto sobre la imagen */}
      <mesh position={[0, -0.2, 0.002]}>
        <planeGeometry args={[1.6, 0.8]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Descripción de la carta - Sobre el overlay */}
      <Text
        position={[0, -0.2, 0.003]}
        fontSize={0.05}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.4}
        textAlign="center"
        lineHeight={1.2}
        outlineWidth={0.002}
        outlineColor="#000000"
      >
        {card.description}
      </Text>

      {/* Pregunta del problema */}
      <Text
        position={[0, -0.3, 0.002]}
        fontSize={0.06}
        color="#555555"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
        textAlign="center"
        lineHeight={1.2}
        outlineWidth={0.003}
        outlineColor="#ffffff"
      >
        {card.problem.question}
      </Text>

      {/* Costo - Estilo MTG (esquina superior izquierda) */}
      <mesh position={[-0.75, 1.25, 0.002]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial
          color={frameConfig.borderColor}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        position={[-0.75, 1.25, 0.003]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {card.cost}
      </Text>

      {/* Poder - Estilo Pokemon (esquina inferior derecha) */}
      <mesh position={[0.75, -1.25, 0.002]}>
        <circleGeometry args={[0.18, 16]} />
        <meshBasicMaterial
          color={frameConfig.accentColor}
          transparent
          opacity={0.9}
        />
      </mesh>
      <Text
        position={[0.75, -1.25, 0.003]}
        fontSize={0.14}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#000000"
      >
        {card.power}
      </Text>

      {/* Indicador de tipo - Pequeño y discreto */}
      <mesh position={[0, 0.85, 0.002]}>
        <circleGeometry args={[0.08, 16]} />
        <meshBasicMaterial
          color={card.type === 'math' ? '#ff6b6b' : card.type === 'logic' ? '#4ecdc4' : '#ffd93d'}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Partículas para cartas épicas y legendarias - Más sutiles */}
      {(frameConfig.foilEffect || frameConfig.holographicEffect) && (
        <CardParticles
          frameConfig={frameConfig}
          isActive={isHovered || isSelected}
        />
      )}

      {/* Efecto de selección - Sutil como MTG/Pokemon */}
      {isSelected && (
        <mesh position={[0, 0, -0.002]}>
          <planeGeometry args={[2.1, 3.1]} />
          <meshBasicMaterial
            color={frameConfig.glowColor}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}

      {/* Efecto holográfico sutil para cartas premium */}
      {frameConfig.holographicEffect && (isHovered || isSelected) && (
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[2, 3]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// Componente de partículas para cartas especiales - Estilo MTG/Pokemon
function CardParticles({ frameConfig, isActive }: { 
  frameConfig: {
    accentColor: string;
    holographicEffect: boolean;
    foilEffect: boolean;
  }; 
  isActive: boolean 
}) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = frameConfig.holographicEffect ? 30 : frameConfig.foilEffect ? 20 : 10;

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color(frameConfig.accentColor);

    for (let i = 0; i < particleCount; i++) {
      // Posiciones más concentradas en la carta
      positions[i * 3] = (Math.random() - 0.5) * 1.8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      positions[i * 3 + 2] = Math.random() * 0.1;

      // Tamaños más pequeños y sutiles
      sizes[i] = Math.random() * 0.03 + 0.02;

      // Colores más sutiles
      if (frameConfig.holographicEffect) {
        // Colores arcoíris muy sutiles
        const hue = Math.random();
        const rainbowColor = new THREE.Color().setHSL(hue, 0.6, 0.8);
        colors[i * 3] = rainbowColor.r;
        colors[i * 3 + 1] = rainbowColor.g;
        colors[i * 3 + 2] = rainbowColor.b;
      } else {
        // Colores dorados/plateados para foil
        const mixedColor = color.clone().lerp(new THREE.Color('#ffffff'), 0.5);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }
    }

    return { positions, colors, sizes };
  }, [particleCount, frameConfig]);

  useFrame((state) => {
    if (!particlesRef.current || !isActive) return;

    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const colors = particlesRef.current.geometry.attributes.color.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      const time = state.clock.elapsedTime;
      const index = i * 3;
      
      // Movimiento muy sutil, como brillos en la carta
      positions[index] += Math.sin(time * 0.5 + i * 0.2) * 0.001;
      positions[index + 1] += Math.cos(time * 0.3 + i * 0.15) * 0.002;
      positions[index + 2] = Math.sin(time * 2 + i * 0.1) * 0.05;
      
      // Resetear partículas que se alejan
      if (Math.abs(positions[index]) > 1) positions[index] *= -0.9;
      if (Math.abs(positions[index + 1]) > 1.5) positions[index + 1] *= -0.9;

      // Cambio de color holográfico muy sutil
      if (frameConfig.holographicEffect) {
        const hue = (time * 0.2 + i * 0.1) % 1;
        const rainbowColor = new THREE.Color().setHSL(hue, 0.4, 0.9);
        colors[index] = rainbowColor.r;
        colors[index + 1] = rainbowColor.g;
        colors[index + 2] = rainbowColor.b;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    if (frameConfig.holographicEffect) {
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  if (!isActive) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default Card3D; 