# Especificaciones Técnicas - MVP

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Styling:** Tailwind CSS + CSS Modules
- **Estado:** React Context + useReducer
- **Persistencia:** localStorage (MVP) → Supabase (futuro)
- **Testing:** Jest + React Testing Library
- **Linting:** ESLint + Prettier

### Estructura de Componentes

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── game/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── profile/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ProgressBar.tsx
│   ├── game/
│   │   ├── GameBoard.tsx
│   │   ├── BattleArea.tsx
│   │   ├── PlayerStats.tsx
│   │   └── EnemyArea.tsx
│   ├── cards/
│   │   ├── MathCard.tsx
│   │   ├── CardDeck.tsx
│   │   └── CardCollection.tsx
│   └── navigation/
│       ├── MobileNav.tsx
│       └── TabBar.tsx
├── lib/
│   ├── game-logic.ts
│   ├── math-problems.ts
│   ├── card-system.ts
│   └── storage.ts
├── types/
│   ├── game.ts
│   ├── cards.ts
│   └── user.ts
└── hooks/
    ├── useGame.ts
    ├── useCards.ts
    └── useLocalStorage.ts
```

## 🎮 Sistema de Juego - Core Logic

### Tipos de Datos Principales

```typescript
// types/game.ts
interface GameState {
  player: Player;
  enemy: Enemy;
  currentTurn: 'player' | 'enemy';
  phase: 'setup' | 'battle' | 'result';
  round: number;
}

interface Player {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  level: number;
  xp: number;
  deck: Card[];
  hand: Card[];
}

interface Enemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  difficulty: number;
  sprite: string;
}
```

```typescript
// types/cards.ts
interface Card {
  id: string;
  type: CardType;
  problem: MathProblem;
  damage: number;
  rarity: 'common' | 'rare' | 'epic';
  unlocked: boolean;
}

interface MathProblem {
  question: string;
  answer: number;
  options?: number[];
  operation: 'addition' | 'subtraction' | 'multiplication' | 'division';
  difficulty: 1 | 2 | 3 | 4 | 5;
}

type CardType = 'attack' | 'defense' | 'special';
```

### Mecánicas de Combate

```typescript
// lib/game-logic.ts
class GameEngine {
  // Resolver problema matemático
  solveProblem(card: Card, answer: number): BattleResult {
    const isCorrect = answer === card.problem.answer;
    const damage = isCorrect ? card.damage : 0;
    const bonus = this.calculateSpeedBonus(timeToAnswer);
    
    return {
      success: isCorrect,
      damage: damage + bonus,
      xpGained: this.calculateXP(isCorrect, card.problem.difficulty)
    };
  }

  // Calcular daño con bonificadores
  calculateDamage(baseDamage: number, timeBonus: number): number {
    // Bonus por velocidad: 10-50% extra
    const speedMultiplier = Math.max(1.1, 1.5 - (timeToAnswer / 10));
    return Math.floor(baseDamage * speedMultiplier);
  }

  // Sistema de progresión
  calculateXP(correct: boolean, difficulty: number): number {
    const baseXP = correct ? 10 : 2;
    return baseXP * difficulty;
  }
}
```

## 📱 Diseño Mobile-First

### Breakpoints
```css
/* tailwind.config.js */
screens: {
  'xs': '375px',   // iPhone SE
  'sm': '640px',   // Tablets pequeñas
  'md': '768px',   // Tablets
  'lg': '1024px',  // Desktop pequeño
  'xl': '1280px',  // Desktop
}
```

### Componentes Responsivos

```typescript
// components/ui/Card.tsx
interface CardProps {
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  problem: MathProblem;
}

const Card: React.FC<CardProps> = ({ size = 'medium', interactive = true, problem }) => {
  return (
    <div className={`
      bg-white rounded-xl shadow-lg border-2 border-blue-200
      ${size === 'small' ? 'w-20 h-28' : ''}
      ${size === 'medium' ? 'w-32 h-44' : ''}
      ${size === 'large' ? 'w-40 h-56' : ''}
      ${interactive ? 'hover:shadow-xl transition-all duration-200 cursor-pointer' : ''}
      touch-manipulation select-none
    `}>
      {/* Contenido de la carta */}
    </div>
  );
};
```

### Navegación Mobile

```typescript
// components/navigation/MobileNav.tsx
const MobileNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16 px-4">
        <NavButton icon="home" label="Inicio" href="/" />
        <NavButton icon="cards" label="Jugar" href="/game" />
        <NavButton icon="collection" label="Cartas" href="/collection" />
        <NavButton icon="profile" label="Perfil" href="/profile" />
      </div>
    </nav>
  );
};
```

## 🎯 Sistema de Generación de Problemas

### Generador de Matemáticas

```typescript
// lib/math-problems.ts
class MathProblemGenerator {
  generateProblem(operation: Operation, difficulty: number): MathProblem {
    switch (operation) {
      case 'addition':
        return this.generateAddition(difficulty);
      case 'subtraction':
        return this.generateSubtraction(difficulty);
      case 'multiplication':
        return this.generateMultiplication(difficulty);
      default:
        return this.generateAddition(1);
    }
  }

  private generateAddition(difficulty: number): MathProblem {
    const ranges = {
      1: { min: 1, max: 10 },
      2: { min: 10, max: 50 },
      3: { min: 50, max: 100 },
      4: { min: 100, max: 500 },
      5: { min: 500, max: 1000 }
    };

    const range = ranges[difficulty];
    const a = this.randomInt(range.min, range.max);
    const b = this.randomInt(range.min, range.max);
    
    return {
      question: `${a} + ${b} = ?`,
      answer: a + b,
      operation: 'addition',
      difficulty,
      options: this.generateOptions(a + b, 4)
    };
  }

  private generateOptions(correct: number, count: number): number[] {
    const options = [correct];
    while (options.length < count) {
      const variation = this.randomInt(-10, 10);
      const option = correct + variation;
      if (option > 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    return this.shuffle(options);
  }
}
```

## 💾 Persistencia de Datos

### LocalStorage para MVP

```typescript
// lib/storage.ts
interface GameData {
  player: Player;
  unlockedCards: string[];
  gameProgress: GameProgress;
  settings: UserSettings;
}

class LocalStorageManager {
  private readonly STORAGE_KEY = 'ia-education-game';

  saveGameData(data: GameData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving game data:', error);
    }
  }

  loadGameData(): GameData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading game data:', error);
      return null;
    }
  }

  clearGameData(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
```

## 🎨 Sistema de Temas y Estilos

### Configuración de Tailwind

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
          600: '#2563eb',
          700: '#1d4ed8',
        },
        game: {
          hp: '#ef4444',
          xp: '#10b981',
          energy: '#f59e0b',
        }
      },
      fontFamily: {
        game: ['Comic Neue', 'cursive'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-fast': 'pulse 1s infinite',
      }
    },
  },
  plugins: [],
};
```

## 🧪 Testing Strategy

### Estructura de Tests

```typescript
// __tests__/game-logic.test.ts
describe('GameEngine', () => {
  let gameEngine: GameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
  });

  test('should calculate correct damage for right answer', () => {
    const card = createMockCard({ damage: 10 });
    const result = gameEngine.solveProblem(card, card.problem.answer);
    
    expect(result.success).toBe(true);
    expect(result.damage).toBeGreaterThanOrEqual(10);
  });

  test('should give no damage for wrong answer', () => {
    const card = createMockCard({ damage: 10 });
    const result = gameEngine.solveProblem(card, card.problem.answer + 1);
    
    expect(result.success).toBe(false);
    expect(result.damage).toBe(0);
  });
});
```

## 🚀 Performance Optimizations

### Lazy Loading y Code Splitting

```typescript
// app/game/page.tsx
import dynamic from 'next/dynamic';

const GameBoard = dynamic(() => import('@/components/game/GameBoard'), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});

const CardCollection = dynamic(() => import('@/components/cards/CardCollection'), {
  loading: () => <div>Cargando cartas...</div>
});
```

### Optimización de Imágenes

```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['assets.game.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  }
};
```

## 📊 Métricas y Analytics (Futuro)

### Eventos a Trackear

```typescript
interface GameEvent {
  type: 'problem_solved' | 'battle_won' | 'level_up' | 'card_unlocked';
  timestamp: number;
  data: {
    difficulty?: number;
    timeToSolve?: number;
    accuracy?: number;
    level?: number;
  };
}

class AnalyticsManager {
  trackEvent(event: GameEvent): void {
    // Implementación futura con analytics provider
    console.log('Event tracked:', event);
  }
}
```

---

## 🎯 Prioridades de Implementación

### Sprint 1 (Semana 1-2)
1. Setup del proyecto Next.js + TypeScript
2. Configuración de Tailwind CSS
3. Componentes UI básicos (Button, Card, Modal)
4. Navegación mobile básica

### Sprint 2 (Semana 3-4)
1. Sistema de cartas matemáticas básico
2. Generador de problemas simples
3. Mecánica de combate core
4. Persistencia con localStorage

### Sprint 3 (Semana 5-6)
1. Sistema de progresión (XP, niveles)
2. Colección de cartas
3. Feedback visual y animaciones básicas
4. Testing inicial con usuarios

---

*Especificaciones técnicas para desarrollo iterativo y escalable* 