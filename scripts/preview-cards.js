// Preview Cards - Show what will be generated from CARD_PROMT.md
const cardTemplates = require('./generate-cards').CARD_TEMPLATES || {
  // If import fails, define inline
  suma: [
    {
      name: "Suma Elemental - Cristales de Luz",
      description: "Estudiante mágico conjurando hechizo de suma con orbes de cristal brillantes",
      type: "attack",
      rarity: "common",
      problem_type: "addition",
      difficulty_level: 1,
      attack_power: 30,
      defense_power: 10,
      cost: 2
    },
    {
      name: "Suma Elemental - Flores Mágicas", 
      description: "Flores mágicas con números en pétalos combinándose por magia de hadas",
      type: "attack",
      rarity: "common",
      problem_type: "addition",
      difficulty_level: 1,
      attack_power: 25,
      defense_power: 15,
      cost: 2
    }
  ],
  resta: [
    {
      name: "Resta Protectora - Escudo Lunar",
      description: "Escudo místico con fases lunares brillantes mostrando resta",
      type: "defense",
      rarity: "common",
      problem_type: "subtraction",
      difficulty_level: 2,
      attack_power: 15,
      defense_power: 40,
      cost: 3
    },
    {
      name: "Resta Protectora - Espejo Temporal",
      description: "Espejo mágico reflejando operaciones matemáticas que se desvanecen",
      type: "defense",
      rarity: "rare",
      problem_type: "subtraction",
      difficulty_level: 2,
      attack_power: 20,
      defense_power: 35,
      cost: 3
    }
  ],
  multiplicacion: [
    {
      name: "Multiplicación Feroz - Dragón Escarlata",
      description: "Pequeño dragón amigable respirando fuego matemático con números multiplicándose",
      type: "attack",
      rarity: "rare",
      problem_type: "multiplication",
      difficulty_level: 3,
      attack_power: 50,
      defense_power: 20,
      cost: 4
    },
    {
      name: "Multiplicación Feroz - Cristales Espejo",
      description: "Cristales mágicos creando múltiples reflejos con números multiplicándose",
      type: "attack",
      rarity: "epic",
      problem_type: "multiplication",
      difficulty_level: 3,
      attack_power: 45,
      defense_power: 25,
      cost: 4
    }
  ],
  division: [
    {
      name: "División Sabia - Búho Arcano",
      description: "Búho sabio profesor con ecuaciones mágicas dividiéndose en porciones perfectas",
      type: "special",
      rarity: "epic",
      problem_type: "division",
      difficulty_level: 4,
      attack_power: 35,
      defense_power: 45,
      cost: 5
    }
  ],
  legendarias: [
    {
      name: "Dragón del Cálculo Infinito",
      description: "Dragón majestuoso con patrones de constelación matemática en sus escamas",
      type: "special",
      rarity: "legendary",
      problem_type: "logic",
      difficulty_level: 5,
      attack_power: 80,
      defense_power: 70,
      cost: 8
    }
  ]
};

console.log('🎨 EduCard AI - Card Preview\n');
console.log('📋 Cards to be generated from CARD_PROMT.md:\n');

let totalCards = 0;
const rarityColors = {
  common: '⚪',
  rare: '🟦', 
  epic: '🟣',
  legendary: '🟡'
};

const typeIcons = {
  attack: '⚔️',
  defense: '🛡️',
  special: '✨',
  support: '💚'
};

for (const [category, cards] of Object.entries(cardTemplates)) {
  console.log(`\n📂 ${category.toUpperCase()} (${cards.length} cards)`);
  console.log('═'.repeat(50));
  
  for (const card of cards) {
    totalCards++;
    const rarityIcon = rarityColors[card.rarity] || '⚫';
    const typeIcon = typeIcons[card.type] || '🃏';
    
    console.log(`\n${rarityIcon} ${card.name}`);
    console.log(`   ${typeIcon} ${card.type.toUpperCase()} | 🎯 ${card.problem_type} | 📊 Level ${card.difficulty_level}`);
    console.log(`   ⚔️ ${card.attack_power} | 🛡️ ${card.defense_power} | 💎 Cost: ${card.cost}`);
    console.log(`   📝 ${card.description}`);
  }
}

console.log('\n' + '═'.repeat(60));
console.log(`🎉 Total cards to generate: ${totalCards}`);
console.log('\nRarity Distribution:');
const rarityCount = {};
for (const [category, cards] of Object.entries(cardTemplates)) {
  for (const card of cards) {
    rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1;
  }
}

for (const [rarity, count] of Object.entries(rarityCount)) {
  const icon = rarityColors[rarity] || '⚫';
  console.log(`${icon} ${rarity}: ${count} cards`);
}

console.log('\nType Distribution:');
const typeCount = {};
for (const [category, cards] of Object.entries(cardTemplates)) {
  for (const card of cards) {
    typeCount[card.type] = (typeCount[card.type] || 0) + 1;
  }
}

for (const [type, count] of Object.entries(typeCount)) {
  const icon = typeIcons[type] || '🃏';
  console.log(`${icon} ${type}: ${count} cards`);
}

console.log('\n🚀 Ready to generate! Run: node scripts/generate-cards.js'); 