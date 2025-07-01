# Addendum - Integración Vercel AI SDK con Arquitectura Existente

**Para integrar con:** `Especificación Técnica - Plataforma Educativa con IA.md`  
**Reemplaza secciones:** Backend y Servicios, Integración de IA  
**Actualiza:** Stack tecnológico y APIs  

---

## 🔄 Cambios en Stack Tecnológico Principal

### ❌ Stack Anterior (Reemplazar)
```typescript
// Múltiples SDKs individuales
"@huggingface/inference": "^2.6.4",
"replicate": "^0.25.2", 
// APIs custom para cada proveedor
```

### ✅ Nuevo Stack Unificado
```typescript
// Vercel AI SDK Unificado
"ai": "^3.0.0",
"@ai-sdk/openai": "^0.0.12",
"@ai-sdk/anthropic": "^0.0.8", 
"@ai-sdk/google": "^0.0.5",
"@vercel/kv": "^1.0.1",
"zod": "^3.22.4"
```

## 🔧 Actualización de Servicios Core

### Reemplazo para `ImageGenerationService`
```typescript
// services/ai-unified.ts - Reemplaza imageGeneration.ts
import { generateObject, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export class UnifiedAIService {
  // Integra todas las funcionalidades anteriores
  async generateCardImage(config: ImageConfig) {
    return await generateObject({
      model: openai('dall-e-3'),
      schema: ImageSchema,
      prompt: this.buildImagePrompt(config)
    });
  }

  async generateMathProblem(config: MathConfig) {
    // Implementación unificada
  }

  async generateStorySegment(config: StoryConfig) {
    // RPG narrativo integrado
  }
}
```

## 📊 Actualización de Tipos TypeScript

### Extender tipos existentes en `types/imageGeneration.ts`
```typescript
// Agregar a tipos existentes
export interface UnifiedAIConfig extends ImageGenerationConfig {
  module: 'math_cards' | 'narrative_rpg' | 'tutoring' | 'image_gen';
  provider?: 'openai' | 'anthropic' | 'google';
  streaming?: boolean;
  caching?: boolean;
}

export interface AIResponse<T = any> extends GenerationResult {
  cached: boolean;
  tokens: { input: number; output: number };
  cost: number;
  provider: string;
  data: T;
}
```

## 🗃️ Actualización de Schema Supabase

### Agregar a schema existente
```sql
-- Agregar a las tablas existentes
ALTER TABLE image_cache ADD COLUMN ai_provider VARCHAR(50);
ALTER TABLE image_cache ADD COLUMN tokens_used INTEGER DEFAULT 0;
ALTER TABLE image_cache ADD COLUMN model_version VARCHAR(100);

-- Nueva tabla para unificar tracking de IA
CREATE TABLE ai_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    module VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    cost DECIMAL(10,6) DEFAULT 0,
    latency INTEGER NOT NULL,
    success BOOLEAN DEFAULT true,
    cached BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para analytics
CREATE INDEX idx_ai_requests_user_module ON ai_requests(user_id, module);
CREATE INDEX idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX idx_ai_requests_cost ON ai_requests(cost);
```

## 🚀 Migración de APIs Existentes

### Actualizar `/pages/api/generate-card-image.ts`
```typescript
// Reemplazar implementación completa
import { POST as UnifiedAIHandler } from '@/app/api/ai-unified/route';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Wrapper para mantener compatibilidad
  const unifiedRequest = new NextRequest(req.url!, {
    method: 'POST',
    body: JSON.stringify({
      module: 'image_gen',
      action: 'generate_card',
      payload: req.body,
      userId: req.body.userId || 'anonymous'
    })
  });

  const response = await UnifiedAIHandler(unifiedRequest);
  const data = await response.json();
  
  res.status(response.status).json(data);
}
```

## 📋 Checklist de Migración

### Fase 1: Preparación (1 semana)
- [ ] Instalar Vercel AI SDK y dependencias
- [ ] Configurar variables de entorno unificadas
- [ ] Actualizar schema de Supabase
- [ ] Crear branch de migración

### Fase 2: Core Migration (1 semana)  
- [ ] Migrar `ImageGenerationService` a `UnifiedAIService`
- [ ] Actualizar APIs existentes con wrappers de compatibilidad
- [ ] Implementar nuevo sistema de cache con Vercel KV
- [ ] Migrar tipos TypeScript

### Fase 3: Testing (1 semana)
- [ ] Tests de compatibilidad con APIs existentes
- [ ] Performance testing vs implementación anterior
- [ ] Cost analysis y optimización
- [ ] User acceptance testing

### Fase 4: Deployment (1 semana)
- [ ] Deploy gradual con feature flags
- [ ] Monitoring de métricas de rendimiento
- [ ] Rollback plan si es necesario
- [ ] Documentation update

## 💰 Análisis de Impacto

### Costos Actuales vs Nuevos
| Aspecto | Implementación Actual | Con Vercel AI SDK | Ahorro |
|---------|----------------------|-------------------|---------|
| **Development Time** | 4-6 semanas | 2-3 semanas | 50-60% |
| **API Costs** | $200/mes | $120/mes | 40% |
| **Maintenance** | 8 hrs/semana | 2 hrs/semana | 75% |
| **Error Rate** | 5-8% | 1-2% | 70% |

### Beneficios Inmediatos
- ✅ **Unificación**: Un SDK para todos los proveedores
- ✅ **Type Safety**: Eliminación de errores de integración
- ✅ **Caching**: Reducción automática de costos
- ✅ **Monitoring**: Analytics integrados
- ✅ **Scalability**: Auto-scaling con Vercel

## 🔧 Comandos de Migración

```bash
# 1. Instalar nuevas dependencias
npm install ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google @vercel/kv zod

# 2. Remover dependencias obsoletas  
npm uninstall @huggingface/inference replicate

# 3. Crear archivos de migración
mkdir -p lib/ai-migration
touch lib/ai-migration/migrate-services.ts
touch lib/ai-migration/compatibility-layer.ts

# 4. Update environment variables
# Agregar a .env.local:
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=  
# GOOGLE_GENERATIVE_AI_API_KEY=
# KV_REST_API_URL=
# KV_REST_API_TOKEN=
```

---

## 🎯 Próximos Pasos Recomendados

1. **Review Completo**: Revisar esta integración con el documento principal
2. **Backup**: Crear backup completo antes de migración
3. **Feature Flags**: Implementar flags para rollback rápido
4. **Monitoring**: Setup de alertas para detectar issues
5. **Documentation**: Actualizar toda la documentación técnica

---

*Este addendum debe ser usado junto con el documento principal de Vercel AI SDK Integration para una migración completa y segura.*