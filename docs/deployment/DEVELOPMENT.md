# Guía de Desarrollo - EduCard AI

## 🚀 Configuración del Entorno de Desarrollo

### Prerrequisitos

- **Node.js**: 18.0.0 o superior
- **npm**: 8.0.0 o superior
- **Git**: Para control de versiones
- **Editor**: VS Code recomendado con extensiones de TypeScript y React

### Instalación Inicial

```bash
# 1. Clonar el repositorio
git clone [repository-url]
cd ia-education-platform

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus claves de API

# 4. Ejecutar en modo desarrollo
npm run dev
```

### Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Supabase (Base de datos y autenticación)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI (Servicio principal de IA)
OPENAI_API_KEY=your_openai_api_key

# Anthropic (Servicio de respaldo de IA - opcional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# Configuración de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Configuración de IA
AI_MODEL_MATH=gpt-4
AI_MODEL_LOGIC=gpt-4
AI_MODEL_TUTORING=gpt-4
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# Rate limiting
AI_REQUESTS_PER_MINUTE=60
AI_REQUESTS_PER_HOUR=1000
AI_REQUESTS_PER_DAY=10000

# Configuración de desarrollo
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_SHOW_PERFORMANCE_METRICS=true
```

### Configuración de Supabase

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia la URL y las claves de API

2. **Configurar base de datos**:
   ```sql
   -- Ejecutar en el SQL Editor de Supabase
   
   -- Tabla de usuarios
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users ON DELETE CASCADE,
     name TEXT NOT NULL,
     age INTEGER,
     grade INTEGER,
     parent_email TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     PRIMARY KEY (id)
   );

   -- Tabla de progreso del jugador
   CREATE TABLE player_progress (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     current_level INTEGER DEFAULT 1,
     total_xp INTEGER DEFAULT 0,
     battles_won INTEGER DEFAULT 0,
     battles_lost INTEGER DEFAULT 0,
     current_streak INTEGER DEFAULT 0,
     best_streak INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabla de cartas
   CREATE TABLE cards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     type TEXT NOT NULL,
     rarity TEXT NOT NULL,
     power INTEGER NOT NULL,
     cost INTEGER NOT NULL,
     problem_data JSONB NOT NULL,
     artwork_data JSONB,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Tabla de colección de cartas del usuario
   CREATE TABLE user_cards (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
     card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
     unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     times_used INTEGER DEFAULT 0,
     success_rate DECIMAL DEFAULT 0,
     UNIQUE(user_id, card_id)
   );

   -- Habilitar RLS (Row Level Security)
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

   -- Políticas de seguridad
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);
   ```

### Configuración de OpenAI

1. **Obtener API Key**:
   - Ve a [platform.openai.com](https://platform.openai.com)
   - Crea una cuenta y genera una API key
   - Añade créditos a tu cuenta

2. **Configurar límites**:
   - Establece límites de uso mensual
   - Configura alertas de uso

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linter
npm run type-check      # Verificación de tipos

# Testing
npm run test            # Tests unitarios
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Reporte de cobertura
npx playwright test     # Tests E2E

# Utilidades
npm run clean           # Limpiar cache y builds
npm run analyze         # Análisis del bundle
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── game/              # Módulo de juego
│   ├── collection/        # Colección de cartas
│   ├── profile/           # Perfil del usuario
│   ├── api/               # API Routes
│   │   ├── ai/            # Endpoints de IA
│   │   ├── game/          # Endpoints del juego
│   │   ├── cards/         # Endpoints de cartas
│   │   └── auth/          # Endpoints de autenticación
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes reutilizables
│   ├── cards/            # Componentes de cartas
│   │   ├── Card3D.tsx    # Carta 3D con Three.js
│   │   ├── CardList.tsx  # Lista de cartas
│   │   └── CardDeck.tsx  # Mazo de cartas
│   ├── game/             # Componentes del juego
│   │   ├── BattleField.tsx
│   │   ├── GameUI.tsx
│   │   └── ProblemModal.tsx
│   ├── navigation/       # Navegación
│   │   ├── MobileNav.tsx
│   │   └── Header.tsx
│   └── ui/               # Componentes base
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── LoadingSpinner.tsx
├── lib/                  # Utilidades y configuraciones
│   ├── stores/           # Stores de Zustand
│   │   ├── gameStore.ts
│   │   ├── userStore.ts
│   │   └── cardStore.ts
│   ├── services/         # Servicios
│   │   ├── aiService.ts
│   │   ├── supabase.ts
│   │   └── gameEngine.ts
│   ├── utils/            # Utilidades
│   │   ├── math.ts
│   │   ├── animations.ts
│   │   └── validation.ts
│   └── constants/        # Constantes
├── types/                # Definiciones de TypeScript
│   ├── cards.ts
│   ├── game.ts
│   ├── user.ts
│   ├── ai.ts
│   └── index.ts
├── hooks/                # Custom React hooks
│   ├── useGame.ts
│   ├── useCards.ts
│   └── useAI.ts
└── constants/            # Constantes de la aplicación
    ├── gameConfig.ts
    ├── cardData.ts
    └── uiConstants.ts
```

## 🎨 Guía de Estilos

### Tailwind CSS

El proyecto usa Tailwind CSS con configuración personalizada:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        game: {
          xp: '#10b981',
          energy: '#f59e0b',
          health: '#ef4444',
        }
      },
      animation: {
        'card-hover': 'cardHover 0.3s ease-in-out',
        'battle-attack': 'battleAttack 0.5s ease-out',
      }
    }
  }
}
```

### Convenciones de Naming

- **Componentes**: PascalCase (`Card3D`, `BattleField`)
- **Archivos**: camelCase para utilidades, PascalCase para componentes
- **Variables**: camelCase (`isLoading`, `cardData`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_CARDS_IN_HAND`)
- **CSS Classes**: kebab-case (`card-container`, `battle-field`)

## 🧪 Testing

### Configuración de Jest

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

### Ejemplos de Tests

```typescript
// src/components/cards/__tests__/Card3D.test.tsx
import { render, screen } from '@testing-library/react';
import { Card3D } from '../Card3D';
import { mockCard } from '@/test/mocks';

describe('Card3D', () => {
  it('renders card with correct name', () => {
    render(
      <Card3D
        card={mockCard}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={[1, 1, 1]}
        isHovered={false}
        isSelected={false}
        isAnimating={false}
        onHover={jest.fn()}
        onClick={jest.fn()}
      />
    );
    
    expect(screen.getByText(mockCard.name)).toBeInTheDocument();
  });
});
```

### Tests E2E con Playwright

```typescript
// tests/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete game flow', async ({ page }) => {
  await page.goto('/');
  
  // Iniciar juego
  await page.click('[data-testid="start-game"]');
  
  // Seleccionar carta
  await page.click('[data-testid="card-0"]');
  
  // Resolver problema
  await page.fill('[data-testid="answer-input"]', '42');
  await page.click('[data-testid="submit-answer"]');
  
  // Verificar resultado
  await expect(page.locator('[data-testid="battle-result"]')).toContainText('¡Correcto!');
});
```

## 🚀 Deployment

### Vercel (Recomendado)

1. **Conectar repositorio**:
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Configurar variables de entorno** en el dashboard de Vercel

3. **Configurar dominios** y SSL automático

### Variables de Entorno de Producción

```env
# Producción
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
NEXT_PUBLIC_DEBUG_MODE=false

# Supabase Producción
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# APIs de Producción
OPENAI_API_KEY=your_production_openai_key
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de tipos de Three.js**:
   ```bash
   npm install --save-dev @types/three
   ```

2. **Error de Supabase**:
   - Verificar que las URLs y keys sean correctas
   - Comprobar que RLS esté configurado correctamente

3. **Error de OpenAI**:
   - Verificar que tengas créditos disponibles
   - Comprobar que la API key tenga los permisos correctos

4. **Problemas de performance**:
   - Usar React DevTools Profiler
   - Verificar que las animaciones 3D no estén causando lag
   - Implementar lazy loading para componentes pesados

### Logs y Debugging

```typescript
// Configurar logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Game state:', gameState);
}

// Usar Sentry en producción
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error);
```

## 📚 Recursos Adicionales

- [Next.js Documentation](https://nextjs.org/docs)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)

---

*Para más ayuda, consulta la documentación completa o abre un issue en el repositorio.* 