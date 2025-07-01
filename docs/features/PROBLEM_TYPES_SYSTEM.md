# Sistema de Tipos de Problemas Matemáticos - EduCard AI

## 🎯 Resumen del Sistema

Sistema completo de gestión de tipos de problemas matemáticos para el juego de cartas educativo, con normalización de base de datos, seguridad RLS, y compatibilidad hacia atrás.

## 📋 Características Implementadas

### ✅ Base de Datos Normalizada
- **Tabla `cards_problem_types`**: Catálogo parametrizado de tipos de problemas
- **21 tipos específicos** organizados en 5 categorías principales
- **Relación FK**: `cards.problem_type_id` → `cards_problem_types.id`
- **Compatibilidad**: Mantiene columna original `problem_type` sincronizada

### ✅ Categorías y Tipos

| Categoría | Tipos de Problema | Dificultad | Color |
|-----------|------------------|------------|-------|
| **Aritmética** (7) | Suma, Resta, Multiplicación, División, Fracciones, Decimales, Porcentajes | 1-5 | Verde/Rojo/Azul |
| **Álgebra** (4) | Ecuaciones, Desigualdades, Polinomios, Factorización | 6-8 | Púrpura/Índigo |
| **Geometría** (4) | Área/Perímetro, Ángulos, Triángulos, Círculos | 4-6 | Lima/Naranja |
| **Lógica** (4) | Lógica, Patrones, Secuencias, Deducción | 3-6 | Púrpura/Ámbar |
| **Estadística** (2) | Estadística, Probabilidad | 7 | Rojo/Púrpura |

### ✅ Seguridad Implementada
- **RLS habilitado** en tabla `cards_problem_types`
- **Políticas de seguridad**:
  - Lectura pública para todos los usuarios
  - Modificaciones solo para administradores
- **Vista segura** `cards_with_problem_info` sin SECURITY DEFINER
- **Funciones helper** para verificación de permisos

### ✅ Frontend Actualizado
- **TypeScript interfaces** actualizadas con nueva estructura
- **Componente React** integrado con tipos de problema
- **Funciones utilitarias** para iconos y colores por categoría
- **Sistema de dificultad** visual mejorado

## 📂 Archivos del Sistema

### Scripts de Base de Datos
```
scripts/
├── create-cards-problem-types.sql    # Script principal completo
├── fix-security-issues.sql           # Corrección de alertas de seguridad  
└── example-problem-types-usage.sql   # Ejemplos de uso y consultas
```

### Código Frontend
```
src/
├── types/dynamicCards.ts             # Interfaces TypeScript actualizadas
└── components/cards/DynamicCard.tsx  # Componente React integrado
```

## 🔧 Estructura de Datos

### Tabla `cards_problem_types`
```sql
CREATE TABLE cards_problem_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,      -- 'addition', 'multiplication', etc.
    name_es VARCHAR(50) NOT NULL,          -- 'Suma', 'Multiplicación', etc.
    name_en VARCHAR(50) NOT NULL,          -- 'Addition', 'Multiplication', etc.
    description_es TEXT,                   -- Descripción en español
    description_en TEXT,                   -- Descripción en inglés
    category VARCHAR(20) NOT NULL,         -- 'arithmetic', 'algebra', etc.
    difficulty_base INTEGER DEFAULT 1,     -- Dificultad base (1-10)
    icon VARCHAR(10),                      -- Emoji: '➕', '✖️', etc.
    color_hex VARCHAR(7),                  -- Color: '#22C55E', etc.
    sort_order INTEGER DEFAULT 0,         -- Orden de visualización
    is_active BOOLEAN DEFAULT true,       -- Activo/inactivo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Vista Unificada
```sql
-- Vista que combina cartas con información de tipos de problema
CREATE VIEW cards_with_problem_info AS
SELECT 
    c.*,
    pt.code as problem_code,
    pt.name_es as problem_name_es,
    pt.name_en as problem_name_en,
    pt.description_es as problem_description_es,
    pt.description_en as problem_description_en,
    pt.category as problem_category,
    pt.difficulty_base as problem_difficulty_base,
    pt.icon as problem_icon,
    pt.color_hex as problem_color
FROM cards c
LEFT JOIN cards_problem_types pt ON c.problem_type_id = pt.id;
```

## 🚀 Funciones Disponibles

### Gestión de Tipos
```sql
-- Cambiar tipo de problema de una carta específica
SELECT change_card_problem_type('Suma Básica', 'multiplication');

-- Cambio masivo por categoría
SELECT change_cards_by_category('addition', 'subtraction');

-- Obtener nombre en idioma específico
SELECT get_problem_type_name(problem_type_id, 'es');
```

### Consultas Comunes
```sql
-- Cartas por categoría
SELECT * FROM cards_with_problem_info 
WHERE problem_category = 'arithmetic';

-- Distribución por tipo
SELECT 
    problem_category,
    COUNT(*) as total_cartas,
    AVG(base_power) as poder_promedio
FROM cards_with_problem_info
GROUP BY problem_category;
```

## 🛡️ Seguridad

### Políticas RLS
- **Lectura pública**: Todos pueden consultar el catálogo de tipos
- **Modificación admin**: Solo administradores pueden modificar tipos
- **Funciones SECURITY DEFINER**: Para verificación de permisos

### Verificación de Admin
```sql
-- Función para verificar si usuario es administrador
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' 
        AND (
            auth.jwt() ->> 'role' = 'admin'
            OR auth.jwt() ->> 'user_role' = 'admin'
            OR auth.jwt() ->> 'app_role' = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## ⚡ Performance

### Índices Optimizados
```sql
CREATE INDEX idx_cards_problem_type_id ON cards(problem_type_id);
CREATE INDEX idx_cards_problem_types_code ON cards_problem_types(code);
CREATE INDEX idx_cards_problem_types_category ON cards_problem_types(category);
CREATE INDEX idx_cards_problem_types_active ON cards_problem_types(is_active);
```

## 🔄 Compatibilidad

### Sincronización Automática
- **Trigger** mantiene `problem_type` y `problem_type_id` sincronizados
- **Código existente** sigue funcionando sin cambios
- **Migración gradual** permite actualización incremental

### Migración de Datos
```sql
-- Los datos existentes se migran automáticamente
UPDATE cards 
SET problem_type_id = (
    SELECT id FROM cards_problem_types 
    WHERE cards_problem_types.code = cards.problem_type
);
```

## 🎨 Frontend Integration

### TypeScript Interfaces
```typescript
interface ProblemType {
  id: number;
  code: ProblemTypeCode;
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  category: 'arithmetic' | 'algebra' | 'geometry' | 'logic' | 'statistics';
  difficulty_base: number;
  icon?: string;
  color_hex?: string;
  sort_order: number;
  is_active: boolean;
}

interface DynamicCard {
  // ... campos existentes ...
  problem_type_id?: number;
  problem_code?: ProblemTypeCode;
  problem_name_es?: string;
  problem_category?: string;
  problem_difficulty_base?: number;
  problem_icon?: string;
  problem_color?: string;
}
```

### Funciones Utilitarias
```typescript
export function getProblemTypeIcon(code: ProblemTypeCode): string {
  const icons: Record<ProblemTypeCode, string> = {
    addition: '➕',
    subtraction: '➖',
    multiplication: '✖️',
    division: '➗',
    // ... más iconos
  };
  return icons[code] || '🧮';
}
```

## 📊 Ejemplos de Uso

### Filtros por Categoría
```sql
-- Para dropdowns de filtro
SELECT DISTINCT
    problem_category as value,
    INITCAP(problem_category) as label,
    COUNT(*) as count
FROM cards_with_problem_info
GROUP BY problem_category;
```

### Recomendaciones por Nivel
```sql
-- Cartas apropiadas para jugador nivel 4
SELECT name, problem_name_es, problem_difficulty_base
FROM cards_with_problem_info 
WHERE problem_difficulty_base BETWEEN 2 AND 6
ORDER BY problem_difficulty_base;
```

### Análisis de Dificultad
```sql
-- Factor de complejidad por tipo
SELECT 
    category,
    name_es,
    difficulty_base,
    COUNT(cards.id) as num_cartas,
    (difficulty_base * COUNT(cards.id)) as factor_complejidad
FROM cards_problem_types pt
LEFT JOIN cards ON pt.id = cards.problem_type_id
GROUP BY pt.id, category, name_es, difficulty_base
ORDER BY factor_complejidad DESC;
```

## 🐛 Resolución de Problemas

### Errores de Seguridad Resueltos
1. ✅ **Security Definer View**: Vista recreada sin SECURITY DEFINER
2. ✅ **RLS Disabled**: RLS habilitado con políticas apropiadas

### Verificación del Sistema
```sql
-- Verificar estado de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('cards', 'cards_problem_types');

-- Verificar políticas
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('cards', 'cards_problem_types');
```

## 🔮 Próximos Pasos

1. **Integración con IA**: Conectar tipos de problema con generación automática
2. **Sistema de Progreso**: Tracking de dificultad por usuario
3. **Analytics**: Métricas de rendimiento por tipo de problema
4. **Personalización**: Tipos de problema personalizados por profesor
5. **Gamificación**: Badges y logros por categoría de problema

## 📋 Checklist de Implementación

- [x] Tabla `cards_problem_types` creada
- [x] 21 tipos de problema definidos
- [x] Foreign key `problem_type_id` agregada
- [x] Vista `cards_with_problem_info` creada
- [x] RLS habilitado y configurado
- [x] Funciones helper implementadas
- [x] Trigger de sincronización creado
- [x] TypeScript interfaces actualizadas
- [x] Componente React integrado
- [x] Scripts de ejemplo creados
- [x] Documentación completa

## 🎉 Resultado Final

Sistema completo, seguro, y escalable para gestión de tipos de problemas matemáticos con:
- **21 tipos específicos** en 5 categorías
- **Seguridad RLS** completa
- **Compatibilidad hacia atrás** garantizada  
- **Frontend integrado** con TypeScript
- **Performance optimizada** con índices
- **Documentación completa** con ejemplos

¡El sistema está listo para producción! 🚀 