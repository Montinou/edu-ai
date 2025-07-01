const { createClient } = require('@supabase/supabase-js');

// Direct database verification script
const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M';

const supabase = createClient(supabaseUrl, supabaseKey);

async function directDatabaseCheck() {
    console.log('🔍 Verificación directa de la base de datos...\n');
    
    // Test tables to check
    const tablesToCheck = [
        'users', 'cards', 'user_cards', 'player_progress', 
        'game_sessions', 'problem_results', 'achievements', 
        'user_achievements', 'ai_generated_content',
        'cards_problem_types', 'player_learning_profiles', 
        'problem_history', 'battle_sessions'
    ];

    const results = {
        existing: [],
        missing: [],
        errors: []
    };

    console.log('📋 Verificando tablas una por una...\n');

    for (const table of tablesToCheck) {
        try {
            console.log(`   Verificando ${table}...`);
            
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true })
                .limit(1);

            if (error) {
                if (error.code === 'PGRST106' || error.message.includes('does not exist')) {
                    console.log(`   ❌ ${table}: NO EXISTE`);
                    results.missing.push(table);
                } else {
                    console.log(`   ⚠️  ${table}: ERROR - ${error.message}`);
                    results.errors.push({ table, error: error.message });
                }
            } else {
                console.log(`   ✅ ${table}: EXISTE (${count || 0} registros)`);
                results.existing.push({ table, count: count || 0 });
            }
        } catch (err) {
            console.log(`   ❌ ${table}: EXCEPCIÓN - ${err.message}`);
            results.errors.push({ table, error: err.message });
        }
    }

    // Check cards table structure if it exists
    if (results.existing.find(t => t.table === 'cards')) {
        console.log('\n🃏 Verificando estructura de tabla cards...');
        
        try {
            const { data: cardsData, error } = await supabase
                .from('cards')
                .select('*')
                .limit(1);

            if (!error && cardsData && cardsData.length > 0) {
                const columns = Object.keys(cardsData[0]);
                console.log(`   📊 Columnas encontradas: ${columns.length}`);
                console.log(`   📝 Columnas: ${columns.join(', ')}`);
                
                // Check for specific column sets
                const dynamicColumns = ['category', 'base_power', 'level_range', 'lore', 'art_style'];
                const newStructureColumns = ['problem', 'power', 'frame_type'];
                
                const hasDynamicColumns = dynamicColumns.some(col => columns.includes(col));
                const hasNewStructure = newStructureColumns.some(col => columns.includes(col));
                
                console.log(`   🔄 Columnas dinámicas: ${hasDynamicColumns ? '✅ SÍ' : '❌ NO'}`);
                console.log(`   🆕 Nueva estructura: ${hasNewStructure ? '✅ SÍ' : '❌ NO'}`);
                
                // Sample card info
                const card = cardsData[0];
                console.log(`   🃏 Carta de ejemplo: ${card.name || 'Sin nombre'}`);
                console.log(`      - Tipo: ${card.type || 'N/A'}`);
                console.log(`      - Rareza: ${card.rarity || 'N/A'}`);
                console.log(`      - Categoría: ${card.category || 'N/A'}`);
                
            } else if (!error) {
                console.log('   📊 Tabla cards está vacía');
            }
        } catch (err) {
            console.log(`   ❌ Error al verificar estructura: ${err.message}`);
        }
    }

    // Check cards_problem_types if it exists
    if (results.existing.find(t => t.table === 'cards_problem_types')) {
        console.log('\n🎯 Verificando tipos de problemas...');
        
        try {
            const { data: problemTypes, error } = await supabase
                .from('cards_problem_types')
                .select('*')
                .limit(5);

            if (!error && problemTypes) {
                console.log(`   📊 Total de tipos: ${problemTypes.length}`);
                if (problemTypes.length > 0) {
                    console.log('   📝 Tipos de ejemplo:');
                    problemTypes.forEach(type => {
                        console.log(`      - ${type.code}: ${type.name_es} (${type.category})`);
                    });
                }
            }
        } catch (err) {
            console.log(`   ❌ Error al verificar tipos: ${err.message}`);
        }
    }

    // Generate recommendations
    console.log('\n🎯 ANÁLISIS Y RECOMENDACIONES:\n');

    // Core tables analysis
    const coreTables = ['users', 'cards', 'user_cards', 'player_progress', 'game_sessions', 'problem_results', 'achievements', 'user_achievements'];
    const existingCoreTables = results.existing.filter(t => coreTables.includes(t.table));
    
    console.log(`📊 Tablas principales: ${existingCoreTables.length}/${coreTables.length}`);
    
    if (existingCoreTables.length === 0) {
        console.log('   🚨 [CRÍTICO] Ejecutar inmediatamente: complete-database-setup.sql');
        console.log('      Razón: No existe ninguna tabla principal del sistema');
        console.log('      Impacto: El sistema no puede funcionar');
    } else if (existingCoreTables.length < coreTables.length) {
        console.log('   ⚠️  [ALTO] Revisar: complete-database-setup.sql');
        console.log(`      Razón: Solo existen ${existingCoreTables.length}/${coreTables.length} tablas principales`);
        const missingCore = coreTables.filter(t => !results.existing.find(e => e.table === t));
        console.log(`      Tablas faltantes: ${missingCore.join(', ')}`);
    } else {
        console.log('   ✅ Todas las tablas principales existen');
    }

    // Dynamic system analysis
    const dynamicTables = ['cards_problem_types', 'player_learning_profiles', 'problem_history', 'battle_sessions'];
    const existingDynamicTables = results.existing.filter(t => dynamicTables.includes(t.table));
    
    console.log(`\n🚀 Sistema dinámico: ${existingDynamicTables.length}/${dynamicTables.length}`);
    
    if (!results.existing.find(t => t.table === 'cards_problem_types')) {
        console.log('   ⚠️  [ALTO] Ejecutar: setup-dynamic-cards-database.sql');
        console.log('      Razón: Falta la tabla cards_problem_types (esencial para cartas dinámicas)');
    }
    
    if (existingDynamicTables.length < dynamicTables.length) {
        console.log('   📝 [MEDIO] Ejecutar: migrate-to-dynamic-cards.sql');
        console.log(`      Razón: Solo existen ${existingDynamicTables.length}/${dynamicTables.length} tablas dinámicas`);
        const missingDynamic = dynamicTables.filter(t => !results.existing.find(e => e.table === t));
        console.log(`      Tablas faltantes: ${missingDynamic.join(', ')}`);
    }

    // Security recommendations
    if (existingCoreTables.length > 0) {
        console.log('\n🔒 Seguridad:');
        console.log('   ⚠️  [ALTO] Ejecutar: fix-security-issues.sql');
        console.log('      Razón: Configurar Row Level Security en todas las tablas');
        console.log('   ⚠️  [ALTO] Ejecutar: FINAL_SECURITY_FIX.sql');
        console.log('      Razón: Finalizar configuración de seguridad');
    }

    // Storage recommendation
    console.log('\n💾 Almacenamiento:');
    console.log('   📝 [RECOMENDADO] Ejecutar: setup-supabase-storage.sql');
    console.log('      Razón: Configurar buckets de almacenamiento para imágenes de cartas');

    // Summary and next steps
    console.log('\n📋 RESUMEN EJECUTIVO:');
    console.log(`   ✅ Tablas existentes: ${results.existing.length}`);
    console.log(`   ❌ Tablas faltantes: ${results.missing.length}`);
    console.log(`   ⚠️  Errores de acceso: ${results.errors.length}`);

    if (results.existing.length === 0) {
        console.log('\n🚨 ESTADO: Base de datos NO CONFIGURADA');
        console.log('🔧 ACCIÓN INMEDIATA: Ejecutar complete-database-setup.sql');
    } else if (results.existing.length < tablesToCheck.length / 2) {
        console.log('\n⚠️  ESTADO: Base de datos PARCIALMENTE CONFIGURADA');
        console.log('🔧 ACCIÓN RECOMENDADA: Completar setup de tablas faltantes');
    } else {
        console.log('\n✅ ESTADO: Base de datos MAYORMENTE CONFIGURADA');
        console.log('🔧 ACCIÓN RECOMENDADA: Completar sistema dinámico y seguridad');
    }

    // Next steps
    console.log('\n📋 PRÓXIMOS PASOS SUGERIDOS:');
    if (results.existing.length === 0) {
        console.log('   1. Ejecutar: complete-database-setup.sql');
        console.log('   2. Ejecutar: setup-dynamic-cards-database.sql');
        console.log('   3. Ejecutar: migrate-to-dynamic-cards.sql');
        console.log('   4. Ejecutar: fix-security-issues.sql');
        console.log('   5. Ejecutar: FINAL_SECURITY_FIX.sql');
        console.log('   6. Ejecutar: setup-supabase-storage.sql');
    } else {
        const missingTables = results.missing;
        if (missingTables.includes('cards_problem_types')) {
            console.log('   1. Ejecutar: setup-dynamic-cards-database.sql');
        }
        if (missingTables.some(t => ['player_learning_profiles', 'problem_history', 'battle_sessions'].includes(t))) {
            console.log('   2. Ejecutar: migrate-to-dynamic-cards.sql');
        }
        console.log('   3. Ejecutar: fix-security-issues.sql');
        console.log('   4. Ejecutar: FINAL_SECURITY_FIX.sql');
        console.log('   5. Ejecutar: setup-supabase-storage.sql');
    }

    return results;
}

directDatabaseCheck()
    .then(results => {
        console.log('\n🎉 Verificación completada');
        
        // Save detailed results
        const fs = require('fs');
        fs.writeFileSync('database-detailed-status.json', JSON.stringify(results, null, 2));
        console.log('📄 Resultados detallados guardados en database-detailed-status.json');
    })
    .catch(error => {
        console.error('\n💥 Error fatal durante la verificación:', error.message);
        console.log('\n🔧 POSIBLES SOLUCIONES:');
        console.log('   1. Verificar conexión a internet');
        console.log('   2. Verificar credenciales de Supabase en env.example');
        console.log('   3. Verificar que el proyecto de Supabase esté activo');
        console.log('   4. Intentar desde una red diferente');
    }); 