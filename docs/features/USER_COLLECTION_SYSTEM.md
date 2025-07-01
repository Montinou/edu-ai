# Sistema User Collection - Sin Fallbacks (Usuarios Reales)

## Descripción

El nuevo sistema `user_collection` reemplaza `user_cards` y maneja las colecciones personales de cartas de cada usuario **sin fallbacks automáticos**. Los usuarios deben tener cartas asignadas explícitamente usando sus IDs reales de la tabla `users`.

## Estructura de Base de Datos

### Tabla `user_collection`

```sql
CREATE TABLE user_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  card_id UUID NOT NULL REFERENCES cards(id),
  quantity INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  times_used INTEGER DEFAULT 0,
  is_upgraded BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  obtained_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE(user_id, card_id)
);
```

## Usuarios Reales Configurados

Se han asignado cartas específicas a dos usuarios reales de la tabla `users`:

### agusmontoya@gmail.com
- **Total**: 15 cartas
- **Distribución**: 8 common, 4 rare, 2 epic, 1 legendary
- **Vinculación**: Por `user_id` real de la tabla `users`

### agusmontoya2@gmail.com  
- **Total**: 15 cartas
- **Distribución**: 8 common, 4 rare, 2 epic, 1 legendary
- **Cartas diferentes** al primer usuario
- **Vinculación**: Por `user_id` real de la tabla `users`

## Métodos del DatabaseService

### Nuevos Métodos (Sin Fallbacks)

```typescript
// Obtener cartas del usuario para batalla
getUserCardsForBattle(userId: string): Promise<Card[]>

// Agregar carta específica a un usuario  
addCardToUserById(userId: string, cardId: string): Promise<void>
```

### Métodos Eliminados (Fallbacks Removidos)

- ❌ `giveStarterCards()` - Ya no se otorgan cartas automáticamente
- ❌ `ensureUserHasCards()` - Ya no hay verificación con fallback
- ❌ Fallbacks en `initializeBattle()` - Falla si el usuario no tiene cartas

## Sistema de Batalla Sin Fallbacks

### Comportamiento Actual

1. **Verificación de ID**: El usuario debe tener un ID válido
2. **Cartas Obligatorias**: Si el usuario no tiene cartas, la batalla falla
3. **No Fallbacks**: Sin cartas automáticas ni de respaldo
4. **Errores Explícitos**: Mensajes claros cuando faltan cartas
5. **Usuarios Reales**: Solo funciona con usuarios existentes en la tabla `users`

### Ejemplo de Uso

```typescript
// En BattleField2D.tsx
const playerCards = await databaseService.getUserCardsForBattle(user.id);

if (playerCards.length === 0) {
  throw new Error('El usuario no tiene cartas en su colección');
}
```

## Scripts de Migración

### Script Principal
- **Archivo**: `scripts/complete-migration.sql`
- **Función**: Crear tabla + validar usuarios + cartas + asignaciones

### Validaciones Incluidas
- Verificar que los usuarios existen en la tabla `users`
- Obtener IDs reales de usuarios
- Asignar cartas diferentes a cada usuario
- Reportes detallados de asignación

## Asignación de Cartas

### Distribución por Rareza (15 cartas c/u)
- **Common**: 8 cartas (53%)
- **Rare**: 4 cartas (27%) 
- **Epic**: 2 cartas (13%)
- **Legendary**: 1 carta (7%)

### Características
- **Usuarios Reales**: Basado en IDs de la tabla `users`
- **Aleatorias**: Cartas seleccionadas al azar por rareza
- **Sin Duplicados**: Cada usuario tiene cartas completamente diferentes
- **Equilibradas**: Misma distribución de rarezas para ambos

## Ventajas del Sistema Corregido

1. **Control Total**: Administrador controla qué cartas tiene cada usuario real
2. **Sin Sorpresas**: No hay cartas automáticas inesperadas
3. **Testing Real**: Usuarios de prueba con IDs válidos en la base de datos
4. **Rendimiento**: Menos consultas, menos lógica condicional
5. **Claridad**: Errores explícitos cuando algo falta
6. **Integridad**: Referencias válidas entre tablas

## Uso en Producción

### Para Usuarios Nuevos
Los usuarios nuevos necesitan que un administrador les asigne cartas manualmente o implementar un sistema de asignación inicial separado.

### Para Testing
Usar `agusmontoya@gmail.com` o `agusmontoya2@gmail.com` para pruebas inmediatas.

### Para Desarrollo
Ejecutar `scripts/complete-migration.sql` para setup completo.

## Consideraciones

- **No Retrocompatible**: user_cards ya no se usa
- **Administración Manual**: Cartas deben asignarse explícitamente  
- **Email Obligatorio**: El sistema depende del email del usuario
- **Sin Fallbacks**: Fallos inmediatos si faltan datos

## Futuras Mejoras

- [ ] Sistema de asignación inicial para usuarios nuevos
- [ ] Panel de administración para gestionar colecciones
- [ ] Sistema de intercambio entre usuarios
- [ ] Recompensas automáticas por logros 