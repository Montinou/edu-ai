const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iyezdyycisbakuozpcym.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5ZXpkeXljaXNiYWt1b3pwY3ltIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODM5MjIyNSwiZXhwIjoyMDYzOTY4MjI1fQ.v3S_jJn-WqMj2SSGekR9QpMRgpYGANh7UDZbP2yQi8M';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuthSystem() {
  console.log('🧪 Probando sistema de autenticación...\n');
  
  try {
    // 1. Verificar que las tablas existen
    console.log('📋 1. VERIFICANDO TABLAS...');
    console.log('============================');
    
    const tables = ['users', 'user_sessions', 'user_profiles', 'user_stats'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ ${table}: ${error.message}`);
        } else {
          console.log(`  ✅ ${table}: OK`);
        }
      } catch (err) {
        console.log(`  ❌ ${table}: ${err.message}`);
      }
    }

    // 2. Probar APIs de autenticación
    console.log('\n🔐 2. PROBANDO APIs DE AUTENTICACIÓN...');
    console.log('=======================================');
    
    const baseUrl = 'http://localhost:3000';
    
    // Test de registro
    console.log('\n📝 Probando registro...');
    const registerData = {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.test@example.com',
      birthDate: '1990-01-01',
      password: 'password123',
      confirmPassword: 'password123',
      termsAccepted: true
    };
    
    try {
      const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      });
      
      const registerResult = await registerResponse.json();
      
      if (registerResponse.ok) {
        console.log('  ✅ Registro exitoso');
        console.log(`     Usuario ID: ${registerResult.user?.id}`);
      } else {
        console.log(`  ⚠️  Registro falló: ${registerResult.error}`);
      }
    } catch (err) {
      console.log(`  ❌ Error en registro: ${err.message}`);
    }
    
    // Test de login
    console.log('\n🔑 Probando login...');
    const loginData = {
      email: 'juan.test@example.com',
      password: 'password123',
      rememberMe: false
    };
    
    try {
      const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      const loginResult = await loginResponse.json();
      
      if (loginResponse.ok) {
        console.log('  ✅ Login exitoso');
        console.log(`     Token: ${loginResult.session?.token?.substring(0, 20)}...`);
      } else {
        console.log(`  ⚠️  Login falló: ${loginResult.error}`);
      }
    } catch (err) {
      console.log(`  ❌ Error en login: ${err.message}`);
    }
    
    // Test de forgot password
    console.log('\n🔄 Probando forgot password...');
    const forgotData = {
      email: 'juan.test@example.com'
    };
    
    try {
      const forgotResponse = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(forgotData)
      });
      
      const forgotResult = await forgotResponse.json();
      
      if (forgotResponse.ok) {
        console.log('  ✅ Forgot password exitoso');
        if (forgotResult.token) {
          console.log(`     Token de reseteo: ${forgotResult.token.substring(0, 20)}...`);
        }
      } else {
        console.log(`  ⚠️  Forgot password falló: ${forgotResult.error}`);
      }
    } catch (err) {
      console.log(`  ❌ Error en forgot password: ${err.message}`);
    }

    // 3. Verificar datos en base de datos
    console.log('\n📊 3. VERIFICANDO DATOS EN BD...');
    console.log('=================================');
    
    // Verificar usuario creado
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at')
      .eq('email', 'juan.test@example.com');
    
    if (usersError) {
      console.log(`  ❌ Error obteniendo usuarios: ${usersError.message}`);
    } else if (users && users.length > 0) {
      console.log(`  ✅ Usuario encontrado: ${users[0].first_name} ${users[0].last_name}`);
      
      // Verificar perfil automático
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', users[0].id)
        .single();
      
      if (profileError) {
        console.log(`  ❌ Error obteniendo perfil: ${profileError.message}`);
      } else {
        console.log('  ✅ Perfil creado automáticamente');
      }
      
      // Verificar estadísticas automáticas
      const { data: stats, error: statsError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', users[0].id)
        .single();
      
      if (statsError) {
        console.log(`  ❌ Error obteniendo estadísticas: ${statsError.message}`);
      } else {
        console.log('  ✅ Estadísticas creadas automáticamente');
      }
    } else {
      console.log('  ⚠️  No se encontró el usuario de prueba');
    }

    console.log('\n✅ Pruebas completadas!');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error);
  }
}

testAuthSystem(); 