const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testImageGeneration() {
  console.log('🎨 Testing Image Generation System\n');
  
  try {
    // Check existing cards
    console.log('📋 Checking existing cards...');
    const { data: cards, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .limit(5);
      
    if (cardsError) {
      console.error('❌ Error fetching cards:', cardsError.message);
      return;
    }
    
    console.log(`✅ Found ${cards.length} cards in database\n`);
    
    // Display cards and their image status
    cards.forEach((card, index) => {
      console.log(`🃏 Card ${index + 1}: ${card.name}`);
      console.log(`   Type: ${card.type} | Rarity: ${card.rarity}`);
      console.log(`   Problem Type: ${card.problem_type || 'N/A'}`);
      console.log(`   Image URL: ${card.image_url ? '✅ Has image' : '❌ No image'}`);
      console.log(`   Image Prompt: ${card.image_prompt ? '✅ Has prompt' : '❌ No prompt'}`);
      console.log('');
    });
    
    // Check storage buckets
    console.log('🗄️ Checking storage buckets...');
    const buckets = await supabase.storage.listBuckets();
    
    if (buckets.error) {
      console.error('❌ Error checking buckets:', buckets.error.message);
    } else {
      console.log('✅ Available buckets:', buckets.data.map(b => b.id).join(', '));
    }
    
    // Count cards without images
    const cardsWithoutImages = cards.filter(card => !card.image_url).length;
    console.log(`\n📊 Summary:`);
    console.log(`   - Total cards: ${cards.length}`);
    console.log(`   - Cards with images: ${cards.length - cardsWithoutImages}`);
    console.log(`   - Cards needing images: ${cardsWithoutImages}`);
    
    if (cardsWithoutImages > 0) {
      console.log('\n💡 To generate images for cards without them, run:');
      console.log('   curl -X POST http://localhost:3000/api/generate-card-images \\');
      console.log('   -H "Content-Type: application/json" \\');
      console.log('   -d \'{"generateAll": true}\'');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run the test
testImageGeneration().catch(console.error); 