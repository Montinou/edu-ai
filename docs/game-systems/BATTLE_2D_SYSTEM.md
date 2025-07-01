# Sistema de Batalla 2D - EduCard AI

## Descripción General

El Sistema de Batalla 2D es una implementación de combate por turnos donde los jugadores usan cartas educativas para enfrentarse contra una IA. Cada carta requiere resolver un problema matemático o lógico para ser jugada, combinando aprendizaje con estrategia.

## Características Principales

### 🎮 Mecánicas de Juego

- **Combate por Turnos**: Los jugadores alternan turnos con la IA
- **Desafío Educativo**: Cada carta requiere resolver un problema para ser jugada
- **Sistema de HP**: Tanto el jugador como la IA tienen puntos de vida
- **Colección Personal**: Los jugadores usan cartas de su colección personal

### ⚔️ Flujo de Batalla

1. **Inicialización**: Se cargan las cartas del jugador y cartas aleatorias para la IA
2. **Turno del Jugador**: 
   - Selecciona una carta de su mano
   - Resuelve el problema matemático/lógico
   - Si es correcto: la carta ataca al enemigo
   - Si es incorrecto: el jugador recibe daño
3. **Turno de la IA**: La IA juega una carta aleatoria automáticamente
4. **Repetir** hasta que uno de los combatientes llegue a 0 HP

### 🃏 Sistema de Cartas

#### Tipos de Cartas
- **Math**: Cartas con problemas matemáticos (suma, resta, multiplicación, división)
- **Logic**: Cartas con problemas lógicos (patrones, secuencias)

#### Atributos de Cartas
- **Poder**: Daño que inflige la carta
- **Costo**: Recursos necesarios para jugar la carta
- **Rareza**: common, rare, epic, legendary
- **Tipo**: math, logic, special, defense

### 📊 Sistema de Problemas

Los problemas se generan dinámicamente basándose en:
- **Operaciones básicas**: +, -, ×, ÷
- **Números aleatorios**: 1-10 para operaciones básicas
- **Opciones múltiples**: 4 opciones de respuesta
- **Tiempo límite**: 30 segundos por problema

## Arquitectura Técnica

### Componentes Principales

#### `BattleField2D.tsx`
Componente principal que maneja toda la lógica de batalla:

```typescript
interface BattleState {
  player: Player;
  enemy: Player;
  currentTurn: 'player' | 'enemy';
  turnCount: number;
  phase: 'preparation' | 'battle' | 'resolution' | 'ended';
  winner: string | null;
}
```

#### Subcomponentes
- **HandCard**: Cartas en la mano del jugador
- **PlayerFieldCard**: Cartas en el campo del jugador
- **EnemyFieldCard**: Cartas en el campo del enemigo
- **ProblemChallenge**: Modal para resolver problemas

### Base de Datos

#### Tabla `user_cards`
Relación 1:N entre usuarios y cartas:

```sql
CREATE TABLE user_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_id UUID REFERENCES cards(id),
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_upgraded BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  UNIQUE(user_id, card_id)
);
```

### Servicios

#### `databaseService.ts`
Métodos relacionados con la colección de cartas:

- `getUserCardsForBattle(userId)`: Obtiene cartas del usuario para batalla
- `ensureUserHasCards(userId)`: Garantiza que el usuario tenga cartas
- `giveStarterCards(userId)`: Otorga cartas iniciales a nuevos usuarios
- `addCardToUserById(userId, cardId)`: Agrega una carta específica al usuario

## Sistema de Colección

### Cartas Iniciales
Los nuevos usuarios reciben automáticamente 5 cartas básicas:
1. **Suma Básica** (común) - 15 poder, 2 costo
2. **Resta Simple** (común) - 12 poder, 2 costo  
3. **Multiplicación x2** (común) - 18 poder, 3 costo
4. **División Básica** (común) - 14 poder, 2 costo
5. **Números Pares** (común) - 16 poder, 2 costo

### Progresión
- Los jugadores obtienen nuevas cartas al completar batallas
- Las cartas pueden subir de nivel con el uso
- Sistema de experiencia por carta individual

## UI/UX

### Diseño Visual
- **Fondo**: Gradiente espacial púrpura-azul-índigo
- **Efectos**: Partículas flotantes animadas
- **Cards**: Diseño estilo Magic: The Gathering
- **Animaciones**: Framer Motion para transiciones suaves

### Layout de Batalla
```
┌─────────────────────────────────────┐
│ Enemy HP Bar        Turn Info       │
├─────────────────────────────────────┤
│ Enemy Field (cartas jugadas)        │
├─────────────────────────────────────┤
│ Battle Center (acciones)            │
├─────────────────────────────────────┤
│ Player Field (cartas jugadas)       │
├─────────────────────────────────────┤
│ Player HP | Player Hand (cartas)    │
└─────────────────────────────────────┘
```

## Estados del Juego

### Fases de Batalla
1. **Preparation**: Inicializando datos
2. **Battle**: Combate activo
3. **Resolution**: Procesando resultados
4. **Ended**: Batalla terminada

### Condiciones de Victoria
- **Victoria**: HP del enemigo llega a 0
- **Derrota**: HP del jugador llega a 0
- **Empate**: Ambos llegan a 0 simultáneamente

## Navegación

### Acceso al Sistema
- **Dashboard**: Botón "⚔️ Batalla 2D"
- **URL**: `/battle-2d`
- **Prerrequisitos**: Usuario autenticado

### Integración
- Compatible con el sistema de autenticación existente
- Usa la misma base de datos de cartas que `/card-revolution`
- Integrado con el sistema de colección de usuarios

## Futuras Mejoras

### Características Planificadas
- [ ] Sistema de recompensas por victoria
- [ ] Diferentes tipos de enemigos IA
- [ ] Modo multijugador
- [ ] Torneos y clasificaciones
- [ ] Cartas especiales con efectos únicos
- [ ] Sistema de mazos personalizados
- [ ] Logros y estadísticas detalladas

### Optimizaciones Técnicas
- [ ] Cache de cartas del usuario
- [ ] Generación de problemas más sofisticada
- [ ] Análisis de rendimiento del jugador
- [ ] Dificultad adaptiva basada en historial

## Troubleshooting

### Problemas Comunes

**Usuario sin cartas**:
- El sistema automáticamente otorga cartas iniciales
- Fallback a cartas aleatorias de la base de datos

**Errores de carga**:
- Múltiples niveles de fallback implementados
- Manejo de errores con mensajes informativos

**Problemas de tipos TypeScript**:
- Interfaces bien definidas para todos los estados
- Casting seguro cuando es necesario

## Contribución

Para agregar nuevas funcionalidades al sistema de batalla:

1. Modifica `BattleField2D.tsx` para la lógica principal
2. Actualiza `databaseService.ts` para nuevos métodos de datos
3. Agrega nuevos tipos en `/types/cards.ts` si es necesario
4. Actualiza esta documentación

## Dependencias

- **React 18**: Framework base
- **Next.js 14**: Routing y SSR
- **Framer Motion**: Animaciones
- **Lucide React**: Iconos
- **Supabase**: Base de datos
- **Tailwind CSS**: Estilos 