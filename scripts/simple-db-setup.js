const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyezdyycisbakuozpcym.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M'
);

console.log('🚀 Setting up Dynamic Cards Database...\n');

async function setupDatabase() {
  try {
    // Step 1: Create problem types table and insert data
    console.log('📋 Step 1: Setting up problem types...');
    
    const problemTypes = [
      // Math types
      { code: 'addition', name_es: 'Suma', name_en: 'Addition', category: 'math', difficulty_base: 2, icon: '➕', color_hex: '#3B82F6', sort_order: 1 },
      { code: 'subtraction', name_es: 'Resta', name_en: 'Subtraction', category: 'math', difficulty_base: 3, icon: '➖', color_hex: '#EF4444', sort_order: 2 },
      { code: 'multiplication', name_es: 'Multiplicación', name_en: 'Multiplication', category: 'math', difficulty_base: 4, icon: '✖️', color_hex: '#F59E0B', sort_order: 3 },
      { code: 'division', name_es: 'División', name_en: 'Division', category: 'math', difficulty_base: 5, icon: '➗', color_hex: '#8B5CF6', sort_order: 4 },
      { code: 'fractions', name_es: 'Fracciones', name_en: 'Fractions', category: 'math', difficulty_base: 6, icon: '🍰', color_hex: '#EC4899', sort_order: 5 },
      { code: 'decimals', name_es: 'Decimales', name_en: 'Decimals', category: 'math', difficulty_base: 5, icon: '🔢', color_hex: '#06B6D4', sort_order: 6 },
      { code: 'percentages', name_es: 'Porcentajes', name_en: 'Percentages', category: 'math', difficulty_base: 7, icon: '📊', color_hex: '#10B981', sort_order: 7 },
      
      // Algebra types
      { code: 'equations', name_es: 'Ecuaciones', name_en: 'Equations', category: 'algebra', difficulty_base: 6, icon: '⚖️', color_hex: '#059669', sort_order: 11 },
      { code: 'inequalities', name_es: 'Desigualdades', name_en: 'Inequalities', category: 'algebra', difficulty_base: 7, icon: '⚖️', color_hex: '#0D9488', sort_order: 12 },
      { code: 'polynomials', name_es: 'Polinomios', name_en: 'Polynomials', category: 'algebra', difficulty_base: 8, icon: '📐', color_hex: '#0F766E', sort_order: 13 },
      { code: 'factoring', name_es: 'Factorización', name_en: 'Factoring', category: 'algebra', difficulty_base: 9, icon: '🔍', color_hex: '#134E4A', sort_order: 14 },
      
      // Geometry types
      { code: 'area_perimeter', name_es: 'Área y Perímetro', name_en: 'Area and Perimeter', category: 'geometry', difficulty_base: 5, icon: '📐', color_hex: '#DC2626', sort_order: 21 },
      { code: 'angles', name_es: 'Ángulos', name_en: 'Angles', category: 'geometry', difficulty_base: 4, icon: '📐', color_hex: '#EF4444', sort_order: 22 },
      { code: 'triangles', name_es: 'Triángulos', name_en: 'Triangles', category: 'geometry', difficulty_base: 6, icon: '🔺', color_hex: '#F87171', sort_order: 23 },
      { code: 'circles', name_es: 'Círculos', name_en: 'Circles', category: 'geometry', difficulty_base: 7, icon: '⭕', color_hex: '#FCA5A5', sort_order: 24 },
      
      // Logic types
      { code: 'patterns', name_es: 'Patrones', name_en: 'Patterns', category: 'logic', difficulty_base: 4, icon: '🔄', color_hex: '#7C3AED', sort_order: 31 },
      { code: 'sequences', name_es: 'Secuencias', name_en: 'Sequences', category: 'logic', difficulty_base: 5, icon: '🔢', color_hex: '#8B5CF6', sort_order: 32 },
      { code: 'deduction', name_es: 'Deducción', name_en: 'Deduction', category: 'logic', difficulty_base: 6, icon: '🔍', color_hex: '#A855F7', sort_order: 33 },
      { code: 'logic', name_es: 'Lógica', name_en: 'Logic', category: 'logic', difficulty_base: 7, icon: '🧩', color_hex: '#C084FC', sort_order: 34 },
      
      // Statistics types
      { code: 'statistics', name_es: 'Estadística', name_en: 'Statistics', category: 'math', difficulty_base: 8, icon: '📊', color_hex: '#6366F1', sort_order: 41 },
      { code: 'probability', name_es: 'Probabilidad', name_en: 'Probability', category: 'math', difficulty_base: 9, icon: '🎲', color_hex: '#818CF8', sort_order: 42 }
    ];

    // Check if table exists and create if needed
    const { data: existingData, error: checkError } = await supabase
      .from('cards_problem_types')
      .select('id')
      .limit(1);

    if (checkError && checkError.message.includes('does not exist')) {
      console.log('   📋 Creating cards_problem_types table...');
      
      // Create the table via SQL execution
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS cards_problem_types (
          id SERIAL PRIMARY KEY,
          code VARCHAR(20) UNIQUE NOT NULL,
          name_es VARCHAR(100) NOT NULL,
          name_en VARCHAR(100) NOT NULL,
          description_es TEXT,
          description_en TEXT,
          category VARCHAR(20) NOT NULL,
          difficulty_base INTEGER DEFAULT 3,
          icon VARCHAR(20) DEFAULT '🔢',
          color_hex VARCHAR(7) DEFAULT '#4F46E5',
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      // Use the REST API to execute SQL
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iyezdyycisbakuozpcym.supabase.co'}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M'
        },
        body: JSON.stringify({ sql: createTableSQL })
      });

      if (!response.ok) {
        console.log('   ⚠️  Could not create table via SQL, will proceed with inserts...');
      } else {
        console.log('   ✅ Table created successfully');
      }
    }

    // Insert problem types
    console.log('   📝 Inserting problem types...');
    
    let insertedCount = 0;
    for (const problemType of problemTypes) {
      try {
        const { error: insertError } = await supabase
          .from('cards_problem_types')
          .upsert(problemType, { onConflict: 'code' });

        if (!insertError) {
          insertedCount++;
        } else {
          console.log(`   ⚠️  Error inserting ${problemType.code}: ${insertError.message}`);
        }
      } catch (error) {
        console.log(`   ⚠️  Error inserting ${problemType.code}: ${error.message}`);
      }
    }

    console.log(`   ✅ Inserted/updated ${insertedCount}/${problemTypes.length} problem types`);

    // Step 2: Verify the database is ready
    console.log('\n🔍 Step 2: Verifying database setup...');
    
    const { data: problemTypeCheck, error: ptError } = await supabase
      .from('cards_problem_types')
      .select('id, code, name_es, category')
      .limit(5);

    if (ptError) {
      console.log(`   ❌ Error verifying problem types: ${ptError.message}`);
      console.log('   💡 You may need to manually create the cards_problem_types table in Supabase');
    } else {
      console.log(`   ✅ Found ${problemTypeCheck.length} problem types in database`);
      problemTypeCheck.forEach(pt => {
        console.log(`     - ${pt.code}: ${pt.name_es} (${pt.category})`);
      });
    }

    // Step 3: Check cards table structure
    console.log('\n📋 Step 3: Checking cards table...');
    
    const { data: cardsCheck, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, type, category, base_power, art_style')
      .limit(1);

    if (cardsError) {
      console.log(`   ⚠️  Cards table issue: ${cardsError.message}`);
      console.log('   💡 Some columns may not exist yet. The card generation script will handle this.');
    } else {
      console.log('   ✅ Cards table is accessible');
      
      // Check specific columns
      const hasNewColumns = cardsCheck.length === 0 || 
                           (cardsCheck[0].hasOwnProperty('category') && 
                            cardsCheck[0].hasOwnProperty('base_power'));
      
      if (hasNewColumns) {
        console.log('   ✅ Dynamic columns detected in cards table');
      } else {
        console.log('   ⚠️  Dynamic columns may be missing from cards table');
        console.log('   💡 Will attempt to add them during card generation');
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('🚀 Ready to generate dynamic cards!');
    
    return true;

  } catch (error) {
    console.error('❌ Database setup error:', error.message);
    return false;
  }
}

// Run setup
if (require.main === module) {
  setupDatabase()
    .then(success => {
      if (success) {
        console.log('\n✅ Setup completed successfully!');
        console.log('Next step: Run node scripts/generate-cards.js');
      } else {
        console.log('\n❌ Setup failed. Please check the errors above.');
      }
    })
    .catch(console.error);
}

module.exports = { setupDatabase }; 