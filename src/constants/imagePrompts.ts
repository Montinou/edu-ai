import { ImageCardType, ImageMathType, ImageLogicType } from '../types/imageGeneration';

export const PROMPT_TEMPLATES = {
  baseStyle: "anime style, Studio Ghibli inspired, clean and expressive, vibrant but not oversaturated colors, magical educational theme, card game aesthetic, detailed illustration, fantasy elements, child-friendly, magical academy setting",
  
  qualityModifiers: "high quality, detailed digital art, trading card game style, centered composition, magical border effects, holographic elements, fantasy card frame",
  
  negativePrompt: "ugly, blurry, distorted, inappropriate content, violent, scary, dark themes, adult themes, low quality, pixelated, watermark, text overlay, realistic photography, photorealistic, nsfw",
  
  rarityModifiers: {
    common: "simple magical effects, basic glow, clean design",
    rare: "enhanced magical aura, moderate particle effects, detailed magical elements", 
    epic: "powerful magical effects, complex particle systems, dramatic lighting, intricate magical details",
    legendary: "overwhelming magical presence, cinematic lighting effects, complex magical phenomena, legendary aura, epic proportions"
  }
};

export const CARD_PROMPTS = {
  math: {
    addition: [
      "young magical student casting addition spell with glowing crystal orbs showing numbers, bright blue and gold magical effects, mathematical symbols floating around, academy classroom background",
      "cute magical flowers with numbers on petals being combined by fairy magic, pastel colors, garden academy setting, mathematical sparkles in the air",
      "magical cauldron with numbered bubbles rising and combining, purple and green magical effects, alchemy laboratory, mathematical formulas glowing in steam"
    ],
    subtraction: [
      "mystical shield with glowing moon phases showing subtraction, silver and blue magical aura, protective magical barriers, nighttime academy courtyard",
      "magical mirror reflecting mathematical operations, numbers fading away in golden light, time magic effects, mystical library setting",
      "wind elemental dispersing numbered leaves, green and white magical currents, peaceful forest clearing, mathematical symbols in wind patterns"
    ],
    multiplication: [
      "small friendly dragon breathing mathematical fire with multiplying numbers, red and orange flames, numbers duplicating in magical patterns, dragon academy training grounds",
      "magical crystals creating multiple reflections with numbers multiplying, rainbow refractions, geometric magical effects, crystal cave academy",
      "magical seeds rapidly growing into numbered plants, nature magic with mathematical progression, green growth energy, botanical academy greenhouse"
    ],
    division: [
      "wise owl professor with magical equations dividing into perfect portions, scholarly magical effects, ancient books floating, academy library tower",
      "golden magical scales perfectly dividing mathematical elements, celestial magic, stars and constellation patterns, observatory academy",
      "mystical maze with pathways showing division solutions, puzzle magic effects, geometric patterns, academy puzzle chamber"
    ],
    fractions: [
      "magical pie chart floating in air with glowing fraction sections, bakery magic, delicious floating pastries, academy kitchen setting",
      "crystal prism splitting light into colorful fraction rays, optical magic, rainbow mathematics, academy crystal laboratory",
      "friendly fairy dividing magical energy into equal parts, sparkly division magic, forest academy clearing with mathematical fairy dust"
    ],
    decimals: [
      "floating magical abacus with decimal point sparkles, precision magic, golden calculating beads, academy mathematics hall",
      "water elemental creating decimal cascades and droplets, fluid mathematics magic, academy water garden setting",
      "star map showing decimal constellations, astronomical precision magic, academy observatory with mathematical star patterns"
    ],
    algebra: [
      "mysterious hooded figure solving magical equation scrolls, ancient wisdom magic, floating variables and symbols, academy secret library",
      "magical balance scale with unknown variables, mystery solving magic, equilibrium effects, academy puzzle chamber",
      "young wizard manipulating algebraic symbols like spell components, transformation magic, academy advanced classroom"
    ]
  },
  
  logic: {
    pattern: [
      "intricate magical mandala with evolving geometric patterns, mystical mathematical sequences, purple and gold magical energy, pattern recognition magic",
      "stars moving in logical sequence patterns, celestial magic, night sky with mathematical star formations, cosmic academy observatory",
      "ancient magical runes appearing in logical order, mystical writing magic, glowing symbols, ancient academy scriptorium"
    ],
    deduction: [
      "young detective character with magical magnifying glass revealing hidden clues, mystery magic effects, logical thinking aura, academy investigation room",
      "magical mirror showing logical connections between clues, truth-revealing magic, connecting light beams, academy divination chamber",
      "transparent maze showing thought processes, mind magic visualization, logical pathway lighting, academy psychology tower"
    ],
    classification: [
      "magical books organizing themselves by categories, knowledge magic, floating organized elements, academy grand library",
      "magical garden with plants arranging by type and characteristics, nature organization magic, botanical academy grounds",
      "magical crystals sorting themselves by properties, crystalline magic effects, mineral classification, academy geology lab"
    ],
    strategy: [
      "chess pieces made of magical elements planning moves, tactical magic, strategic battlefield, academy strategy room",
      "magical war map with moving tactical elements, planning magic, glowing strategy indicators, academy command center",
      "wise strategist with floating tactical projections, leadership magic, battle plan visualization, academy war room"
    ],
    sequence: [
      "magical dominos falling in perfect sequence, chain reaction magic, cause and effect visualization, academy physics lab",
      "time magic showing events in chronological order, temporal sequence magic, academy time study chamber",
      "musical notes arranged in logical progression, harmony magic, academy music theory classroom"
    ],
    spatial: [
      "3D magical puzzle pieces floating and rotating, dimensional magic, geometric transformation, academy spatial reasoning lab",
      "architect mage designing magical structures, construction magic, blueprint projection, academy engineering workshop",
      "portal magic showing different dimensional perspectives, space-folding magic, academy dimensional studies chamber"
    ],
    verbal: [
      "magical books with words floating and rearranging, language magic, literary organization, academy linguistics library",
      "storyteller weaving narrative threads with magic, tale-spinning magic, story visualization, academy literature hall",
      "magical scroll with riddles solving themselves, word puzzle magic, academy riddle chamber"
    ]
  },
  
  special: {
    guardians: [
      "friendly sphinx character with scrolls of riddles, ancient wisdom magic, golden magical effects, academy sphinx statue come to life",
      "stone golem made of mathematical blocks, earth magic with logical patterns, academy construction site, building block magic",
      "majestic phoenix with mathematical flames, rebirth magic representing learning from mistakes, fiery academy spire"
    ],
    powerups: [
      "glowing study potion with magical focus effects, clarity magic, academic enhancement, academy alchemy lab",
      "magical scroll unrolling with helpful hints, guidance magic, glowing text, academy study hall",
      "time magic crystal granting additional thinking time, temporal magic effects, clock magic, academy time tower"
    ],
    legendary: [
      "wise magical teacher character surrounded by mathematical elements, master-level magic aura, academy headmaster appearance, teaching magic effects",
      "elegant magical princess with crown made of fraction symbols, royal mathematical magic, palace academy setting",
      "stealthy ninja character with algebraic throwing stars, shadow magic with mathematical precision, academy training dojo"
    ],
    defense: [
      "magical shield with protective runes and barriers, defensive magic, protective aura, academy training grounds",
      "guardian angel with mathematical wings, protection magic, divine mathematical intervention, academy chapel",
      "fortress walls made of logical reasoning, structural defense magic, academy defensive architecture"
    ]
  }
};

export function getRandomPrompt(cardType: ImageCardType, mathType: ImageMathType | ImageLogicType): string {
  if (cardType === 'math' && CARD_PROMPTS.math[mathType as ImageMathType]) {
    const prompts = CARD_PROMPTS.math[mathType as ImageMathType];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  if (cardType === 'logic' && CARD_PROMPTS.logic[mathType as ImageLogicType]) {
    const prompts = CARD_PROMPTS.logic[mathType as ImageLogicType];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  if (cardType === 'special') {
    const specialType = mathType as keyof typeof CARD_PROMPTS.special;
    const prompts = CARD_PROMPTS.special[specialType] || CARD_PROMPTS.special.powerups;
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
  
  // Fallback to powerups
  const prompts = CARD_PROMPTS.special.powerups;
  return prompts[Math.floor(Math.random() * prompts.length)];
} 