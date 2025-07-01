# API Cards Usage Guide

## Nuevo Método: `apiGetCards(limit)`

### Descripción
El método `apiGetCards()` permite obtener una cantidad específica de cartas activas desde la base de datos, proporcionando mayor flexibilidad y eficiencia en la carga de cartas.

### Ubicación
- **Servicio**: `src/lib/services/databaseService.ts`
- **Endpoint**: `src/app/api/cards/route.ts`
- **Hook personalizado**: `src/lib/hooks/useCards.ts`

### Uso del Servicio

```typescript
import { databaseService } from '@/lib/services/databaseService';

// Obtener 3 cartas (por defecto)
const cards = await databaseService.apiGetCards(3);

// Obtener 10 cartas
const moreCards = await databaseService.apiGetCards(10);

// Usar valor por defecto (10 cartas)
const defaultCards = await databaseService.apiGetCards();
```

### Uso del Endpoint API

```typescript
// GET request con parámetro limit
const response = await fetch('/api/cards?limit=5');
const data = await response.json();

if (data.success) {
  console.log(`Loaded ${data.count} cards`);
  console.log('Cards:', data.cards);
}
```

### Uso del Hook Personalizado

```typescript
import { useCards } from '@/lib/hooks/useCards';

function MyComponent() {
  const { cards, loading, error, loadCards, reloadCards } = useCards(3);

  // Cargar diferentes cantidades
  const handleLoadMore = () => loadCards(10);
  const handleReload = () => reloadCards(5);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>Cartas cargadas: {cards.length}</p>
      <button onClick={handleLoadMore}>Cargar 10 cartas</button>
      <button onClick={handleReload}>Recargar con 5 cartas</button>
    </div>
  );
}
```

### Parámetros

| Parámetro | Tipo | Descripción | Valor por defecto | Límites |
|-----------|------|-------------|-------------------|---------|
| `limit` | `number` | Cantidad de cartas a obtener | 10 | 1 - 100 |

### Respuesta del Endpoint

```json
{
  "success": true,
  "cards": [...],
  "count": 5,
  "requested_limit": 5
}
```

### Características

1. **Validación automática**: El límite se valida automáticamente (1-100)
2. **Fallback robusto**: Si el servicio de base de datos falla, usa el endpoint API
3. **Ordenamiento**: Las cartas se ordenan por fecha de creación (más recientes primero)
4. **Filtrado**: Solo obtiene cartas activas (`is_active = true`)
5. **Manejo de errores**: Incluye manejo completo de errores y logging

### Ejemplos de Uso en Componentes

#### BattleField Component
```typescript
// Cargar 3 cartas para el campo de batalla
const dbCards = await apiGetCards(3);
```

#### Collection Component
```typescript
// Cargar todas las cartas disponibles (máximo 100)
const allCards = await apiGetCards(100);
```

#### Card Selector
```typescript
// Cargar 5 cartas para selección
const selectorCards = await apiGetCards(5);
```

### Controles de Desarrollo

En modo desarrollo, el componente BattleField incluye controles para probar diferentes cantidades:

- **1 Carta**: Para testing individual
- **3 Cartas**: Configuración estándar
- **5 Cartas**: Configuración extendida
- **10 Cartas**: Configuración máxima recomendada

### Migración desde getAllCards()

**Antes:**
```typescript
const allCards = await databaseService.getAllCards();
const firstThree = allCards.slice(0, 3);
```

**Después:**
```typescript
const firstThree = await databaseService.apiGetCards(3);
```

### Beneficios

1. **Eficiencia**: Solo carga las cartas necesarias
2. **Flexibilidad**: Cantidad configurable según necesidades
3. **Performance**: Reduce transferencia de datos innecesarios
4. **Escalabilidad**: Mejor para bases de datos grandes
5. **Reutilización**: Hook personalizado para uso en múltiples componentes

### Notas Técnicas

- El método usa Supabase con `.limit()` para optimizar la consulta
- Incluye logging detallado para debugging
- Compatible con el sistema existente de cartas
- Mantiene la estructura de datos original 