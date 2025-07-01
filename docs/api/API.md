# API Documentation - EduCard AI

## 📡 Servicios de IA

### OpenAI Integration

#### Generación de Problemas Matemáticos
```typescript
POST /api/ai/generate-math-problem
Content-Type: application/json

{
  "difficulty": 1-5,
  "operation": "addition" | "subtraction" | "multiplication" | "division",
  "studentLevel": number,
  "previousProblems": string[] // Para evitar repetición
}

Response:
{
  "problem": {
    "question": "¿Cuánto es 15 + 23?",
    "answer": 38,
    "options": [35, 38, 41, 44], // Para multiple choice
    "explanation": "Para sumar 15 + 23, puedes...",
    "hints": ["Suma primero las unidades", "Luego las decenas"],
    "timeLimit": 30
  },
  "metadata": {
    "difficulty": 2,
    "estimatedTime": 25,
    "concepts": ["addition", "two-digit-numbers"]
  }
}
```

#### Generación de Problemas de Lógica
```typescript
POST /api/ai/generate-logic-problem
Content-Type: application/json

{
  "type": "pattern" | "deduction" | "classification" | "strategy",
  "difficulty": 1-5,
  "age": 8-12,
  "context": "fantasy" | "animals" | "space" | "everyday"
}

Response:
{
  "problem": {
    "question": "En el reino mágico, los dragones tienen 4 patas y las hadas tienen 2 patas. Si hay 6 criaturas en total y 20 patas, ¿cuántos dragones hay?",
    "answer": "2",
    "type": "deduction",
    "explanation": "Este es un problema de sistema de ecuaciones...",
    "hints": [
      "Piensa en cuántas patas tiene cada tipo de criatura",
      "Usa variables: d = dragones, h = hadas"
    ]
  }
}
```

#### Tutoría Adaptativa
```typescript
POST /api/ai/tutoring
Content-Type: application/json

{
  "problem": MathProblem | LogicProblem,
  "studentAnswer": string | number,
  "attempts": number,
  "timeSpent": number,
  "studentProfile": {
    "level": number,
    "strengths": string[],
    "weaknesses": string[]
  }
}

Response:
{
  "feedback": {
    "isCorrect": boolean,
    "encouragement": "¡Muy bien! Tu razonamiento es correcto.",
    "hint": "Recuerda que cuando sumas, empiezas por las unidades",
    "explanation": "Explicación paso a paso...",
    "nextSteps": ["Practica más sumas de dos dígitos", "Intenta problemas con llevadas"]
  },
  "adaptiveRecommendations": {
    "adjustDifficulty": "maintain" | "increase" | "decrease",
    "focusAreas": string[],
    "suggestedPractice": string[]
  }
}
```

#### Validación de Prompts
```typescript
POST /api/ai/validate-prompt
Content-Type: application/json

{
  "prompt": "Crea un dragón amigable que ayude a los niños con matemáticas",
  "context": "character-creation",
  "expectedOutput": "character-description",
  "studentAge": 10
}

Response:
{
  "validation": {
    "isValid": true,
    "score": 85,
    "feedback": "Excelente prompt! Es claro y específico.",
    "suggestions": [
      "Podrías añadir detalles sobre el color del dragón",
      "Considera especificar qué tipo de matemáticas enseña"
    ]
  },
  "generatedContent": {
    "character": {
      "name": "Mateo el Dragón Sabio",
      "description": "Un dragón verde esmeralda con gafas doradas...",
      "personality": "Paciente, divertido y alentador",
      "specialties": ["sumas", "restas", "problemas de lógica"]
    }
  }
}
```

## 🎮 Game API

### Sistema de Combate

#### Iniciar Combate
```typescript
POST /api/game/battle/start
Content-Type: application/json

{
  "playerId": string,
  "enemyId": string,
  "difficulty": 1-5
}

Response:
{
  "battleId": string,
  "gameState": {
    "player": {
      "hp": 100,
      "maxHp": 100,
      "hand": Card[],
      "deck": Card[]
    },
    "enemy": {
      "hp": 80,
      "maxHp": 80,
      "name": "Goblin Matemático",
      "sprite": "goblin_01.png"
    },
    "turn": "player",
    "phase": "setup"
  }
}
```

#### Jugar Carta
```typescript
POST /api/game/battle/play-card
Content-Type: application/json

{
  "battleId": string,
  "cardId": string,
  "answer": number | string,
  "timeSpent": number
}

Response:
{
  "result": {
    "success": boolean,
    "damage": number,
    "xpGained": number,
    "timeBonus": number,
    "perfectBonus": boolean
  },
  "gameState": GameState,
  "feedback": {
    "message": "¡Correcto! Hiciste 25 de daño",
    "animation": "lightning-strike",
    "soundEffect": "magic-blast"
  }
}
```

### Sistema de Cartas

#### Obtener Colección
```typescript
GET /api/cards/collection/:playerId

Response:
{
  "collection": {
    "cards": Card[],
    "totalCards": 150,
    "unlockedCards": 45,
    "favoriteCards": string[]
  },
  "stats": {
    "mostUsedCard": string,
    "averageSuccessRate": 87.5,
    "totalBattlesWon": 23
  }
}
```

#### Crear Deck
```typescript
POST /api/cards/deck
Content-Type: application/json

{
  "playerId": string,
  "name": "Mi Deck Matemático",
  "cardIds": string[],
  "isActive": boolean
}

Response:
{
  "deck": {
    "id": string,
    "name": "Mi Deck Matemático",
    "cards": Card[],
    "maxSize": 30,
    "isActive": true
  }
}
```

### Sistema de Progreso

#### Obtener Progreso del Jugador
```typescript
GET /api/player/progress/:playerId

Response:
{
  "progress": {
    "currentLevel": 5,
    "totalXP": 1250,
    "unlockedLevels": [1, 2, 3, 4, 5],
    "completedLevels": [1, 2, 3, 4],
    "currentStreak": 7,
    "bestStreak": 12
  },
  "stats": {
    "totalBattlesWon": 45,
    "totalBattlesLost": 8,
    "averageAccuracy": 89.2,
    "averageTimePerProblem": 18.5,
    "strongestAreas": ["addition", "subtraction"],
    "improvementAreas": ["multiplication", "fractions"]
  },
  "achievements": Achievement[]
}
```

#### Actualizar Progreso
```typescript
POST /api/player/progress/update
Content-Type: application/json

{
  "playerId": string,
  "battleResult": {
    "won": boolean,
    "xpGained": number,
    "problemsSolved": number,
    "averageTime": number,
    "accuracy": number
  }
}

Response:
{
  "updated": true,
  "levelUp": boolean,
  "newLevel": number,
  "unlockedContent": {
    "cards": Card[],
    "levels": Level[],
    "achievements": Achievement[]
  }
}
```

## 🔐 Autenticación

### Supabase Auth Integration

#### Login
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword"
}

Response:
{
  "user": {
    "id": string,
    "email": string,
    "profile": UserProfile
  },
  "session": {
    "access_token": string,
    "refresh_token": string,
    "expires_at": number
  }
}
```

#### Registro
```typescript
POST /api/auth/register
Content-Type: application/json

{
  "email": "student@example.com",
  "password": "securepassword",
  "profile": {
    "name": "Alex",
    "age": 10,
    "grade": 4,
    "parentEmail": "parent@example.com"
  }
}
```

## 📊 Analytics API

### Métricas de Aprendizaje
```typescript
GET /api/analytics/learning/:playerId?period=week

Response:
{
  "metrics": {
    "problemsSolved": 156,
    "averageAccuracy": 87.3,
    "timeSpent": 1200, // segundos
    "conceptsMastered": ["addition", "subtraction"],
    "areasForImprovement": ["multiplication"],
    "progressTrend": "improving" | "stable" | "declining"
  },
  "recommendations": [
    "Practica más problemas de multiplicación",
    "Excelente progreso en sumas y restas"
  ]
}
```

### Métricas de Engagement
```typescript
GET /api/analytics/engagement/:playerId

Response:
{
  "engagement": {
    "dailyActiveTime": 25.5, // minutos promedio
    "sessionFrequency": 4.2, // sesiones por semana
    "retentionRate": 0.85,
    "favoriteFeatures": ["card-battles", "collection"],
    "dropOffPoints": ["difficult-fractions"]
  }
}
```

## 🚨 Error Handling

### Códigos de Error Estándar
```typescript
{
  "error": {
    "code": "INVALID_ANSWER",
    "message": "La respuesta proporcionada no es válida",
    "details": {
      "expected": "number",
      "received": "string",
      "field": "answer"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Códigos de Error Comunes
- `INVALID_ANSWER`: Respuesta no válida
- `TIME_LIMIT_EXCEEDED`: Tiempo límite excedido
- `INSUFFICIENT_XP`: XP insuficiente para la acción
- `CARD_NOT_FOUND`: Carta no encontrada
- `BATTLE_NOT_ACTIVE`: Combate no activo
- `AI_SERVICE_UNAVAILABLE`: Servicio de IA no disponible
- `RATE_LIMIT_EXCEEDED`: Límite de requests excedido

## 🔄 Rate Limiting

### Límites por Endpoint
- `/api/ai/*`: 100 requests/hora por usuario
- `/api/game/*`: 1000 requests/hora por usuario
- `/api/cards/*`: 500 requests/hora por usuario

### Headers de Rate Limiting
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642248000
```

## 🧪 Testing

### Endpoints de Testing (Solo Development)
```typescript
POST /api/test/generate-test-data
POST /api/test/reset-player-progress
GET /api/test/simulate-battle
```

---

*Esta documentación se actualiza automáticamente con cada release. Para más detalles, consulta el código fuente en `/src/app/api/`.* 