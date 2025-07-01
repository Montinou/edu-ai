# Wireframes y Flujos de Usuario - MVP

## 📱 Diseño Mobile-First

### Principios de Diseño
- **Touch-friendly:** Botones mínimo 44px de altura
- **Thumb-zone:** Elementos importantes en zona accesible con pulgar
- **Visual hierarchy:** Información importante más prominente
- **Feedback inmediato:** Respuesta visual a todas las interacciones
- **Simplicidad:** Una acción principal por pantalla

## 🗺️ Flujo Principal de Usuario

```
Splash Screen → Menú Principal → Selección de Nivel → Combate → Resultado → Progreso
     ↓              ↓              ↓              ↓         ↓         ↓
  Loading...    [Jugar]        [Nivel 1]     [Batalla]  [Victoria]  [XP +50]
                [Cartas]       [Nivel 2]     [Cartas]   [Derrota]   [Nivel Up]
                [Perfil]       [Nivel 3]     [Enemigo]  [Retry]     [Nueva Carta]
```

## 📱 Pantallas Principales

### 1. Splash Screen / Loading
```
┌─────────────────────────┐
│                         │
│    🎓 IA Education      │
│                         │
│    [Loading spinner]    │
│                         │
│   "Cargando aventura"   │
│                         │
└─────────────────────────┘
```

**Elementos:**
- Logo/título centrado
- Spinner de carga
- Mensaje motivacional
- Duración: 2-3 segundos máximo

### 2. Menú Principal
```
┌─────────────────────────┐
│  ⚙️                🏆   │
│                         │
│    👋 ¡Hola, Alex!      │
│    Nivel 3 • 250 XP     │
│                         │
│  ┌─────────────────┐    │
│  │   🎮 JUGAR      │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │   🃏 MIS CARTAS │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │   📊 PROGRESO   │    │
│  └─────────────────┘    │
│                         │
│ ────────────────────────│
│ 🏠  🎮  🃏  👤         │
└─────────────────────────┘
```

**Elementos:**
- Header con configuración y logros
- Saludo personalizado con stats básicos
- 3 botones principales (grandes, touch-friendly)
- Navegación bottom tab
- Colores vibrantes pero no saturados

### 3. Selección de Nivel
```
┌─────────────────────────┐
│  ← Volver              │
│                         │
│   🏫 Academia Elemental │
│                         │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ 1 │ │ 2 │ │ 3 │     │
│  │⭐⭐│ │⭐⭐│ │ ? │     │
│  └───┘ └───┘ └───┘     │
│                         │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ 4 │ │ 5 │ │ 6 │     │
│  │ ? │ │ ? │ │ ? │     │
│  └───┘ └───┘ └───┘     │
│                         │
│   Próximo: Suma hasta 20│
│                         │
│ ────────────────────────│
│ 🏠  🎮  🃏  👤         │
└─────────────────────────┘
```

**Elementos:**
- Breadcrumb navigation
- Título del mundo/academia
- Grid de niveles (3x2 para mobile)
- Indicadores de progreso (estrellas)
- Preview del próximo desafío
- Niveles bloqueados visualmente diferenciados

### 4. Pantalla de Combate
```
┌─────────────────────────┐
│ ❤️ 80/100    🔥 Enemigo │
│                         │
│      ┌─────────┐        │
│      │ 👹      │        │
│      │ Goblin  │        │
│      │ HP: 60  │        │
│      └─────────┘        │
│                         │
│   Tu turno: Elige carta │
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 5+3 │ │ 8-2 │ │ 4×2 │ │
│ │ =?  │ │ =?  │ │ =?  │ │
│ │ ⚔️8 │ │ ⚔️6 │ │⚔️12│ │
│ └─────┘ └─────┘ └─────┘ │
│                         │
│ ────────────────────────│
│ 🏠  🎮  🃏  👤         │
└─────────────────────────┘
```

**Elementos:**
- Stats del jugador (HP visible)
- Área del enemigo con sprite y HP
- Indicador de turno claro
- 3 cartas en mano (máximo para mobile)
- Cada carta muestra: problema, daño potencial
- Feedback visual del estado del combate

### 5. Modal de Problema Matemático
```
┌─────────────────────────┐
│                         │
│    Resuelve el problema │
│                         │
│        5 + 3 = ?        │
│                         │
│     ┌─────────────┐     │
│     │     8       │     │
│     └─────────────┘     │
│                         │
│  ┌───┐ ┌───┐ ┌───┐     │
│  │ 6 │ │ 8 │ │10 │     │
│  └───┘ └───┘ └───┘     │
│                         │
│      ⏱️ 00:15           │
│                         │
│   [Confirmar Respuesta] │
│                         │
└─────────────────────────┘
```

**Elementos:**
- Problema matemático grande y claro
- Input numérico o botones de opción múltiple
- Timer visible (crea urgencia pero no presión)
- Botón de confirmación prominente
- Diseño limpio sin distracciones

### 6. Resultado de Combate
```
┌─────────────────────────┐
│                         │
│      🎉 ¡VICTORIA!      │
│                         │
│    ┌─────────────┐      │
│    │ +50 XP      │      │
│    │ +1 Carta    │      │
│    │ Tiempo: 2:30│      │
│    └─────────────┘      │
│                         │
│   Nueva carta desbloq:  │
│    ┌─────────────┐      │
│    │   7 × 2 = ? │      │
│    │   Daño: 15  │      │
│    └─────────────┘      │
│                         │
│  [Continuar] [Repetir]  │
│                         │
└─────────────────────────┘
```

**Elementos:**
- Celebración visual clara
- Resumen de recompensas
- Preview de nuevas cartas/contenido
- Opciones de continuar o repetir
- Estadísticas del combate

### 7. Colección de Cartas
```
┌─────────────────────────┐
│  ← Volver    🔍 Buscar  │
│                         │
│   📚 Mi Colección (12)  │
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 2+3 │ │ 5-1 │ │ 3×4 │ │
│ │ =5  │ │ =4  │ │=12  │ │
│ │ ⚔️5 │ │ ⚔️4 │ │⚔️12│ │
│ └─────┘ └─────┘ └─────┘ │
│                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │ 8÷2 │ │ 6+7 │ │ ??? │ │
│ │ =4  │ │=13  │ │ ??? │ │
│ │ ⚔️8 │ │⚔️13│ │ 🔒  │ │
│ └─────┘ └─────┘ └─────┘ │
│                         │
│ ────────────────────────│
│ 🏠  🎮  🃏  👤         │
└─────────────────────────┘
```

**Elementos:**
- Header con navegación y búsqueda
- Contador de cartas desbloqueadas
- Grid 3x2 de cartas
- Cartas bloqueadas visualmente diferenciadas
- Información básica de cada carta visible

### 8. Perfil de Usuario
```
┌─────────────────────────┐
│  ⚙️ Configuración       │
│                         │
│    👤 Alex              │
│    Nivel 3 • 250/300 XP│
│                         │
│  ┌─────────────────────┐│
│  │ ████████░░ 80%      ││
│  └─────────────────────┘│
│                         │
│  📊 Estadísticas:       │
│  • Combates ganados: 15│
│  • Precisión: 85%      │
│  • Tiempo promedio: 45s│
│  • Racha actual: 3     │
│                         │
│  🏆 Logros recientes:   │
│  • Primera victoria    │
│  • 10 problemas seguidos│
│                         │
│ ────────────────────────│
│ 🏠  🎮  🃏  👤         │
└─────────────────────────┘
```

**Elementos:**
- Header con acceso a configuración
- Avatar y stats principales
- Barra de progreso visual
- Estadísticas clave para motivación
- Sistema de logros simple
- Información digestible para niños

## 🎨 Sistema de Colores Mobile

### Paleta Principal
```css
/* Colores primarios */
--primary-blue: #3B82F6;    /* Botones principales */
--primary-green: #10B981;   /* Éxito, XP */
--primary-red: #EF4444;     /* HP, errores */
--primary-yellow: #F59E0B;  /* Advertencias, energía */

/* Colores de fondo */
--bg-primary: #F8FAFC;      /* Fondo principal */
--bg-secondary: #E2E8F0;    /* Fondo secundario */
--bg-card: #FFFFFF;         /* Fondo de cartas */

/* Colores de texto */
--text-primary: #1E293B;    /* Texto principal */
--text-secondary: #64748B;  /* Texto secundario */
--text-muted: #94A3B8;      /* Texto deshabilitado */
```

### Estados de Interacción
```css
/* Estados touch */
--touch-active: rgba(59, 130, 246, 0.1);
--touch-hover: rgba(59, 130, 246, 0.05);
--disabled: rgba(148, 163, 184, 0.5);
```

## 📐 Especificaciones de Layout

### Espaciado
- **Padding contenedor:** 16px (1rem)
- **Margin entre elementos:** 12px (0.75rem)
- **Padding botones:** 12px vertical, 24px horizontal
- **Border radius:** 8px (componentes), 12px (cartas)

### Tipografía
```css
/* Tamaños de fuente mobile */
--text-xs: 12px;    /* Metadatos */
--text-sm: 14px;    /* Texto secundario */
--text-base: 16px;  /* Texto principal */
--text-lg: 18px;    /* Subtítulos */
--text-xl: 20px;    /* Títulos */
--text-2xl: 24px;   /* Títulos principales */
--text-3xl: 30px;   /* Headers */
```

### Componentes Touch
```css
/* Tamaños mínimos touch */
--touch-target: 44px;       /* Mínimo recomendado */
--button-height: 48px;      /* Botones principales */
--card-min-width: 100px;    /* Cartas en mobile */
--nav-height: 64px;         /* Navegación bottom */
```

## 🔄 Transiciones y Animaciones

### Micro-interacciones
```css
/* Transiciones estándar */
--transition-fast: 150ms ease-out;
--transition-normal: 250ms ease-out;
--transition-slow: 350ms ease-out;

/* Animaciones de feedback */
.button-press {
  transform: scale(0.95);
  transition: transform 100ms ease-out;
}

.card-flip {
  transform: rotateY(180deg);
  transition: transform 300ms ease-in-out;
}

.success-bounce {
  animation: bounce 0.6s ease-out;
}
```

## 📱 Responsive Breakpoints

### Mobile First Approach
```css
/* Base: Mobile (375px+) */
.container {
  padding: 1rem;
  max-width: 100%;
}

/* Small tablets (640px+) */
@media (min-width: 640px) {
  .container {
    padding: 1.5rem;
    max-width: 640px;
    margin: 0 auto;
  }
}

/* Tablets (768px+) */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Desktop (1024px+) */
@media (min-width: 1024px) {
  .game-layout {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
  }
}
```

## 🎯 Consideraciones de UX para Niños

### Principios Específicos
1. **Feedback inmediato:** Toda acción debe tener respuesta visual
2. **Errores amigables:** Mensajes motivacionales, no punitivos
3. **Progreso visible:** Barras de progreso, celebraciones
4. **Navegación simple:** Máximo 3 niveles de profundidad
5. **Elementos grandes:** Fácil de tocar con dedos pequeños

### Patrones de Interacción
- **Tap:** Acción principal (seleccionar carta, confirmar)
- **Long press:** Información adicional (preview de carta)
- **Swipe:** Navegación entre pantallas
- **Pinch:** Zoom en cartas (opcional)

### Accesibilidad
- **Contraste:** Mínimo 4.5:1 para texto
- **Tamaño de fuente:** Mínimo 16px para texto principal
- **Área de toque:** Mínimo 44x44px
- **Indicadores de estado:** Visuales y textuales

---

## 🚀 Próximos Pasos de Implementación

### Prioridad 1: Componentes Base
1. Sistema de navegación mobile
2. Componentes de cartas básicas
3. Layout responsive base
4. Sistema de colores y tipografía

### Prioridad 2: Pantallas Core
1. Menú principal
2. Selección de nivel
3. Pantalla de combate básica
4. Modal de problemas matemáticos

### Prioridad 3: Flujos Completos
1. Flujo completo de combate
2. Sistema de progresión visual
3. Colección de cartas
4. Perfil de usuario

---

*Wireframes optimizados para desarrollo mobile-first iterativo* 