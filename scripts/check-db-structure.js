const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabaseStructure() {
  console.log('🔍 Checking database structure...');
  
  try {
    // Check cards table
    console.log('\n📋 Cards table:');
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .limit(1);
    
    if (cardsError) {
      console.log('❌ Cards table error:', cardsError);
    } else {
      if (cardsData && cardsData.length > 0) {
        console.log('✅ Cards table columns:', Object.keys(cardsData[0]));
      } else {
        console.log('⚠️ Cards table is empty');
        
        // Try a test insert to see what columns are expected
        const testCard = {
          name: 'Test Card',
          description: 'Test Description',
          type: 'attack',
          rarity: 'common',
          base_power: 25,
          category: 'arithmetic',
          problem_type_id: 1,
          level_range: [1, 4],
          is_active: true
        };
        
        const { data: insertData, error: insertError } = await supabase
          .from('cards')
          .insert(testCard)
          .select();
        
        if (insertError) {
          console.log('❌ Test insert error:', insertError);
        } else {
          console.log('✅ Test insert successful, columns:', Object.keys(insertData[0]));
          // Clean up
          await supabase.from('cards').delete().eq('id', insertData[0].id);
        }
      }
    }
    
    // Check image_cache table
    console.log('\n💾 Image cache table:');
    const { data: cacheData, error: cacheError } = await supabase
      .from('image_cache')
      .select('*')
      .limit(1);
    
    if (cacheError) {
      console.log('❌ Image cache table error:', cacheError);
    } else {
      console.log('✅ Image cache table exists');
      if (cacheData && cacheData.length > 0) {
        console.log('   Columns:', Object.keys(cacheData[0]));
      } else {
        console.log('   (Empty table)');
      }
    }
    
  } catch (error) {
    console.error('🚨 Database check error:', error);
  }
}

if (require.main === module) {
  checkDatabaseStructure();
}

module.exports = { checkDatabaseStructure }; 