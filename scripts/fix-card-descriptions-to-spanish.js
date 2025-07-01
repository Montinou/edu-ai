const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeo de palabras en inglés a español para las descripciones
const translations = {
  // Rareza
  'common': 'común',
  'rare': 'raro',
  'epic': 'épico',
  'legendary': 'legendario',
  
  // Categorías
  'arithmetic': 'aritmética',
  'algebra': 'álgebra',
  'geometry': 'geometría',
  'logic': 'lógica',
  'statistics': 'estadística',
  'math': 'matemáticas',
  
  // Tipos de problemas (English codes)
  'addition': 'suma',
  'subtraction': 'resta',
  'multiplication': 'multiplicación',
  'division': 'división',
  'fractions': 'fracciones',
  'decimals': 'decimales',
  'percentages': 'porcentajes',
  'equations': 'ecuaciones',
  'inequalities': 'desigualdades',
  'polynomials': 'polinomios',
  'factoring': 'factorización',
  'area_perimeter': 'área y perímetro',
  'angles': 'ángulos',
  'triangles': 'triángulos',
  'circles': 'círculos',
  'patterns': 'patrones',
  'sequences': 'secuencias',
  'deduction': 'deducción',
  'probability': 'probabilidad',
  
  // Palabras comunes en descripciones
  'attack': 'ataque',
  'power': 'poder',
  'based': 'basado',
  'on': 'en',
  'educational': 'educativo',
  'complexity': 'complejidad',
  'real': 'real',
  'artifact': 'artefacto',
  'dominates': 'domina',
  'masters': 'domina',
  'magical': 'mágico',
  'mystic': 'místico',
  'ancient': 'ancestral',
  'crystal': 'cristal',
  'orb': 'orbe',
  'staff': 'báculo',
  'tome': 'tomo',
  'book': 'libro',
  'mirror': 'espejo',
  'shield': 'escudo',
  'sword': 'espada',
  'guardian': 'guardián',
  'master': 'maestro',
  'sage': 'sabio',
  'wizard': 'mago',
  'that': 'que',
  'with': 'con',
  'and': 'y',
  'the': 'el/la',
  'in': 'en'
};

// Plantillas específicas por tipo de problema para mejor variedad
const spanishDescriptionTemplatesByProblemType = {
  // Matemáticas básicas
  'Suma': [
    'Cristal mágico que irradia energía sumativa',
    'Artefacto ancestral que une números con poder místico',
    'Orbe encantado que combina valores matemáticos',
    'Talismán que fortalece las habilidades de adición'
  ],
  'Resta': [
    'Espejo que refleja la diferencia entre números',
    'Báculo que sustrae energía matemática',
    'Cristal que equilibra mediante la sustracción',
    'Amuleto que enseña el arte de la resta'
  ],
  'Multiplicación': [
    'Prisma que multiplica la potencia numérica',
    'Artefacto que amplifica valores matemáticos',
    'Orbe que expande números a través de la multiplicación',
    'Reliquia que domina las tablas de multiplicar'
  ],
  'División': [
    'Cuchilla mística que divide con precisión perfecta',
    'Instrumento que reparte números equitativamente',
    'Cristal que fragmenta valores matemáticos',
    'Artefacto que enseña el arte de la división'
  ],
  'Fracciones': [
    'Fragmento sagrado que representa partes del todo',
    'Cristal fraccionado que enseña proporciones',
    'Artefacto que domina los números quebrados',
    'Reliquia que revela el misterio de las fracciones'
  ],
  'Patrones': [
    'Codex ancestral que revela secuencias ocultas',
    'Cristal que desvela patrones matemáticos',
    'Artefacto que reconoce orden en el caos',
    'Orbe que predice la continuidad de secuencias'
  ],
  'Deducción': [
    'Lente mística que clarifica el razonamiento',
    'Artefacto que desentraña misterios lógicos',
    'Cristal que ilumina la verdad oculta',
    'Instrumento que guía el pensamiento deductivo'
  ],
  'Ecuaciones': [
    'Balanza cósmica que equilibra variables',
    'Artefacto que resuelve incógnitas algebraicas',
    'Cristal que revela valores desconocidos',
    'Reliquia que domina el álgebra avanzada'
  ],
  'Ángulos': [
    'Compás celestial que mide ángulos perfectos',
    'Transportador místico de geometría sagrada',
    'Artefacto que comprende las medidas angulares',
    'Cristal que revela secretos geométricos'
  ],
  'Probabilidad': [
    'Dado cósmico que predice posibilidades',
    'Orbe del destino que calcula probabilidades',
    'Artefacto que domina las leyes del azar',
    'Cristal que revela futuros matemáticos'
  ]
};

// Plantillas generales mejoradas para diferentes rarities
const spanishDescriptionTemplates = {
  common: [
    'Artefacto mágico básico que enseña {subject} con claridad',
    'Cristal educativo {rarity} especializado en {subject}',
    'Herramienta encantada que fortalece el conocimiento de {subject}',
    'Amuleto {rarity} que guía en el aprendizaje de {subject}',
    'Instrumento místico básico de {subject}'
  ],
  rare: [
    'Poderoso artefacto {rarity} que domina los secretos de {subject}',
    'Reliquia antigua imbuida con sabiduría de {subject}',
    'Cristal {rarity} que desentraña misterios de {subject}',
    'Talismán encantado con conocimientos profundos de {subject}',
    'Instrumento místico que amplifica el dominio de {subject}'
  ],
  epic: [
    'Artefacto {rarity} trascendente que redefine {subject}',
    'Reliquia legendaria que contiene la esencia de {subject}',
    'Cristal {rarity} forjado en los fuegos del conocimiento de {subject}',
    'Artefacto ancestral que despierta maestría absoluta en {subject}',
    'Orbe {rarity} que canaliza poderes primordiales de {subject}'
  ],
  legendary: [
    'El artefacto {rarity} supremo que otorga dominio absoluto de {subject}',
    'Reliquia divina que encarna la perfección de {subject}',
    'El tesoro {rarity} más codiciado, maestro supremo de {subject}',
    'Artefacto {rarity} de poder incomparable en {subject}',
    'La creación {rarity} definitiva que trasciende {subject}'
  ]
};

// Mapeo de categorías y tipos de problemas a nombres en español
const subjectNames = {
  'arithmetic': 'aritmética',
  'algebra': 'álgebra', 
  'geometry': 'geometría',
  'logic': 'lógica',
  'statistics': 'estadística',
  'math': 'matemáticas',
  
  // Problem types específicos
  'addition': 'suma',
  'subtraction': 'resta',
  'multiplication': 'multiplicación',
  'division': 'división',
  'fractions': 'fracciones',
  'decimals': 'decimales',
  'percentages': 'porcentajes',
  'equations': 'ecuaciones',
  'inequalities': 'desigualdades',
  'polynomials': 'polinomios',
  'factorization': 'factorización',
  'area_perimeter': 'área y perímetro',
  'angles': 'ángulos',
  'triangles': 'triángulos',
  'circles': 'círculos',
  'patterns': 'patrones',
  'sequences': 'secuencias',
  'deduction': 'deducción',
  'probability': 'probabilidad'
};

function translateToSpanish(text) {
  if (!text) return text;
  
  let translated = text.toLowerCase();
  
  // Reemplazar palabras específicas
  for (const [english, spanish] of Object.entries(translations)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    translated = translated.replace(regex, spanish);
  }
  
  // Capitalizar primera letra
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function generateSpanishDescription(card) {
  const rarity = card.rarity || 'common';
  const category = card.category || 'arithmetic';
  
  // Obtener subject en español
  const subject = subjectNames[category] || category;
  
  // Intentar usar plantilla específica por tipo de problema primero
  const problemType = card.problemType || card.problem_type_code;
  if (problemType && spanishDescriptionTemplatesByProblemType[problemType]) {
    const specificTemplates = spanishDescriptionTemplatesByProblemType[problemType];
    return specificTemplates[Math.floor(Math.random() * specificTemplates.length)];
  }
  
  // Fallback a plantilla general
  const templates = spanishDescriptionTemplates[rarity] || spanishDescriptionTemplates.common;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Reemplazar placeholders
  return template
    .replace(/{rarity}/g, rarity)
    .replace(/{subject}/g, subject);
}

async function fixCardDescriptions() {
  try {
    console.log('🔧 Iniciando corrección de descripciones a español completo...\n');
    
    // 1. Obtener todas las cartas activas
    console.log('🔍 Step 1: Obteniendo todas las cartas...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, description, rarity, category, problem_type_id')
      .eq('is_active', true);
      
    if (cardsError) {
      console.error('❌ Error obteniendo cartas:', cardsError);
      return;
    }
    
    console.log(`✅ Encontradas ${cards.length} cartas activas`);
    
    // 2. Obtener tipos de problemas para contexto
    console.log('\n🔍 Step 2: Obteniendo tipos de problemas...');
    const { data: problemTypes, error: ptError } = await supabase
      .from('cards_problem_types')
      .select('*');
      
    if (ptError) {
      console.error('❌ Error obteniendo tipos de problemas:', ptError);
      return;
    }
    
    const problemTypeMap = problemTypes.reduce((map, pt) => {
      map[pt.id] = pt;
      return map;
    }, {});
    
    console.log(`✅ Encontrados ${problemTypes.length} tipos de problemas`);
    
    // 3. Analizar y corregir descripciones
    let updatedCount = 0;
    let skippedCount = 0;
    
    console.log('\n🔧 Step 3: Analizando y corrigiendo descripciones...');
    
    for (const card of cards) {
      const currentDescription = card.description || '';
      
      // Verificar si la descripción necesita traducción - MEJORADA la detección
      const needsTranslation = /(\\b(epic|rare|common|legendary|arithmetic|algebra|geometry|logic|statistics|math|addition|subtraction|multiplication|division|attack|power|based|on|educational|complexity|real|artifact|dominates|masters|magical|mystic|ancient|that|with|and|the|in)\\b|deduction|patterns|sequences|area_perimeter|trigonometry|quadratic|polynomials|linear_equations|distributions|mean_median|probability)/i.test(currentDescription);
      
      // También verificar nombres de cartas que claramente contienen palabras en inglés
      const hasEnglishInName = /(deduction|patterns|sequences|area_perimeter|trigonometry|quadratic|polynomials|linear_equations|distributions|mean_median|probability|addition|subtraction|multiplication|division)/i.test(card.name);
      
      if (needsTranslation || hasEnglishInName || !currentDescription || currentDescription.length < 15) {
        console.log(`\n🔄 Corrigiendo: "${card.name}"`);
        console.log(`   Descripción actual: "${currentDescription}"`);
        
        // Obtener información del tipo de problema
        const problemType = problemTypeMap[card.problem_type_id];
        
        // Generar nueva descripción en español
        let newDescription;
        if (currentDescription && currentDescription.length > 10 && !needsTranslation) {
          // Si ya está en español, solo mejorarla
          newDescription = currentDescription;
        } else {
          // Generar nueva descripción basada en la información de la carta
          if (problemType) {
            const subject = problemType.name_es || subjectNames[card.category] || card.category;
            
            // Usar plantilla específica si existe
            if (spanishDescriptionTemplatesByProblemType[subject]) {
              const specificTemplates = spanishDescriptionTemplatesByProblemType[subject];
              newDescription = specificTemplates[Math.floor(Math.random() * specificTemplates.length)];
            } else {
              // Usar plantilla general
              const rarity = card.rarity || 'common';
              const templates = spanishDescriptionTemplates[rarity] || spanishDescriptionTemplates.common;
              const template = templates[Math.floor(Math.random() * templates.length)];
              
              newDescription = template
                .replace(/{rarity}/g, rarity)
                .replace(/{subject}/g, subject);
            }
          } else {
            newDescription = generateSpanishDescription(card);
          }
        }
        
        console.log(`   Nueva descripción: "${newDescription}"`);
        
        // Actualizar en la base de datos
        const { error: updateError } = await supabase
          .from('cards')
          .update({ description: newDescription })
          .eq('id', card.id);
          
        if (updateError) {
          console.error(`❌ Error actualizando "${card.name}":`, updateError);
        } else {
          console.log(`   ✅ Actualizada exitosamente`);
          updatedCount++;
        }
        
        // Pausa pequeña para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 100));
      } else {
        console.log(`✅ "${card.name}": Ya está en español`);
        skippedCount++;
      }
    }
    
    console.log(`\n🎉 ¡Corrección completada!`);
    console.log(`📊 Estadísticas:`);
    console.log(`   - Cartas actualizadas: ${updatedCount}`);
    console.log(`   - Cartas ya correctas: ${skippedCount}`);
    console.log(`   - Total procesadas: ${cards.length}`);
    
    if (updatedCount > 0) {
      console.log(`\n🔄 Recomendación: Reinicia el servidor de desarrollo para ver los cambios`);
    }
    
  } catch (error) {
    console.error('🚨 Error en la corrección:', error);
  }
}

// Ejecutar la corrección
if (require.main === module) {
  fixCardDescriptions().catch(console.error);
}

module.exports = { fixCardDescriptions, translateToSpanish, generateSpanishDescription };