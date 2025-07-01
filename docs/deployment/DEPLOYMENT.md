# Deployment Guide - Vercel

This guide covers deploying the EduCard AI platform to Vercel.

## Prerequisites

- [Vercel CLI](https://vercel.com/cli) installed globally
- [Node.js](https://nodejs.org/) 18+ installed
- [Git](https://git-scm.com/) repository set up
- Supabase project configured
- OpenAI API key

## Quick Deploy

### 1. Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ia-education-platform)

### 2. Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy "~/ia-education-platform"? [Y/n] y
# ? Which scope do you want to deploy to? [Your Team]
# ? Link to existing project? [y/N] n
# ? What's your project's name? educard-ai
# ? In which directory is your code located? ./
```

## Environment Variables

Set up the following environment variables in your Vercel dashboard:

### Required Variables

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key
OPENAI_ORGANIZATION_ID=org-your-org-id

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=EduCard AI
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Game Configuration
NEXT_PUBLIC_MAX_CARDS_PER_DECK=30
NEXT_PUBLIC_DEFAULT_DIFFICULTY=1
NEXT_PUBLIC_MAX_BATTLE_TIME=300000
```

## Vercel Configuration

The project includes optimized Vercel configuration:

### `vercel.json`
- Optimized for Next.js 14
- 30-second function timeout for AI operations
- Security headers configured
- CORS enabled for API routes

### `next.config.js`
- Three.js webpack configuration
- Image optimization for Supabase
- Security headers
- Bundle optimization

## Database Setup

### 1. Supabase Configuration

```sql
-- Run these SQL commands in your Supabase SQL editor
-- (See DEVELOPMENT.md for complete schema)

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- Create policies (see DEVELOPMENT.md for details)
```

### 2. Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all required variables from `env.example`

## Performance Optimization

### Build Optimization

```bash
# Analyze bundle size
npm run analyze

# Type checking before build
npm run type-check

# Lint and fix issues
npm run lint:fix
```

### Vercel Features Used

- **Edge Functions**: API routes optimized for global performance
- **Image Optimization**: Automatic WebP/AVIF conversion
- **Static Generation**: Pre-rendered pages for better performance
- **Bundle Analyzer**: Monitor bundle size
- **Automatic HTTPS**: SSL certificates managed by Vercel

## Monitoring and Analytics

### Built-in Monitoring

- Vercel Analytics (automatic)
- Function logs in Vercel dashboard
- Performance insights
- Error tracking

### Custom Monitoring

```typescript
// Add to your components for custom analytics
import { track } from '@vercel/analytics';

// Track game events
track('game_started', { difficulty: 1 });
track('problem_solved', { type: 'math', time: 30 });
```

## Deployment Workflow

### Automatic Deployments

1. **Production**: Push to `main` branch
2. **Preview**: Push to any other branch
3. **Development**: Use `vercel dev` locally

### Manual Deployments

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel

# Deploy with specific environment
vercel --env production
```

## Domain Configuration

### Custom Domain

1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### SSL Certificate

Vercel automatically provides SSL certificates for all domains.

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check TypeScript errors
   npm run type-check
   
   # Check linting issues
   npm run lint
   ```

2. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Redeploy after adding variables

3. **Three.js Issues**
   - Ensure `raw-loader` is installed
   - Check webpack configuration in `next.config.js`

4. **API Route Timeouts**
   - OpenAI requests may take time
   - Function timeout set to 30 seconds
   - Implement proper error handling

### Debug Mode

```bash
# Enable debug mode
vercel dev --debug

# Check function logs
vercel logs your-deployment-url
```

## Security Considerations

### Headers

Security headers are configured in both `next.config.js` and `vercel.json`:

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: origin-when-cross-origin
- Permissions-Policy: Restricted camera/microphone

### Environment Variables

- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate API keys regularly
- Use different keys for development/production

## Performance Monitoring

### Core Web Vitals

Monitor these metrics in Vercel Analytics:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimization Tips

1. **Images**: Use Next.js Image component
2. **Fonts**: Preload critical fonts
3. **JavaScript**: Code splitting with dynamic imports
4. **CSS**: Optimize Tailwind CSS purging

## Scaling Considerations

### Function Limits

- **Hobby Plan**: 100GB-hours/month
- **Pro Plan**: 1000GB-hours/month
- **Enterprise**: Custom limits

### Database Scaling

- Monitor Supabase usage
- Implement connection pooling
- Use read replicas for heavy queries

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Project Issues](https://github.com/your-username/ia-education-platform/issues) 