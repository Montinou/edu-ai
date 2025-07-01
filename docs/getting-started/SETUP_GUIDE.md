# Guía de Setup - IA Education Platform MVP

## 🚀 Configuración Inicial del Proyecto

### Prerrequisitos
- **Node.js:** v18.0.0 o superior
- **npm:** v8.0.0 o superior
- **Git:** Para control de versiones
- **Editor:** VS Code recomendado con extensiones:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter

### 1. Instalación de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Verificar instalación
npm run type-check
```

### 2. Configuración del Entorno de Desarrollo

```bash
# Crear archivo de variables de entorno
cp .env.example .env.local

# Ejecutar en modo desarrollo
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

### 3. Estructura de Directorios a Crear

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── loading.tsx
│   ├── not-found.tsx
│   ├── game/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── collection/
│   │   └── page.tsx
│   └── profile/
│       └── page.tsx
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── ProgressBar.tsx
│   │   └── LoadingSpinner.tsx
│   ├── game/
│   │   ├── GameBoard.tsx
│   │   ├── BattleArea.tsx
│   │   ├── PlayerStats.tsx
│   │   ├── EnemyArea.tsx
│   │   └── GameHUD.tsx
│   ├── cards/
│   │   ├── MathCard.tsx
│   │   ├── CardDeck.tsx
│   │   ├── CardCollection.tsx
│   │   └── CardPreview.tsx
│   └── navigation/
│       ├── MobileNav.tsx
│       ├── TabBar.tsx
│       └── Header.tsx
├── lib/
│   ├── game-logic.ts
│   ├── math-problems.ts
│   ├── card-system.ts
│   ├── storage.ts
│   └── utils.ts
├── types/
│   ├── game.ts
│   ├── cards.ts
│   ├── user.ts
│   └── index.ts
├── hooks/
│   ├── useGame.ts
│   ├── useCards.ts
│   ├── useLocalStorage.ts
│   └── useTimer.ts
└── constants/
    ├── game-config.ts
    ├── card-data.ts
    └── levels.ts
```

## 📱 Configuración Mobile-First

### Viewport Meta Tag
Ya configurado en `layout.tsx`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
```

### PWA Setup (Futuro)
```bash
# Instalar dependencias PWA
npm install next-pwa workbox-webpack-plugin

# Configurar en next.config.js
# Crear manifest.json
# Configurar service worker
```

## 🎨 Sistema de Diseño

### Colores Principales
```css
/* Variables CSS personalizadas */
:root {
  --color-primary: #3b82f6;
  --color-game-hp: #ef4444;
  --color-game-xp: #10b981;
  --color-game-energy: #f59e0b;
  --color-background: #f8fafc;
}
```

### Componentes Base
Todos los componentes seguirán estos principios:
- **Touch targets:** Mínimo 44px
- **Responsive:** Mobile-first
- **Accesible:** ARIA labels y contraste adecuado
- **Performante:** Lazy loading cuando sea necesario

## 🧪 Testing Setup

### Configuración de Jest
```bash
# Crear archivo de configuración
touch jest.config.js
touch jest.setup.js

# Ejecutar tests
npm test
npm run test:watch
npm run test:coverage
```

### Estructura de Tests
```
__tests__/
├── components/
│   ├── ui/
│   ├── game/
│   └── cards/
├── lib/
│   ├── game-logic.test.ts
│   ├── math-problems.test.ts
│   └── card-system.test.ts
└── hooks/
    ├── useGame.test.ts
    └── useCards.test.ts
```

## 🔧 Scripts de Desarrollo

### Scripts Disponibles
```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Build de producción
npm run start           # Servidor de producción
npm run lint            # Linting
npm run type-check      # Verificación de tipos

# Testing
npm test                # Ejecutar tests
npm run test:watch      # Tests en modo watch
npm run test:coverage   # Coverage report

# Utilidades
npm run clean           # Limpiar cache
npm run analyze         # Análisis del bundle
```

## 📊 Métricas y Monitoring

### Performance Monitoring
```bash
# Análisis del bundle
npm run analyze

# Lighthouse CI (futuro)
npm install -g @lhci/cli
lhci autorun
```

### Error Tracking (Futuro)
- Sentry para error tracking
- Vercel Analytics para métricas
- Custom analytics para eventos de juego

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy a producción
vercel --prod
```

### Variables de Entorno
```bash
# .env.local (desarrollo)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production (producción)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api
```

## 🔄 Workflow de Desarrollo

### 1. Desarrollo de Features
```bash
# Crear rama para feature
git checkout -b feature/nombre-feature

# Desarrollo iterativo
npm run dev
npm test
npm run type-check

# Commit y push
git add .
git commit -m "feat: descripción del feature"
git push origin feature/nombre-feature
```

### 2. Code Review
- Pull request con descripción clara
- Tests pasando
- Type checking sin errores
- Linting sin warnings

### 3. Deploy
- Merge a main
- Deploy automático a staging
- Testing manual
- Deploy a producción

## 📋 Checklist de Setup

### Configuración Inicial
- [ ] Node.js y npm instalados
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor de desarrollo funcionando (`npm run dev`)
- [ ] TypeScript configurado sin errores
- [ ] Tailwind CSS funcionando

### Estructura del Proyecto
- [ ] Directorios creados según especificación
- [ ] Componentes base implementados
- [ ] Tipos TypeScript definidos
- [ ] Hooks personalizados creados
- [ ] Utilidades y helpers implementados

### Testing y Calidad
- [ ] Jest configurado
- [ ] Tests básicos funcionando
- [ ] ESLint sin errores
- [ ] Prettier configurado
- [ ] Type checking pasando

### Mobile y UX
- [ ] Responsive design funcionando
- [ ] Touch targets adecuados
- [ ] Navegación mobile implementada
- [ ] Performance optimizada
- [ ] Accesibilidad básica

## 🎯 Próximos Pasos

### Sprint 1 (Semana 1-2)
1. **Setup completo del proyecto**
   - Crear estructura de directorios
   - Implementar componentes UI básicos
   - Configurar navegación mobile

2. **Componentes base**
   - Button, Card, Modal
   - MobileNav, TabBar
   - LoadingSpinner, ProgressBar

3. **Tipos y utilidades**
   - Definir interfaces principales
   - Implementar helpers básicos
   - Configurar storage local

### Sprint 2 (Semana 3-4)
1. **Sistema de cartas básico**
   - MathCard component
   - Generador de problemas
   - CardDeck y CardCollection

2. **Mecánica de juego core**
   - GameBoard component
   - Lógica de combate básica
   - Sistema de HP y daño

3. **Persistencia y estado**
   - Context para estado global
   - LocalStorage integration
   - Hooks personalizados

---

## 🆘 Troubleshooting

### Problemas Comunes

**Error: Module not found**
```bash
# Verificar paths en tsconfig.json
# Reiniciar servidor de desarrollo
npm run dev
```

**TypeScript errors**
```bash
# Verificar configuración
npm run type-check
# Limpiar cache
rm -rf .next
npm run dev
```

**Tailwind no funciona**
```bash
# Verificar configuración en tailwind.config.js
# Verificar imports en globals.css
# Reiniciar servidor
```

**Performance issues**
```bash
# Analizar bundle
npm run analyze
# Verificar lazy loading
# Optimizar imágenes
```

---

*Guía completa para setup y desarrollo del MVP* 