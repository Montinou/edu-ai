# 📚 Módulo de RPG Narrativo Educativo: Propuesta Actualizada

## 📋 Resumen Ejecutivo

Desarrollar un **sistema de juego de rol narrativo interactivo** donde los estudiantes viven aventuras literarias personalizadas que se adaptan a su edad, experiencia y preferencias. Utilizando **modelos de IA avanzados**, cada sesión genera historias únicas con decisiones significativas que enseñan elementos literarios, comprensión lectora, escritura creativa y pensamiento crítico, permitiendo a los estudiantes desarrollar habilidades de pensamiento crítico y aprender a usar efectivamente herramientas de IA.

## 🏗️ Estado Actual de Implementación

### Componentes Completados:

- ✅ **Estructura de tipos y datos**
  - Definición completa de tipos en `src/types/narrative/index.ts`
  - Géneros literarios, niveles de lectura, habilidades y elementos literarios
  - Interfaces para personajes, aventuras, escenas y decisiones

- ✅ **Esquema de base de datos**
  - Implementada migración completa `002_create_narrative_rpg_tables.sql`
  - Tablas para aventuras, escenas, decisiones y habilidades literarias
  - Triggers para inicialización y actualización de habilidades de usuario

- ✅ **Servicios core**
  - `narrativeDbService.ts` para operaciones de base de datos
  - Integración con Gemini AI (versión mock, reemplazable por otros modelos)

- ✅ **API endpoints funcionales**
  - `/api/ai/narrative/start-adventure` - Iniciar aventuras
  - `/api/ai/narrative/make-decision` - Procesar decisiones
  - `/api/ai/narrative/save-session-image` - Guardar imágenes de sesión

## 📅 Plan de Implementación Detallado

### Fase 1: MVP Básico Funcional (2-3 semanas)

#### 1.1 Interfaz de Usuario Básica
- Diseñar interfaz minimalista pero atractiva para niños de 8-16 años
- Implementar página de inicio de aventuras con selección de género y tema
- Desarrollar el componente de visualización de narrativa y toma de decisiones
- Incorporar retroalimentación visual para cada decisión

**UI Components:**
```tsx
// AdventureSelectionCard - Para selección de género
const AdventureSelectionCard = ({ genre, onSelect }) => (
  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 to-white border-2 hover:border-primary-500 transition-all shadow-md hover:shadow-xl cursor-pointer p-6" onClick={() => onSelect(genre.id)}>
    <div className="absolute top-0 right-0 p-2 text-3xl">{genre.emoji}</div>
    <h3 className="text-xl font-bold text-primary-700 mb-2">{genre.name}</h3>
    <p className="text-gray-600 mb-4">{genre.description}</p>
    <div className="flex flex-wrap gap-2">
      {genre.sample_themes.map((theme, i) => (
        <span key={i} className="px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
          {theme}
        </span>
      ))}
    </div>
  </div>
);

// NarrativeDisplay - Para mostrar escenas narrativas
const NarrativeDisplay = ({ scene, onDecisionSelect }) => (
  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
    <div className="relative h-48 bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden">
      {scene.image_url && (
        <img src={scene.image_url} alt="Escena narrativa" className="w-full h-full object-cover" />
      )}
      <div className="absolute inset-0 bg-black/30 flex items-end p-4">
        <h2 className="text-white text-xl font-bold">{scene.title}</h2>
      </div>
    </div>
    
    <div className="p-6">
      <div className="prose prose-indigo max-w-none mb-6">
        {scene.narrative_text}
      </div>
      
      <h3 className="text-lg font-semibold mb-3">¿Qué harás ahora?</h3>
      <div className="space-y-3">
        {scene.decisions[0]?.options.map((option, idx) => (
          <button 
            key={idx}
            onClick={() => onDecisionSelect(scene.decisions[0].id, option.id)}
            className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
          >
            <span className="font-medium">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);
```

#### 1.2 Generación de Contenido Narrativo
- Implementar integración con modelos de IA alternativos (no solo Gemini)
- Crear sistema de prompts para generar narrativas adecuadas por edades
- Diseñar mecanismo de fallback para manejar errores de generación
- Establecer sistema de caché para mejorar rendimiento

#### 1.3 Sistema de Visualización
- Implementar integración con API de imágenes (Hugging Face o similar)
- Generar imágenes representativas para personajes y escenas
- Crear efectos visuales básicos para transiciones entre escenas
- Implementar animaciones simples para decisiones y avances

#### 1.4 Análisis Literario Básico
- Incorporar identificación de elementos literarios en textos
- Implementar panel de "modo análisis" para estudiantes avanzados
- Crear preguntas de reflexión automáticas al final de cada escena
- Diseñar sistema visual para resaltar elementos literarios en textos

### Fase 2: Refinamiento y Personalización (3-4 semanas)

#### 2.1 Perfil del Estudiante
- Implementar perfiles personalizados con preferencias de lectura
- Crear sistema de seguimiento de habilidades literarias
- Desarrollar algoritmo de adaptación de dificultad según perfil
- Implementar retroalimentación personalizada

**UI Components:**
```tsx
// StudentSkillsRadar - Visualización de habilidades
const StudentSkillsRadar = ({ skills }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-3">Mis Habilidades Literarias</h3>
    <div className="aspect-square">
      {/* Implementar gráfico de radar usando D3.js o similar */}
      <RadarChart 
        data={[
          { skill: 'Observación', value: skills.observación || 0 },
          { skill: 'Creatividad', value: skills.creatividad || 0 },
          { skill: 'Lógica', value: skills.lógica || 0 },
          { skill: 'Empatía', value: skills.empatía || 0 },
          { skill: 'Elocuencia', value: skills.elocuencia || 0 },
          { skill: 'Análisis', value: skills.análisis || 0 },
          { skill: 'Inferencia', value: skills.inferencia || 0 },
          { skill: 'Deducción', value: skills.deducción || 0 }
        ]} 
      />
    </div>
    <div className="mt-4">
      <h4 className="font-medium text-primary-700">Fortalezas</h4>
      <div className="flex flex-wrap gap-1 mt-1">
        {skills.strengths?.map(strength => (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            {strength}
          </span>
        ))}
      </div>
    </div>
  </div>
);
```

#### 2.2 Generación de Audio
- Integrar API de síntesis de voz para narración
- Implementar efectos de sonido ambientales según escena
- Crear variaciones de voces para diferentes personajes
- Diseñar controles de reproducción accesibles

#### 2.3 Sistema de Logros
- Implementar logros literarios básicos (completar historias, tomar decisiones)
- Crear sistema visual de insignias y reconocimientos
- Desarrollar notificaciones para logros desbloqueados
- Implementar página de colección de logros

#### 2.4 Herramientas de Prompteo
- Diseñar interfaz para que estudiantes mejoren prompts
- Implementar sistema de sugerencias de mejora de prompts
- Crear tutoriales interactivos sobre efectividad de prompts
- Desarrollar dashboard de efectividad de prompts personales

**UI Components:**
```tsx
// PromptWorkshop - Para aprender a crear buenos prompts
const PromptWorkshop = ({ onSubmit }) => {
  const [prompt, setPrompt] = useState('');
  const [feedback, setFeedback] = useState(null);
  
  const analyzePrompt = async () => {
    // Solicitar análisis del prompt al servidor
    const result = await fetch('/api/ai/analyze-prompt', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    }).then(r => r.json());
    
    setFeedback(result);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Taller de Prompts</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Escribe tu prompt para generar una historia
        </label>
        <textarea 
          className="w-full p-3 border rounded-lg" 
          rows={4}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Ej: Una aventura de un explorador espacial que descubre..."
        />
      </div>
      
      <div className="flex gap-3 mb-6">
        <button 
          onClick={analyzePrompt}
          className="px-4 py-2 bg-secondary-500 text-white rounded-lg"
        >
          Analizar Prompt
        </button>
        <button 
          onClick={() => onSubmit(prompt)}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg"
        >
          Generar Historia
        </button>
      </div>
      
      {feedback && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h4 className="font-semibold mb-2">Sugerencias para mejorar tu prompt:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {feedback.suggestions.map((suggestion, i) => (
              <li key={i}>{suggestion}</li>
            ))}
          </ul>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span>Especificidad: {feedback.scores.specificity}/10</span>
              <span>Creatividad: {feedback.scores.creativity}/10</span>
              <span>Claridad: {feedback.scores.clarity}/10</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### Fase 3: Funcionalidades Avanzadas (4-6 semanas)

#### 3.1 Modo Colaborativo
- Implementar aventuras para múltiples estudiantes
- Crear sistema de roles en narrativas (narrador, protagonista, etc.)
- Desarrollar herramientas de toma de decisión colectiva
- Implementar chat en tiempo real para colaboración

#### 3.2 Creación de Historias
- Desarrollar herramienta para que estudiantes creen sus propias aventuras
- Implementar sistema de compartición de aventuras creadas
- Crear herramientas de edición asistidas por IA
- Implementar galería de aventuras populares

#### 3.3 Integración con Análisis Educativo
- Crear dashboard para educadores con métricas de progreso
- Implementar exportación de informes de habilidades desarrolladas
- Desarrollar herramientas de asignación de objetivos específicos
- Crear sistema de evaluación de comprensión lectora

#### 3.4 Funcionalidades Experimentales
- Implementar modo de realidad aumentada para escenas
- Crear historias interactivas basadas en ubicación
- Desarrollar integración con dispositivos IoT para efectos físicos
- Implementar reconocimiento de voz para decisiones orales

## 🎨 Especificaciones de Diseño UI/UX

### Principios de Diseño:

1. **Accesibilidad para diferentes edades**
   - Interfaces adaptables según rango de edad (8-10, 11-13, 14-16)
   - Lectura configurable (tamaño, espaciado, fuente para dislexia)
   - Asistencia de audio opcional para lectores principiantes

2. **Estética Atractiva pero no Infantil**
   - Paleta de colores vibrante pero sofisticada
   - Ilustraciones estilizadas vs. caricaturas excesivamente infantiles
   - Transición visual según edad (más ilustrativo para menores, más fotográfico para mayores)

3. **Gamificación Significativa**
   - Retroalimentación visual instantánea para decisiones
   - Animaciones de progreso y logros que no interrumpan la experiencia
   - Elementos 3D sutiles para dar profundidad a la interfaz

4. **Fluidez Narrativa**
   - Transiciones suaves entre escenas para mantener inmersión
   - Efectos visuales para momentos importantes (decisiones críticas)
   - Indicadores sutiles de ramificaciones narrativas

### Componentes UI Clave:

#### Página Principal
```tsx
const NarrativeHomePage = () => (
  <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
    <header className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-700">Aventuras Literarias</h1>
        <nav className="flex items-center gap-4">
          <button className="text-gray-600 hover:text-primary-600">Mi Colección</button>
          <button className="text-gray-600 hover:text-primary-600">Logros</button>
          <button className="text-gray-600 hover:text-primary-600">Perfil</button>
        </nav>
      </div>
    </header>
    
    <main className="max-w-7xl mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Vive aventuras que te enseñan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Explora mundos narrativos donde tus decisiones importan y desarrolla habilidades literarias mientras te diviertes.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjetas de géneros literarios */}
        </div>
      </section>
      
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Continúa tu aventura</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjetas de aventuras en progreso */}
        </div>
      </section>
      
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Explora nuevos desafíos</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjetas de desafíos literarios */}
        </div>
      </section>
    </main>
  </div>
);
```

#### Interfaz de Aventura
```tsx
const AdventureInterface = () => (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
      {/* Panel principal de narrativa - 2/3 del ancho */}
      <div className="flex-grow">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Imagen de la escena */}
          <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-purple-600">
            {/* Imagen generada */}
            <div className="absolute inset-0 bg-black/30 flex items-end p-6">
              <h2 className="text-white text-2xl font-bold">El Misterio de la Biblioteca</h2>
            </div>
          </div>
          
          {/* Contenido narrativo */}
          <div className="p-6">
            <div className="prose prose-lg max-w-none mb-8">
              {/* Texto narrativo */}
            </div>
            
            {/* Panel de decisiones */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">¿Qué harás ahora?</h3>
              <div className="grid gap-3">
                {/* Opciones de decisión */}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Panel lateral - 1/3 del ancho */}
      <div className="w-full lg:w-80 space-y-6">
        {/* Personaje */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Info del personaje */}
        </div>
        
        {/* Habilidades */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Habilidades desarrolladas */}
        </div>
        
        {/* Elementos literarios */}
        <div className="bg-white rounded-lg shadow p-4">
          {/* Elementos identificados */}
        </div>
      </div>
    </div>
  </div>
);
```

### Efectos Visuales y Sonoros:

1. **Efectos de Transición**
   - Desvanecimiento suave entre escenas (500-800ms)
   - Animación de "página volteándose" para nuevos capítulos
   - Efecto de "ondulación" al tomar decisiones críticas

2. **Retroalimentación de Decisiones**
   - Brillo sutil alrededor de opciones al pasar el cursor
   - Pequeña explosión de partículas al seleccionar una opción
   - Vibración suave (dispositivos móviles) para decisiones importantes

3. **Elementos Interactivos**
   - Palabras clave que brillan suavemente para indicar términos importantes
   - Objetos narrativos que se pueden "examinar" con zoom visual
   - Efectos de revelación para pistas ocultas

4. **Audio Ambiental**
   - Música de fondo adaptativa según el tono de la escena
   - Efectos de sonido sutiles para acciones y transiciones
   - Narración opcional con voces diversas

## 🛠️ Arquitectura Técnica

### Stack Tecnológico:

1. **Frontend**
   - Next.js con App Router
   - TailwindCSS para estilos
   - Framer Motion para animaciones
   - Three.js para efectos 3D puntuales

2. **Backend**
   - API Routes de Next.js
   - Supabase para base de datos y autenticación
   - Middleware para manejo de sesiones y permisos

3. **IA y Multimedia**
   - Modelos de texto (reemplazable: Gemini, OpenAI, HuggingFace, etc.)
   - API de generación de imágenes (Stability, DALL-E, HuggingFace)
   - API de síntesis de voz (ElevenLabs, Azure TTS)

4. **Análisis y Telemetría**
   - Seguimiento de progreso educativo
   - Análisis de patrones de decisión
   - Métricas de engagement y retención

### Consideraciones de Escalabilidad:

1. **Sistema de Caché Inteligente**
   - Almacenamiento de respuestas comunes de IA para reducir latencia
   - Preprocesamiento de escenas probables según patrones de usuario
   - Generación asíncrona de assets multimedia

2. **Arquitectura Modular**
   - Separación clara entre generación narrativa, análisis literario y UI
   - Proveedores de IA intercambiables mediante interfaces comunes
   - Componentes UI reutilizables entre diferentes vistas

3. **Persistencia Eficiente**
   - Almacenamiento eficiente de árboles de decisión
   - Compresión de escenas ya visitadas
   - Sincronización inteligente para experiencia offline

## 🚀 Roadmap de Implementación (Detallado)

### Fase 1: MVP Funcional (4 semanas)
- **Semana 1:** Setup inicial y arquitectura
  - Configurar estructura de proyecto Next.js
  - Implementar UI básica de selección de aventura
  - Desarrollar integración con proveedor de IA seleccionado

- **Semana 2:** Generación narrativa básica
  - Implementar prompts iniciales para historias
  - Desarrollar UI de visualización de escenas
  - Crear sistema de toma de decisiones básico

- **Semana 3:** Integración de multimedia
  - Implementar generación de imágenes para escenas
  - Desarrollar sistema de caché de assets
  - Crear efectos visuales básicos

- **Semana 4:** Testing y refinamiento
  - Pruebas de usuario con grupo objetivo (8-16 años)
  - Optimización de rendimiento y tiempos de carga
  - Ajustes de UX basados en retroalimentación

### Fase 2: Enriquecimiento Educativo (4 semanas)
- **Semana 5-8:** Implementación de análisis literario, perfiles de usuario, y sistema de logros

### Fase 3: Expansión Social (4 semanas)
- **Semana 9-12:** Desarrollo de aventuras colaborativas y herramientas de creación

### Fase 4: Funcionalidades Avanzadas (4 semanas)
- **Semana 13-16:** Implementación de dashboard educativo y características experimentales

## 📌 Conclusión

El Módulo de RPG Narrativo Educativo tiene un sólido fundamento técnico ya implementado y está listo para evolucionar hacia una experiencia educativa completa. El enfoque en fases permite desarrollar primero un MVP valioso mientras se establece la arquitectura para funcionalidades más avanzadas en el futuro.

El diseño centrado en niños de 8-16 años, con adaptabilidad según edad y nivel educativo, permitirá crear una herramienta efectiva para el desarrollo de habilidades literarias, pensamiento crítico y competencias para interactuar con IA de manera efectiva.

---

*Propuesta actualizada: Junio 2024* 