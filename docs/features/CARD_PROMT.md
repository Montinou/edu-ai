const PROMPT_TEMPLATES = {
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
```

### Prompts Específicos por Categoría

```typescript
const CARD_PROMPTS = {
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
    ]
  },
  
  logic: {
    patterns: [
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
    ]
