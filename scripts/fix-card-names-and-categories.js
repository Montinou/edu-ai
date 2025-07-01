const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de categorías en inglés a español
const categoryTranslations = {
  'arithmetic': 'aritmética',
  'algebra': 'álgebra',
  'geometry': 'geometría',
  'logic': 'lógica',
  'statistics': 'estadística',
  'math': 'matemáticas',
  'mathematics': 'matemáticas'
};

// Plantillas de nombres ÉPICOS por tipo de problema y rareza
const nameTemplatesByProblemType = {
  // Aritmética básica
  'Suma': {
    common: ['Cristal del Agregador', 'Gema de la Unión', 'Talismán Sumatorio', 'Piedra de la Convergencia'],
    rare: ['Orbe de los Números Unidos', 'Reliquia del Gran Cálculo', 'Cristal del Acumulador Místico', 'Amuleto de la Suma Eterna'],
    epic: ['Cetro de la Convergencia Suprema', 'Corona de los Números Infinitos', 'Báculo del Acumulador Divino', 'Diadema de la Suma Celestial'],
    legendary: ['El Trono de la Adición Primordial', 'Corona Absoluta de la Convergencia', 'Reliquia Ancestral del Sumador Cósmico', 'El Sceptro Eterno de los Números Unidos']
  },
  'Resta': {
    common: ['Espejo del Equilibrio', 'Gema de la Diferencia', 'Cristal Sustractivo', 'Piedra del Balance'],
    rare: ['Orbe de la Sustracción Sagrada', 'Reliquia del Equilibrio Perfecto', 'Cristal del Restador Místico', 'Amuleto de la Diferencia Eterna'],
    epic: ['Cetro del Balance Supremo', 'Corona de la Sustracción Divina', 'Báculo del Equilibrador Celestial', 'Diadema de la Resta Primordial'],
    legendary: ['El Trono del Equilibrio Absoluto', 'Corona Suprema del Balance Cósmico', 'Reliquia Ancestral del Restador Infinito', 'El Sceptro Eterno de la Sustracción']
  },
  'Multiplicación': {
    common: ['Prisma Amplificador', 'Gema de la Expansión', 'Cristal Multiplicativo', 'Piedra del Crecimiento'],
    rare: ['Orbe de la Multiplicación Sagrada', 'Reliquia del Amplificador Eterno', 'Cristal del Multiplicador Místico', 'Amuleto de la Expansión Infinita'],
    epic: ['Cetro de la Amplificación Suprema', 'Corona de la Multiplicación Divina', 'Báculo del Multiplicador Celestial', 'Diadema de la Expansión Primordial'],
    legendary: ['El Trono de la Multiplicación Cósmica', 'Corona Absoluta del Amplificador', 'Reliquia Ancestral del Multiplicador Infinito', 'El Sceptro Eterno de la Expansión']
  },
  'División': {
    common: ['Cuchilla Partitiva', 'Gema de la Fragmentación', 'Cristal Divisor', 'Piedra del Reparto'],
    rare: ['Orbe de la División Sagrada', 'Reliquia del Fragmentador Eterno', 'Cristal del Divisor Místico', 'Amuleto de la Partición Perfecta'],
    epic: ['Cetro de la División Suprema', 'Corona del Fragmentador Divino', 'Báculo del Divisor Celestial', 'Diadema de la Partición Primordial'],
    legendary: ['El Trono de la División Absoluta', 'Corona Suprema del Fragmentador', 'Reliquia Ancestral del Divisor Cósmico', 'El Sceptro Eterno de la Partición']
  },
  'Fracciones': {
    common: ['Fragmento de la Proporción', 'Gema Fraccionaria', 'Cristal de las Partes', 'Piedra Proporcional'],
    rare: ['Orbe de las Fracciones Sagradas', 'Reliquia del Proporcionador Eterno', 'Cristal del Fraccionador Místico', 'Amuleto de la Proporción Perfecta'],
    epic: ['Cetro de las Fracciones Supremas', 'Corona del Proporcionador Divino', 'Báculo del Fraccionador Celestial', 'Diadema de la Proporción Primordial'],
    legendary: ['El Trono de las Fracciones Absolutas', 'Corona Suprema del Proporcionador', 'Reliquia Ancestral del Fraccionador Cósmico', 'El Sceptro Eterno de las Proporciones']
  },
  'Patrones': {
    common: ['Códice del Orden', 'Gema Secuencial', 'Cristal de los Patrones', 'Piedra del Orden Oculto'],
    rare: ['Orbe de las Secuencias Sagradas', 'Reliquia del Ordenador Eterno', 'Cristal del Patrón Místico', 'Amuleto del Orden Perfecto'],
    epic: ['Cetro de los Patrones Supremos', 'Corona del Ordenador Divino', 'Báculo del Patrón Celestial', 'Diadema del Orden Primordial'],
    legendary: ['El Trono de los Patrones Absolutos', 'Corona Suprema del Ordenador', 'Reliquia Ancestral del Patrón Cósmico', 'El Sceptro Eterno de las Secuencias']
  },
  'Deducción': {
    common: ['Lente de la Verdad', 'Gema de la Revelación', 'Cristal del Razonamiento', 'Piedra de la Claridad'],
    rare: ['Orbe de la Deducción Sagrada', 'Reliquia del Revelador Eterno', 'Cristal del Deductor Místico', 'Amuleto de la Verdad Perfecta'],
    epic: ['Cetro de la Revelación Suprema', 'Corona del Deductor Divino', 'Báculo de la Verdad Celestial', 'Diadema de la Claridad Primordial'],
    legendary: ['El Trono de la Deducción Absoluta', 'Corona Suprema del Revelador', 'Reliquia Ancestral del Deductor Cósmico', 'El Sceptro Eterno de la Verdad']
  },
  'Ecuaciones': {
    common: ['Balanza del Equilibrio', 'Gema Algebraica', 'Cristal de las Variables', 'Piedra de la Incógnita'],
    rare: ['Orbe de las Ecuaciones Sagradas', 'Reliquia del Equilibrador Eterno', 'Cristal del Algebrista Místico', 'Amuleto del Balance Perfecto'],
    epic: ['Cetro de las Ecuaciones Supremas', 'Corona del Algebrista Divino', 'Báculo del Equilibrio Celestial', 'Diadema de las Variables Primordiales'],
    legendary: ['El Trono de las Ecuaciones Absolutas', 'Corona Suprema del Equilibrador', 'Reliquia Ancestral del Algebrista Cósmico', 'El Sceptro Eterno de las Variables']
  },
  'Ángulos': {
    common: ['Compás de la Medición', 'Gema Angular', 'Cristal Geométrico', 'Piedra de las Dimensiones'],
    rare: ['Orbe de los Ángulos Sagrados', 'Reliquia del Medidor Eterno', 'Cristal del Geómetra Místico', 'Amuleto de la Medición Perfecta'],
    epic: ['Cetro de los Ángulos Supremos', 'Corona del Geómetra Divino', 'Báculo de la Medición Celestial', 'Diadema de las Dimensiones Primordiales'],
    legendary: ['El Trono de los Ángulos Absolutos', 'Corona Suprema del Medidor', 'Reliquia Ancestral del Geómetra Cósmico', 'El Sceptro Eterno de las Dimensiones']
  },
  'Probabilidad': {
    common: ['Dado del Destino', 'Gema del Azar', 'Cristal de las Posibilidades', 'Piedra de la Fortuna'],
    rare: ['Orbe del Destino Sagrado', 'Reliquia del Afortunado Eterno', 'Cristal del Probabilista Místico', 'Amuleto del Azar Perfecto'],
    epic: ['Cetro del Destino Supremo', 'Corona del Probabilista Divino', 'Báculo del Azar Celestial', 'Diadema de la Fortuna Primordial'],
    legendary: ['El Trono del Destino Absoluto', 'Corona Suprema del Afortunado', 'Reliquia Ancestral del Probabilista Cósmico', 'El Sceptro Eterno de las Posibilidades']
  },
  'Estadística': {
    common: ['Contador de Datos', 'Gema Analítica', 'Cristal de los Números', 'Piedra de la Información'],
    rare: ['Orbe de las Estadísticas Sagradas', 'Reliquia del Contador Eterno', 'Cristal del Estadístico Místico', 'Amuleto del Análisis Perfecto'],
    epic: ['Cetro de las Estadísticas Supremas', 'Corona del Analista Divino', 'Báculo del Contador Celestial', 'Diadema de los Datos Primordiales'],
    legendary: ['El Trono de las Estadísticas Absolutas', 'Corona Suprema del Contador', 'Reliquia Ancestral del Estadístico Cósmico', 'El Sceptro Eterno de los Datos']
  },
  // Tipos adicionales para mayor cobertura
  'Decimales': {
    common: ['Cristal Decimal', 'Gema de las Décimas', 'Piedra Fraccionada', 'Amuleto de Precisión'],
    rare: ['Orbe de los Decimales Sagrados', 'Reliquia del Preciso Eterno', 'Cristal del Decimal Místico', 'Amuleto de la Precisión Perfecta'],
    epic: ['Cetro de los Decimales Supremos', 'Corona del Preciso Divino', 'Báculo de la Precisión Celestial', 'Diadema Decimal Primordial'],
    legendary: ['El Trono de los Decimales Absolutos', 'Corona Suprema de la Precisión', 'Reliquia Ancestral del Decimal Cósmico', 'El Sceptro Eterno de las Décimas']
  },
  'Porcentajes': {
    common: ['Escala Porcentual', 'Gema de las Partes', 'Cristal Proporcional', 'Piedra del Porcentaje'],
    rare: ['Orbe de los Porcentajes Sagrados', 'Reliquia del Porcentual Eterno', 'Cristal del Porcentaje Místico', 'Amuleto de la Proporción Perfecta'],
    epic: ['Cetro de los Porcentajes Supremos', 'Corona del Porcentual Divino', 'Báculo de la Proporción Celestial', 'Diadema Porcentual Primordial'],
    legendary: ['El Trono de los Porcentajes Absolutos', 'Corona Suprema del Porcentual', 'Reliquia Ancestral del Porcentaje Cósmico', 'El Sceptro Eterno de las Proporciones']
  }
};

// Plantillas genéricas ÉPICAS para casos no cubiertos
const genericNameTemplates = {
  common: [
    'Cristal de {subject}', 'Gema de {subject}', 'Piedra de {subject}', 
    'Amuleto de {subject}', 'Talismán de {subject}', 'Fragmento de {subject}'
  ],
  rare: [
    'Orbe de {subject} Sagrado', 'Reliquia de {subject} Eterna', 'Cristal de {subject} Místico', 
    'Artefacto de {subject} Antiguo', 'Esfera de {subject} Poderosa', 'Amuleto de {subject} Perfecto'
  ],
  epic: [
    'Cetro de {subject} Supremo', 'Corona de {subject} Divina', 'Báculo de {subject} Celestial', 
    'Diadema de {subject} Primordial', 'Trono de {subject} Épico', 'Reliquia de {subject} Legendaria'
  ],
  legendary: [
    'El Trono de {subject} Absoluto', 'Corona Suprema de {subject}', 'Reliquia Ancestral de {subject} Cósmica', 
    'El Sceptro Eterno de {subject}', 'Artefacto Divino de {subject}', 'La Reliquia Primordial de {subject}'
  ]
};

// Nombres de materias más épicos
const epicSubjectNames = {
  'arithmetic': 'los Números Primordiales',
  'algebra': 'las Variables Místicas', 
  'geometry': 'las Formas Sagradas',
  'logic': 'la Razón Eterna',
  'statistics': 'los Datos Cósmicos',
  'math': 'las Matemáticas Ancestrales',
  
  // Problem types específicos con nombres épicos
  'addition': 'la Suma Eterna',
  'subtraction': 'la Resta Divina',
  'multiplication': 'la Multiplicación Cósmica',
  'division': 'la División Sagrada',
  'fractions': 'las Fracciones Místicas',
  'decimals': 'los Decimales Celestiales',
  'percentages': 'los Porcentajes Primordiales',
  'equations': 'las Ecuaciones Eternas',
  'inequalities': 'las Desigualdades Sagradas',
  'polynomials': 'los Polinomios Ancestrales',
  'factorization': 'la Factorización Divina',
  'area_perimeter': 'las Medidas Cósmicas',
  'angles': 'los Ángulos Celestiales',
  'triangles': 'los Triángulos Sagrados',
  'circles': 'los Círculos Eternos',
  'patterns': 'los Patrones Primordiales',
  'sequences': 'las Secuencias Místicas',
  'deduction': 'la Deducción Absoluta',
  'probability': 'el Destino Cósmico'
};

function generateAttractiveCardName(card, problemTypeName) {
  const rarity = card.rarity || 'common';
  const category = card.category || 'arithmetic';
  
  // Intentar usar plantilla específica por tipo de problema
  if (problemTypeName && nameTemplatesByProblemType[problemTypeName]) {
    const templates = nameTemplatesByProblemType[problemTypeName][rarity];
    if (templates) {
      return templates[Math.floor(Math.random() * templates.length)];
    }
  }
  
  // Fallback a plantilla genérica épica
  const templates = genericNameTemplates[rarity] || genericNameTemplates.common;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Obtener nombre épico del tema
  const epicSubject = epicSubjectNames[category] || 
                     epicSubjectNames[problemTypeName?.toLowerCase()] || 
                     'la Sabiduría Ancestral';
  
  return template.replace(/{subject}/g, epicSubject);
}

function isNameProblematic(name) {
  // Detectar nombres problemáticos que mezclan idiomas o tienen estructura extraña
  return (
    // Contiene palabras en inglés mezcladas
    /\\b(deduction|mean_median|probability|addition|subtraction|multiplication|division|patterns|sequences|area_perimeter|trigonometry|quadratic|polynomials|linear_equations|distributions)\\b/i.test(name) ||
    // Tiene estructura rara con "de" al final
    /\\sde\\s[A-Z]/i.test(name) ||
    // Tiene guiones bajos
    /_/.test(name) ||
    // Es muy largo y confuso
    name.length > 50 ||
    // Contiene múltiples mayúsculas seguidas que no sean acrónimos
    /[a-z][A-Z][a-z]/.test(name) ||
    // Nombres que suenan aburridos o poco épicos
    /\\b(simple|básico|normal|común|regular|ordinario)\\b/i.test(name)
  );
}

function isCategoryProblematic(category) {
  // Las categorías en inglés necesitan ser traducidas
  return ['arithmetic', 'algebra', 'geometry', 'logic', 'statistics', 'math', 'mathematics'].includes(category);
}

async function fixCardNamesAndCategories() {
  try {
    console.log('🔧 Iniciando corrección ÉPICA de nombres y categorías de cartas...\n');
    
    // 1. Obtener todas las cartas activas con sus tipos de problemas
    console.log('🔍 Step 1: Obteniendo cartas y tipos de problemas...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select(`
        id, 
        name, 
        category,
        rarity,
        problem_type_id,
        cards_problem_types!fk_cards_problem_types(name_es, code)
      `)
      .eq('is_active', true);
      
    if (cardsError) {
      console.error('❌ Error obteniendo cartas:', cardsError);
      return;
    }
    
    console.log(`✅ Encontradas ${cards.length} cartas activas`);
    
    // 2. Analizar y corregir nombres y categorías
    let nameUpdatesCount = 0;
    let categoryUpdatesCount = 0;
    let skippedCount = 0;
    
    console.log('\n🔧 Step 2: Transformando cartas en artefactos ÉPICOS...');
    
    for (const card of cards) {
      let needsUpdate = false;
      let updates = {};
      
      // Verificar si el nombre necesita corrección
      const nameNeedsFixing = isNameProblematic(card.name);
      
      // Verificar si la categoría necesita traducción
      const categoryNeedsFixing = isCategoryProblematic(card.category);
      
      if (nameNeedsFixing || categoryNeedsFixing) {
        console.log(`\n⚡ Transformando: "${card.name}" (${card.category}) - ${card.rarity}`);
        
        // Corregir categoría si es necesario
        if (categoryNeedsFixing) {
          const newCategory = categoryTranslations[card.category] || card.category;
          updates.category = newCategory;
          console.log(`   📂 Categoría: ${card.category} → ${newCategory}`);
          categoryUpdatesCount++;
          needsUpdate = true;
        }
        
        // Corregir nombre si es necesario
        if (nameNeedsFixing) {
          const problemTypeName = card.cards_problem_types?.name_es;
          const newName = generateAttractiveCardName(card, problemTypeName);
          updates.name = newName;
          console.log(`   ⚔️  Nombre ÉPICO: "${card.name}" → "${newName}"`);
          nameUpdatesCount++;
          needsUpdate = true;
        }
        
        // Aplicar actualizaciones
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('cards')
            .update(updates)
            .eq('id', card.id);
            
          if (updateError) {
            console.error(`   ❌ Error transformando carta ${card.id}:`, updateError);
          } else {
            console.log(`   ✨ ¡Transformación ÉPICA completada!`);
          }
          
          // Pausa pequeña para no sobrecargar la API
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        console.log(`✅ "${card.name}" (${card.category}): Ya es suficientemente épica`);
        skippedCount++;
      }
    }
    
    console.log(`\n🎉 ¡Transformación ÉPICA completada!`);
    console.log(`📊 Estadísticas de la Gran Transformación:`);
    console.log(`   ⚔️  Nombres épicos creados: ${nameUpdatesCount}`);
    console.log(`   📂 Categorías traducidas: ${categoryUpdatesCount}`);
    console.log(`   ✨ Cartas ya épicas: ${skippedCount}`);
    console.log(`   🃏 Total de artefactos procesados: ${cards.length}`);
    
    if (nameUpdatesCount > 0 || categoryUpdatesCount > 0) {
      console.log(`\n🔄 ¡Reinicia el servidor para presenciar la nueva colección de artefactos épicos!`);
    }
    
  } catch (error) {
    console.error('🚨 Error en la gran transformación:', error);
  }
}

// Ejecutar la corrección
if (require.main === module) {
  fixCardNamesAndCategories().catch(console.error);
}

module.exports = { 
  fixCardNamesAndCategories, 
  generateAttractiveCardName, 
  categoryTranslations,
  isNameProblematic,
  isCategoryProblematic
}; 