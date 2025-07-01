# EduCard AI - Educational Platform

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ia-education-platform)

Una plataforma educativa innovadora que combina el aprendizaje matemático con la alfabetización en IA a través de un sistema de cartas interactivo y batallas estratégicas.

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Configure environment variables (see [Environment Variables](#environment-variables))
4. Deploy!

### Local Development

```bash
# Clone the repository
git clone https://github.com/your-username/ia-education-platform.git
cd ia-education-platform

# Install dependencies
npm install

# Set up Firebase (see Firebase Setup section)
# Initialize database with sample data
npm run init-db

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🗄️ Supabase Database

This project uses **Supabase PostgreSQL** as the primary database for:

- 👤 **User Management**: Authentication and user profiles
- 🃏 **Card Collections**: User card inventories and progress
- 📊 **Game Sessions**: Battle results and learning analytics
- 🏆 **Leaderboards**: Player rankings and achievements
- 📈 **Progress Tracking**: Learning statistics and performance metrics
- 🤖 **AI Integration**: Cached AI-generated content and prompt tracking
- 📚 **Creative Content**: User stories and custom characters

### Supabase Features:
- ✅ **PostgreSQL Database**: Powerful relational database with JSONB support
- ✅ **Real-time Subscriptions**: Instant updates across devices
- ✅ **Row Level Security**: Built-in security policies for data protection
- ✅ **Auto-generated APIs**: RESTful and GraphQL APIs out of the box
- ✅ **Advanced Analytics**: Complex queries for educational insights
- ✅ **AI-Ready**: Optimized for AI content caching and prompt engineering

### Database Setup:
```bash
# Run migration script in Supabase SQL Editor
# See scripts/supabase-migration.sql

# Initialize database with sample data
npm run init-supabase-db

# Sync local types with database
npm run generate-types
```

**📖 Complete Setup Guide**: See [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) for detailed schema documentation.

## 🤖 AI Integration

This project uses **Google AI (Gemini)** as the primary AI service for:

- 📚 **Math Problem Generation**: Dynamic creation of age-appropriate math problems
- 🧠 **Logic Problem Creation**: Critical thinking and reasoning challenges  
- 👨‍🏫 **AI Tutoring**: Adaptive feedback and personalized learning assistance
- ✍️ **Prompt Validation**: Teaching children effective AI prompting skills
- 📖 **Story Generation**: Educational narratives and character creation

### AI Features:
- ✅ **Configured with Google AI API Key**: `AIzaSyA_nF4BAKtiKwtwOW41vLI0iA5DNm7teTc`
- ✅ **Adaptive Difficulty**: Problems adjust to student performance
- ✅ **Educational Context**: All content is age-appropriate (8-12 years)
- ✅ **Multilingual Support**: Spanish-first with English support
- ✅ **Safety First**: Content filtering and educational guidelines

### Test AI Integration:
```bash
# Test the AI service
curl http://localhost:3000/api/ai/test-google-ai

# Test with custom prompt
curl -X POST http://localhost:3000/api/ai/test-google-ai \
  -H "Content-Type: application/json" \
  -d '{"prompt": "multiplication"}'
```

## 🌟 Features

- **Card-based Learning**: Sistema de cartas con problemas matemáticos y lógicos
- **3D Graphics**: Renderizado 3D con Three.js y shaders personalizados
- **Progressive Difficulty**: 4 niveles de progresión académica
- **Real-time Battles**: Sistema de batallas en tiempo real
- **Mobile-first**: Diseño responsivo optimizado para dispositivos móviles

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Next.js 14
- **3D Graphics**: Three.js + React Three Fiber
- **Styling**: Tailwind CSS + Framer Motion
- **State Management**: Zustand
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **AI Services**: Google AI (Gemini 1.5 Flash)
- **Deployment**: Vercel
- **Testing**: Jest + Playwright

## 📋 Environment Variables

The project is pre-configured with Firebase and Google AI credentials. For production deployment, you may want to use your own:

```bash
# Google AI (Optional - already configured)
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Application
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

**Note**: Supabase configuration is included in the codebase for demo purposes. Use your own credentials for production.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API routes
│   ├── game/              # Game pages
│   ├── collection/        # Card collection
│   └── profile/           # User profile
├── components/            # React components
│   ├── cards/            # Card-related components
│   ├── game/             # Game components
│   ├── navigation/       # Navigation components
│   └── ui/               # UI components
├── lib/                  # Utilities and services
│   ├── supabase/         # Supabase configuration
│   ├── services/         # External services
│   └── stores/           # State management
└── types/                # TypeScript definitions
```

## 🎮 Game Mechanics

### Card System
- **Rarity Levels**: Common, Rare, Epic, Legendary
- **Problem Types**: Arithmetic, Algebra, Logic, Geometry
- **3D Effects**: Particle systems, shaders, animations

### Battle System
- **Turn-based Combat**: Strategic card selection
- **Problem Solving**: Math problems determine attack power
- **AI Adaptation**: Difficulty adjusts based on performance

### Progression System
- **Elementary Academy** (Ages 8-9): Basic arithmetic
- **Magic School** (Ages 9-10): Advanced math concepts
- **Arcane University** (Ages 10-11): Complex problem solving
- **Superior Dimension** (Ages 11-12): Advanced logic and AI concepts

## 🚀 Deployment

### Vercel (Recommended)

1. **Automatic Deployment**:
   - Connect your GitHub repository to Vercel
   - Push to `main` branch for production deployment
   - Push to other branches for preview deployments

2. **Manual Deployment**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

3. **Supabase Setup**:
   - Follow the [Database Schema Guide](docs/DATABASE_SCHEMA.md)
   - Run migration script in Supabase SQL Editor
   - Configure environment variables with your Supabase credentials

### Performance Optimization

- **Bundle Analysis**: `npm run analyze`
- **Type Checking**: `npm run type-check`

### 🧹 Cache Management

Keep your development environment clean and optimized:

```bash
# Regular cache cleanup (safe, no reinstallation needed)
npm run clean

# Full cleanup including node_modules (requires npm install after)
npm run clean:full
```

**When to use:**
- **Regular cleanup**: Build issues, hot reload problems, before deployment
- **Full cleanup**: Dependency conflicts, major updates, fresh start

**📖 Complete Guide**: See [docs/CACHE_CLEANUP_GUIDE.md](docs/CACHE_CLEANUP_GUIDE.md) for detailed instructions.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npx playwright test
```

## 📚 Documentation

- [Firebase Setup Guide](docs/FIREBASE_SETUP.md) - **Start here for database setup**
- [API Documentation](docs/API.md)
- [Development Guide](docs/DEVELOPMENT.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- [GitHub Issues](https://github.com/your-username/ia-education-platform/issues)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🌟 Acknowledgments

- OpenAI for AI capabilities
- Vercel for hosting and deployment
- Firebase for database services
- Three.js community for 3D graphics support

## AI Service Integration

This project now supports four AI service implementations:

1. **Google AI (Gemini)** - Default implementation using Google's Generative AI models.
2. **Vercel AI SDK with OpenAI** - Alternative implementation using Vercel's AI SDK with OpenAI models.
3. **Hugging Face** - Implementation using Hugging Face's Inference API with models like Mixtral.
4. **Groq** - High-speed inference using Groq's API with models like Mixtral.

### Configuration

To switch between AI providers, set the `AI_PROVIDER` environment variable in your `.env.local` file:

```env
# Use Google AI (Gemini) - Default
AI_PROVIDER="google"
GOOGLEAI_API_KEY="your-google-api-key"

# Use OpenAI via Vercel AI SDK
AI_PROVIDER="openai"
OPENAI_API_KEY="your-openai-api-key"

# Use Hugging Face
AI_PROVIDER="huggingface"
HUGGINGFACE_API_KEY="your-huggingface-api-key"

# Use Groq
AI_PROVIDER="groq"
GROQ_API_KEY="your-groq-api-key"
```

Make sure to replace `"your-*-api-key"` with your actual API keys.

### Implementation Details

All four implementations support the same interface defined in `src/types/ai.ts`, which includes:
- Generating math problems
- Generating logic problems
- Validating prompts
- Providing tutoring
- Generating story elements
- Generating characters
- Generating complete cards

The service factory in `src/lib/services/index.ts` determines which implementation to use based on the `AI_PROVIDER` environment variable.

---

Made with ❤️ for educational innovation 