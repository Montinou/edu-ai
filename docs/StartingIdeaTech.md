# Especificación Técnica - Plataforma Educativa con IA

## 📋 Información del Proyecto

**Nombre:** EduCard AI (nombre provisional)  
**Versión:** 1.0.0  
**Tipo:** Progressive Web Application (PWA)  
**Target:** Niños 8-12 años  
**Plataformas:** Web (responsive), PWA mobile  

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico Principal

```
Frontend: React 18+ + TypeScript + Next.js 14
UI Framework: Tailwind CSS + Headless UI
3D Graphics: Three.js + React Three Fiber
Animation: Framer Motion + GSAP
State Management: Zustand + React Query
Testing: Vitest + React Testing Library + Playwright
Build Tool: Next.js (with Turbopack)
```

### Backend y Servicios

```
Runtime: Node.js 18+
Framework: Next.js API Routes / Express.js
Database: Supabase (PostgreSQL)
Authentication: Supabase Auth
File Storage: Supabase Storage
AI APIs: OpenAI GPT-4, Anthropic Claude, Replicate (imágenes)
Payments: Stripe (futuro)
Analytics: Vercel Analytics + Custom events
```

### DevOps y Deployment

```
Hosting: Vercel (frontend + API routes)
CDN: Vercel Edge Network
Database: Supabase Cloud
Monitoring: Sentry + Vercel Monitoring
CI/CD: GitHub Actions
Version Control: Git + GitHub
```

## 🎮 Arquitectura de Componentes Core

### Sistema de Cartas

```typescript
interface Card {
  id: string;
  type: 'math' | 'logic' | 'special' | 'defense';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  name: string;
  description: string;
  power: number;
  cost: number;
  problem: MathProblem | LogicProblem;
  effects: CardEffect[];
  artwork: {
    image: string;
    animation?: string;
    particles?: ParticleConfig;
  };
}

interface MathProblem {
  question: string;
  answer: number | string;
  type: 'addition' | 'subtraction' | 'multiplication' | 'division' | 'fractions';
  difficulty: 1 | 2 | 3 | 4 | 5;
  hints: string[];
  explanation: string;
}

interface LogicProblem {
  question: string;
  type: 'pattern' | 'deduction' | 'classification' | 'strategy';
  answer: string | number | string[];
  options?: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
}
```

### Sistema de Combate

```typescript
interface GameState {
  player: Player;
  enemy: Enemy;
  turn: 'player' | 'enemy';
  phase: 'draw' | 'play' | 'resolve';
  playerHand: Card[];
  playerDeck: Card[];
  activeEffects: Effect[];
  combatLog: CombatAction[];
}

interface Player {
  id: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  deck: Card[];
  collection: Card[];
  stats: PlayerStats;
}

interface CombatAction {
  type: 'play_card' | 'solve_problem' | 'apply_damage' | 'use_effect';
  cardId?: string;
  problemResult?: ProblemResult;
  damage?: number;
  timestamp: Date;
}
```

### Sistema de IA

```typescript
interface AIService {
  generateMathProblem(difficulty: number, type: string): Promise<MathProblem>;
  generateLogicProblem(difficulty: number, type: string): Promise<LogicProblem>;
  validatePrompt(prompt: string, expectedResult: string): Promise<PromptValidation>;
  provideTutoring(problem: Problem, studentAnswer: string): Promise<TutoringResponse>;
  generateStoryElement(context: string, age: number): Promise<StoryElement>;
}

interface PromptValidation {
  isValid: boolean;
  score: number; // 0-100
  feedback: string;
  suggestions: string[];
}

interface TutoringResponse {
  hint: string;
  explanation: string;
  encouragement: string;
  nextSteps: string[];
}
```

## 🎨 Renderizado y Gráficos

### Three.js Integration

```typescript
// Card3D Component Structure
interface Card3DProps {
  card: Card;
  position: [number, number, number];
  rotation: [number, number, number];
  isHovered: boolean;
  isSelected: boolean;
  onHover: () => void;
  onClick: () => void;
}

// Shader Configuration for Card Effects
interface CardShaderConfig {
  holographic: boolean;
  rarity: CardRarity;
  glowIntensity: number;
  particleCount: number;
  animationSpeed: number;
}
```

### Performance Considerations

```typescript
// LOD System for cards
interface LODConfig {
  high: {
    maxCards: 10;
    particleCount: 1000;
    shaderComplexity: 'high';
  };
  medium: {
    maxCards: 20;
    particleCount: 500;
    shaderComplexity: 'medium';
  };
  low: {
    maxCards: 50;
    particleCount: 100;
    shaderComplexity: 'low';
  };
}
```

## 📊 Base de Datos - Schema

### Tablas Principales

```sql
-- Users and Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    username VARCHAR(50) UNIQUE,
    age INTEGER,
    parent_email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Player Progress
CREATE TABLE player_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    current_world INTEGER DEFAULT 1,
    completed_levels JSON,
    stats JSON,
    preferences JSON
);

-- Card Collection
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    card_id VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT NOW()
);

-- Game Sessions
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    session_type VARCHAR(50),
    start_time TIMESTAMP DEFAULT NOW(),
    end_time TIMESTAMP,
    result JSON,
    problems_solved INTEGER,
    accuracy_rate DECIMAL(5,2),
    xp_gained INTEGER
);

-- Learning Analytics
CREATE TABLE learning_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(100),
    problem_type VARCHAR(50),
    difficulty INTEGER,
    correct BOOLEAN,
    time_taken INTEGER,
    hint_used BOOLEAN,
    ai_help_used BOOLEAN,
    timestamp TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Seguridad y Privacidad

### Autenticación

```typescript
// Supabase Auth Configuration
const supabaseConfig = {
  auth: {
    providers: ['email'],
    redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback`,
    persistSession: true,
  },
  realtime: {
    enabled: false // Disabled for better security
  }
};

// Parental Controls
interface ParentalSettings {
  aiInteractionLevel: 'supervised' | 'guided' | 'free';
  sessionTimeLimit: number; // minutes
  dailyTimeLimit: number; // minutes
  allowDataCollection: boolean;
  progressReports: 'daily' | 'weekly' | 'monthly';
}
```

### Privacidad de Datos

```typescript
// Data anonymization for analytics
interface AnonymizedEvent {
  sessionId: string; // Hashed
  eventType: string;
  timestamp: Date;
  metadata: {
    ageGroup: '8-9' | '10-11' | '12+';
    difficultyLevel: number;
    success: boolean;
  };
  // No personal identifiers
}
```

## 🚀 Performance y Optimización

### Lazy Loading Strategy

```typescript
// Code splitting configuration
const LazyGameBoard = lazy(() => import('./components/GameBoard'));
const LazyCardCollection = lazy(() => import('./components/CardCollection'));
const Lazy3DEffects = lazy(() => import('./components/3DEffects'));

// Resource loading priorities
const resourcePriority = {
  critical: ['game-logic', 'basic-ui', 'math-engine'],
  high: ['card-assets', 'audio'],
  medium: ['3d-effects', 'particles'],
  low: ['advanced-shaders', 'decorative-animations']
};
```

### Caching Strategy

```typescript
// Service Worker for offline functionality
const cacheStrategy = {
  static: {
    cacheName: 'educard-static-v1',
    resources: ['/game', '/cards', '/audio/basic'],
    strategy: 'cacheFirst'
  },
  dynamic: {
    cacheName: 'educard-dynamic-v1',
    resources: ['/api/problems', '/api/progress'],
    strategy: 'networkFirst'
  },
  ai: {
    cacheName: 'educard-ai-v1',
    resources: ['/api/ai/*'],
    strategy: 'networkOnly' // Always fresh AI responses
  }
};
```

## 📱 Responsive Design y PWA

### Breakpoint Strategy

```css
/* Mobile First Approach */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }

/* Game-specific responsive rules */
.card-grid {
  grid-template-columns: repeat(2, 1fr); /* mobile */
}

@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr); /* tablet */
  }
}

@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(6, 1fr); /* desktop */
  }
}
```

### PWA Configuration

```typescript
// next.config.js PWA setup
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.openai\.com/,
      handler: 'NetworkOnly',
    },
    {
      urlPattern: /\/api\/cards/,
      handler: 'StaleWhileRevalidate',
    }
  ]
});
```

## 🧪 Testing Strategy

### Unit Testing

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})

// Card logic testing
describe('Card Combat System', () => {
  test('should calculate damage correctly for math problems', () => {
    const card = createMockCard({ power: 50, type: 'math' });
    const result = { correct: true, timeBonus: true };
    
    expect(calculateDamage(card, result)).toBe(60); // 50 + 20% bonus
  });
  
  test('should handle incorrect answers gracefully', () => {
    const card = createMockCard({ power: 50 });
    const result = { correct: false };
    
    expect(calculateDamage(card, result)).toBe(12.5); // 25% of power
  });
});
```

### Integration Testing

```typescript
// AI Service testing
describe('AI Integration', () => {
  test('should generate appropriate math problems', async () => {
    const problem = await aiService .generateMathProblem(2, 'addition');
    
    expect(problem).toHaveProperty('question');
    expect(problem).toHaveProperty('answer');
    expect(problem.difficulty).toBe(2);
  });
});
```

### E2E Testing

```typescript
// Playwright configuration
test('complete game flow', async ({ page }) => {
  await page.goto('/game');
  
  // Start game
  await page.click('[data-testid="start-game"]');
  
  // Play a card
  await page.click('[data-testid="card-0"]');
  
  // Solve problem
  await page.fill('[data-testid="answer-input"]', '42');
  await page.click('[data-testid="submit-answer"]');
  
  // Verify result
  await expect(page.locator('[data-testid="combat-result"]')).toContainText('Correct!');
});
```

## 📈 Analytics y Métricas

### Learning Analytics

```typescript
interface LearningMetrics {
  problemsSolved: number;
  accuracyRate: number;
  averageTimePerProblem: number;
  difficultyCurve: DifficultyProgress[];
  conceptMastery: ConceptMastery[];
  engagementScore: number;
  retentionRate: number;
}

interface DifficultyProgress {
  level: number;
  attemptsCount: number;
  successRate: number;
  averageTime: number;
}
```

### Performance Monitoring

```typescript
// Custom performance tracking
const performanceMonitor = {
  trackRenderTime: (componentName: string) => void,
  trackInteractionLatency: (action: string) => void,
  trackMemoryUsage: () => void,
  trackBatteryImpact: () => void, // PWA specific
};
```

## 🔧 Configuración de Desarrollo

### Environment Variables

```bash
# Development
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
REPLICATE_API_TOKEN=your_replicate_token

# Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
SENTRY_DSN=your_sentry_dsn

# Feature Flags
NEXT_PUBLIC_ENABLE_3D_EFFECTS=true
NEXT_PUBLIC_ENABLE_MULTIPLAYER=false
NEXT_PUBLIC_DEBUG_MODE=false
```

### Development Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "lint": "eslint . --fix",
    "type-check": "tsc --noEmit",
    "analyze": "cross-env ANALYZE=true next build"
  }
}
```

## 🚀 Deployment y CI/CD

### Vercel Deployment Workflow

```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test
      - run: npm run type-check

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          # Vercel auto-deploys on push to main
```

---

**Versión del documento:** 1.0  
**Última actualización:** 2025-05-26  
**Próxima revisión:** Después del MVP